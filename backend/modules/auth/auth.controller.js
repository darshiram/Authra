import User from '../users/User.js';
import Organization from '../orgs/Org.js';
import { generateAccessToken, generateRefreshToken } from '../../core/utils/jwt.js';
import { createSession, revokeSession, logFailedLogin } from '../sessions/session.service.js';
import mongoose from 'mongoose';

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
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const newUser = await User.create({ email, password, firstName, lastName, role: 'user' });
    
    await sendTokenResponse(newUser, 'User', 201, req, res);
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const registerOrganization = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { orgName, domain, email, password, firstName, lastName } = req.body;
    
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) throw new Error('Email already in use');

    // Create Owner User
    const newOwner = new User({ email, password, firstName, lastName, role: 'organization_owner' });
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

    await sendTokenResponse(newOwner, 'User', 201, req, res);
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
    
    if (!user || !(await user.comparePassword(password))) {
      await logFailedLogin(email, req);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

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
