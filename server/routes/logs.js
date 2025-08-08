const express = require('express');
const router = express.Router();
const LinkLog = require('../models/LinkLog');

router.post('/', async (req, res) => {
  const { url, result, timestamp, userId } = req.body;
  try {
    const log = new LinkLog({ url, result, timestamp, userId });
    await log.save();
    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// GET /api/log - fetch all logs
router.get('/', async (req, res) => {
  try {
    const logs = await LinkLog.find().sort({ timestamp: -1 }); // most recent first
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
