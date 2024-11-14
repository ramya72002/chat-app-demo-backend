const mongoose = require('mongoose');
const GroupDetailMessageSchema = new mongoose.Schema({
  text : {
      type : String,
      default : ""
  },
  imageUrl : {
      type : String,
      default : ""
  },
  videoUrl : {
      type : String,
      default : ""
  },
  seen : {
      type : Boolean,
      default : false
  },
  msgByUserId : {
      type : mongoose.Schema.ObjectId,
      required : true,
      ref : 'User'
  }
},{
  timestamps : true
})


const groupMessageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const GroupDetailMessageModel=mongoose.model('groupdetailmessage',GroupDetailMessageSchema)
const GroupMessageModel = mongoose.model('groupmessages', groupMessageSchema);

module.exports = { GroupMessageModel ,
                   GroupDetailMessageModel
};
