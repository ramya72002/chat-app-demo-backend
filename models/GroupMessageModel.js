const mongoose = require('mongoose');

// Schema for individual group message details
const GroupDetailMessageSchema = new mongoose.Schema({
  text: {
    type: String,
    default: ""
  },
  imageUrl: {
    type: String,
    default: ""
  },
  videoUrl: {
    type: String,
    default: ""
  },
  seenBy: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User' // References the User schema
    }
  ],
  msgByUserId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User' // References the User schema
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Schema for group messages
const groupMessageSchema = new mongoose.Schema({
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group' // References the Group schema
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // References the User schema
  },
  message: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'groupdetailmessage' // References GroupDetailMessageModel
    }
  ],
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Models
const GroupDetailMessageModel = mongoose.model('groupdetailmessage', GroupDetailMessageSchema);
const GroupMessageModel = mongoose.model('groupmessages', groupMessageSchema);

module.exports = { 
  GroupMessageModel,
  GroupDetailMessageModel
};
