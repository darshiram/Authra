import { verifyAccessToken } from '../utils/jwt.js';
import User from '../../modules/users/User.js';
import Admin from '../../modules/admin/Admin.js';
import { getCache, setCache } from '../utils/cache.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken; // fallback to cookie
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = verifyAccessToken(token);
    const cacheKey = `user_${decoded.model}_${decoded.id}`;
    let currentUser = getCache(cacheKey);

    if (!currentUser) {
      if (decoded.model === 'Admin') {
        currentUser = await Admin.findById(decoded.id).select('-password').lean();
      } else {
        currentUser = await User.findById(decoded.id).select('-password').lean();
      }
      
      if (currentUser) {
        setCache(cacheKey, currentUser, 60); // Cache for 60 seconds
      }
    }

    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({ message: 'The user belonging to this token no longer exists or is inactive.' });
    }

    req.user = currentUser;
    req.userModel = decoded.model;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};
