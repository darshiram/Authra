import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev_access_secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

export const generateAccessToken = (userId, role, model) => {
  return jwt.sign(
    { id: userId, role, model },
    accessSecret,
    { expiresIn: '15m' } // Short-lived access token
  );
};

export const generateRefreshToken = (userId, role, model) => {
  return jwt.sign(
    { id: userId, role, model },
    refreshSecret,
    { expiresIn: '7d' } // Long-lived refresh token
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, accessSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshSecret);
};
