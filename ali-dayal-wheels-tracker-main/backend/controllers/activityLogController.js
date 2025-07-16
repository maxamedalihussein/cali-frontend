const ActivityLog = require('../models/ActivityLog');

// Create a new activity log entry
exports.createLog = async (req, res) => {
  try {
    const { user, action, entity, entityId, details } = req.body;
    const log = new ActivityLog({ user, action, entity, entityId, details });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create activity log' });
  }
};

// Get recent activity logs (optionally filter by user, entity, or action)
exports.getLogs = async (req, res) => {
  try {
    const { user, entity, action, limit = 20 } = req.query;
    const filter = {};
    if (user) filter.user = user;
    if (entity) filter.entity = entity;
    if (action) filter.action = action;
    const logs = await ActivityLog.find(filter).sort({ timestamp: -1 }).limit(Number(limit));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
}; 