import User from '../users/User.js';
import Organization from '../orgs/Org.js';
import { generateAccessToken, generateRefreshToken } from '../../core/utils/jwt.js';
import { createSession, revokeSession, logFailedLogin } from '../sessions/session.service.js';
import mongoose from 'mongoose';
import { isStrongPassword } from '../../core/utils/validation.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const verifyUrl = `http://localhost:5173/verify-email?token=${token}`;

  const mailOptions = {
    from: '"Authra Security" <security@authra.com>',
    to: email,
    subject: 'Verify Your Email',
    text: `Please verify your email by clicking the following link: ${verifyUrl}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Mock] Sent verification link to ${email}: ${verifyUrl}`);
  } catch (err) {
    console.error('Failed to send verification email:', err);
  }
};

const sendTokenResponse = async (user, model, statusCode, req, res) => {
  const accessToken = generateAccessToken(user._id, user.role, model);
  const refreshToken = generateRefreshToken(user._id, user.role, model);

  await createSession(user._id, model, refreshToken, req, user.role);

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
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId
    }
  });
};

export const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const newUser = await User.create({ 
      email, password, firstName, lastName, role: 'user',
      verificationToken: hashedToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({ status: 'success', message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const registerOrganization = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orgName, domain, email, password, firstName, lastName } = req.body;
    
    if (!isStrongPassword(password)) {
      throw new Error('Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.');
    }

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) throw new Error('Email already in use');

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Create Owner User
    const newOwner = new User({ 
      email, password, firstName, lastName, role: 'organization_owner',
      verificationToken: hashedToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    await newOwner.save({ session });

    // Create Organization
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newOrg = new Organization({
      name: orgName,
      slug,
      domain,
      ownerId: newOwner._id
    });
    await newOrg.save({ session });

    // Link Org to User
    newOwner.organizationId = newOrg._id;
    await newOwner.save({ session });

    await session.commitTransaction();
    session.endSession();

    await sendVerificationEmail(newOwner.email, verificationToken);

    res.status(201).json({ status: 'success', message: 'Organization registration successful. Please check your email to verify your account.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: 'Organization registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      await logFailedLogin(email, req);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
      return res.status(403).json({ message: 'Account is locked due to multiple failed login attempts. Please try again later.' });
    }

    if (!(await user.comparePassword(password))) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
      }
      await user.save({ validateBeforeSave: false });
      await logFailedLogin(email, req);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email address before logging in' });
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    await sendTokenResponse(user, 'User', 200, req, res);
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await revokeSession(refreshToken);
  }
  
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', message: 'Email successfully verified. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Email verification failed', error: error.message });
  }
};
