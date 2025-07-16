const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: String, required: true }, // username or user email
  action: { type: String, required: true }, // e.g., 'create', 'update', 'delete', 'login', 'export'
  entity: { type: String, required: true }, // e.g., 'Car', 'Sale', 'User', 'Settings'
  entityId: { type: String }, // optional, e.g., car ID
  timestamp: { type: Date, default: Date.now },
  details: { type: Object }, // additional info (optional)
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema); 