const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },  // Link to the Group
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Link to the Sender
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },  // Timestamp for when the message is sent
});

const GroupMessageModel = mongoose.model('GroupMessage', GroupMessageSchema);
module.exports =  GroupMessageModel ;
