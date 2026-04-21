import Session from './Session.js';
import LoginEvent from './LoginEvent.js';
import SecurityAlert from './SecurityAlert.js';
import AuditLog from '../admin/AuditLog.js';
import useragent from 'useragent';
import geoip from 'geoip-lite';

export const createSession = async (userId, userModel, refreshToken, req, role) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const agent = useragent.parse(req.headers['user-agent']);
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
  let geo = geoip.lookup(ipAddress);
  
  // Localhost fallback for geoip
  if (!geo && (ipAddress === '127.0.0.1' || ipAddress === '::1')) {
    geo = { country: 'Local', city: 'Localhost' };
  } else if (!geo) {
    geo = { country: 'Unknown', city: 'Unknown' };
  }

  const deviceFingerprint = req.headers['x-device-fingerprint'] || 'unknown';

  // 1. Check for risk detection before creating session
  const previousLogins = await LoginEvent.find({ userId }).sort({ timestamp: -1 }).limit(5);
  let suspiciousFlag = false;

  // Rule 1: New Device
  const knownDevices = previousLogins.map(l => l.deviceFingerprint);
  if (knownDevices.length > 0 && !knownDevices.includes(deviceFingerprint)) {
    suspiciousFlag = true;
    await SecurityAlert.create({
      userId, userModel, type: 'new_device', details: { deviceFingerprint, ipAddress }
    });
  }

  // Rule 2: Impossible Travel (simplified check: different country from last login within short time)
  if (previousLogins.length > 0) {
    const lastLogin = previousLogins[0];
    if (lastLogin.location.country !== geo.country && geo.country !== 'Local' && geo.country !== 'Unknown') {
      const timeDiff = Date.now() - new Date(lastLogin.timestamp).getTime();
      if (timeDiff < 24 * 60 * 60 * 1000) { // less than 24h
        suspiciousFlag = true;
        await SecurityAlert.create({
          userId, userModel, type: 'impossible_travel', 
          details: { previousCountry: lastLogin.location.country, currentCountry: geo.country }
        });
      }
    }
  }

  // Create Session
  const session = new Session({
    userId,
    userModel,
    refreshToken,
    browser: agent.family + ' ' + agent.major,
    os: agent.os.family,
    deviceType: agent.device.family === 'Other' ? 'Desktop' : agent.device.family,
    ipAddress,
    country: geo.country,
    city: geo.city,
    deviceFingerprint,
    expiresAt
  });

  await session.save();

  // Create Login Event
  await LoginEvent.create({
    userId,
    userModel,
    role,
    location: { country: geo.country, city: geo.city, ipAddress },
    device: { 
      browser: agent.family, 
      os: agent.os.family, 
      deviceType: agent.device.family === 'Other' ? 'Desktop' : agent.device.family 
    },
    deviceFingerprint,
    suspiciousFlag,
    status: 'success'
  });

  // Log login action
  await AuditLog.create({
    actorId: userId,
    actorModel: userModel,
    action: 'LOGIN',
    ipAddress,
    userAgent: req.headers['user-agent']
  });

  return session;
};

export const revokeSession = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });
  if (session) {
    session.isRevoked = true;
    await session.save();
    
    await AuditLog.create({
      actorId: session.userId,
      actorModel: session.userModel,
      action: 'LOGOUT',
      details: { sessionId: session._id }
    });
  }
};

export const logFailedLogin = async (email, req) => {
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
  // Attempt to find user
  const mongoose = await import('mongoose');
  const User = mongoose.model('User');
  const user = await User.findOne({ email });

  if (user) {
    // Check for many failed logins
    const recentFailed = await LoginEvent.countDocuments({
      userId: user._id,
      status: 'failed',
      timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // last 15 mins
    });

    if (recentFailed >= 5) {
      await SecurityAlert.create({
        userId: user._id,
        userModel: 'User',
        type: 'many_failed_logins',
        details: { count: recentFailed + 1, ipAddress }
      });
    }

    await LoginEvent.create({
      userId: user._id,
      userModel: 'User',
      location: { ipAddress },
      status: 'failed'
    });
  }
};
