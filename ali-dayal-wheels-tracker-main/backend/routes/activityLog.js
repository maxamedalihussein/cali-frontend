const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');

// POST /api/activity-log - create a new log entry
router.post('/', activityLogController.createLog);

// GET /api/activity-log - get recent logs
router.get('/', activityLogController.getLogs);

module.exports = router; 