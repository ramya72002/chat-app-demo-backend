const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
  groupName: { type: String, required:  [true, "provide Groupname"]},
  members: [{type : mongoose.Schema.ObjectId,  required : true,  ref : 'User'}],
  createdAt: { type: Date, default: Date.now },
});

const GroupModel = mongoose.model('groups', GroupSchema);
module.exports = GroupModel;
