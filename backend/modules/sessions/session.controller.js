import Session from './Session.js';
import LoginEvent from './LoginEvent.js';
import SecurityAlert from './SecurityAlert.js';
import { revokeSession } from './session.service.js';

export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ 
      userId: req.user.id, 
      isRevoked: false, 
      expiresAt: { $gt: new Date() } 
    }).sort({ lastActive: -1 });

    const formattedSessions = sessions.map(s => ({
      id: s._id,
      browser: s.browser,
      os: s.os,
      deviceType: s.deviceType,
      ipAddress: s.ipAddress ? `${s.ipAddress.split('.').slice(0, 2).join('.')}.*.*` : 'Unknown',
      country: s.country,
      city: s.city,
      lastActive: s.lastActive,
      createdAt: s.createdAt,
      isCurrent: req.cookies.refreshToken === s.refreshToken
    }));

    res.status(200).json({ status: 'success', data: formattedSessions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
};

export const getLoginHistory = async (req, res) => {
  try {
    const history = await LoginEvent.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);
      
    res.status(200).json({ status: 'success', data: history });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch login history', error: error.message });
  }
};

export const getSecurityAlerts = async (req, res) => {
  try {
    const alerts = await SecurityAlert.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.status(200).json({ status: 'success', data: alerts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch security alerts', error: error.message });
  }
};

export const logoutDevice = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOne({ _id: sessionId, userId: req.user.id });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await revokeSession(session.refreshToken);
    res.status(200).json({ status: 'success', message: 'Device logged out' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to logout device', error: error.message });
  }
};

export const logoutAllExceptCurrent = async (req, res) => {
  try {
    const currentRefreshToken = req.cookies.refreshToken;
    const sessions = await Session.find({ 
      userId: req.user.id, 
      refreshToken: { $ne: currentRefreshToken },
      isRevoked: false 
    });

    for (let session of sessions) {
      await revokeSession(session.refreshToken);
    }

    res.status(200).json({ status: 'success', message: 'All other devices logged out' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to logout devices', error: error.message });
  }
};
