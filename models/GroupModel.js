const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupName: { type: String, required:  [true, "provide Groupname"]},
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const GroupModel = mongoose.model('Group', GroupSchema);
module.exports = GroupModel;
