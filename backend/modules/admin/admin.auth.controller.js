import Admin from './Admin.js';
import AuditLog from './AuditLog.js';
import { generateAccessToken, generateRefreshToken } from '../../core/utils/jwt.js';
import { createSession, revokeSession } from '../sessions/session.service.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { isStrongPassword } from '../../core/utils/validation.js';

const sendTokenResponse = async (admin, statusCode, req, res) => {
  const accessToken = generateAccessToken(admin._id, admin.role, 'Admin');
  const refreshToken = generateRefreshToken(admin._id, admin.role, 'Admin');

  await createSession(admin._id, 'Admin', refreshToken, req, admin.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    accessToken,
    admin: {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  });
};

const send2FAEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: '"Authra Admin Security" <security@authra.com>',
    to: email,
    subject: 'Your Admin Login OTP',
    text: `Your One-Time Password for admin login is: ${otp}. It will expire in 5 minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Mock] Sent OTP ${otp} to ${email}`);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Check if account is locked
    if (admin.accountLockedUntil && admin.accountLockedUntil > Date.now()) {
      return res.status(403).json({ message: `Account is locked. Try again later.` });
    }

    if (!(await admin.comparePassword(password))) {
      admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
      if (admin.failedLoginAttempts >= 5) {
        admin.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
        await AuditLog.create({
          actorId: admin._id, actorModel: 'Admin', action: 'ACCOUNT_LOCKED', 
          details: { reason: 'Too many failed login attempts' }, ipAddress: req.ip
        });
      }
      await admin.save({ validateBeforeSave: false });
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Admin account is deactivated' });
    }

    admin.failedLoginAttempts = 0;

    if (admin.twoFactorEnabled) {
      // Check cooldown
      if (admin.otpResendCooldown && admin.otpResendCooldown > Date.now()) {
        const remainingSeconds = Math.ceil((admin.otpResendCooldown - Date.now()) / 1000);
        return res.status(429).json({ message: `Please wait ${remainingSeconds}s before requesting a new OTP` });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Hash OTP before saving to DB
      admin.otp = crypto.createHash('sha256').update(otp).digest('hex');
      admin.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
      admin.otpResendCooldown = Date.now() + 60 * 1000; // 1 minute cooldown
      admin.failedOtpAttempts = 0; // Reset on new request
      await admin.save({ validateBeforeSave: false });

      await send2FAEmail(admin.email, otp);

      // Log OTP generation
      await AuditLog.create({
        actorId: admin._id, actorModel: 'Admin', action: 'OTP_REQUESTED', ipAddress: req.ip
      });

      return res.status(200).json({
        status: 'pending',
        message: 'OTP sent to registered email. Please verify.'
      });
    }

    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });

    await sendTokenResponse(admin, 200, req, res);
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid request' });
    }

    if (admin.accountLockedUntil && admin.accountLockedUntil > Date.now()) {
      return res.status(403).json({ message: `Account is locked. Try again later.` });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    if (admin.otp !== hashedOTP || !admin.otpExpires || admin.otpExpires < Date.now()) {
      admin.failedOtpAttempts += 1;
      
      // Lock after 5 failed attempts
      if (admin.failedOtpAttempts >= 5) {
        admin.accountLockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
        admin.otp = undefined;
        admin.otpExpires = undefined;
        
        await AuditLog.create({
          actorId: admin._id, actorModel: 'Admin', action: 'ACCOUNT_LOCKED', 
          details: { reason: 'Too many failed OTP attempts' }, ipAddress: req.ip
        });
      }
      
      await admin.save({ validateBeforeSave: false });

      return res.status(401).json({ message: admin.failedOtpAttempts >= 5 ? 'Account locked due to too many failed attempts' : 'OTP is invalid or has expired' });
    }

    // Clear OTP fields
    admin.otp = undefined;
    admin.otpExpires = undefined;
    admin.otpResendCooldown = undefined;
    admin.failedOtpAttempts = 0;
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });

    await sendTokenResponse(admin, 200, req, res);
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

export const adminLogout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await revokeSession(refreshToken);
  }
  
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success', message: 'Admin logged out successfully' });
};

export const setupSuperAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.' });
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({ message: 'Setup already completed. Initial admin exists.' });
    }

    const newAdmin = await Admin.create({
      email,
      password,
      name,
      role: 'super_admin'
    });

    res.status(201).json({ status: 'success', message: 'Super admin created successfully', admin: { email: newAdmin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Setup failed', error: error.message });
  }
};
