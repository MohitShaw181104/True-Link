const mongoose = require('mongoose');

const linkLogSchema = new mongoose.Schema({
  url: String,
  result: String,
  timestamp: Date,
  userId: String
});

module.exports = mongoose.model('LinkLog', linkLogSchema);
