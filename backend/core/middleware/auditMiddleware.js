import AuditLog from '../../modules/admin/AuditLog.js';

export const auditAction = (actionName, targetModelExtractor) => {
  return async (req, res, next) => {
    // We hook into the response finish event to ensure the action succeeded before logging
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const targetId = req.params.id || (req.body && req.body.id);
          const targetModel = typeof targetModelExtractor === 'function' ? targetModelExtractor(req) : targetModelExtractor;

          const auditData = req.audit || {};
          
          await AuditLog.create({
            actorId: req.user._id,
            actorModel: req.userModel,
            actorRole: req.user.role,
            action: actionName,
            resource: targetModel,
            resourceId: targetId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            device: auditData.device || req.headers['sec-ch-ua-platform'] || 'Unknown',
            previousState: auditData.previousState,
            newState: auditData.newState,
            notes: auditData.notes,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.method !== 'GET' ? req.body : undefined,
              ...auditData.details
            }
          });
        } catch (err) {
          console.error('Audit Log Failed:', err.message);
        }
      }
    });
    next();
  };
};
