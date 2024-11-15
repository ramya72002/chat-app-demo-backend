const { GroupMessageModel, GroupDetailMessageModel } = require("../models/GroupMessageModel");

const getGroupMessages = async (groupId) => {
  try {
    // Step 1: Get group messages from GroupMessageModel by groupId
    const groupMessages = await GroupMessageModel.find({ groupId }).exec();
    console.log("Group Messages:", groupMessages);  // Debugging

    if (!groupMessages || groupMessages.length === 0) {
      console.log("No group messages found for groupId:", groupId);
      return [];
    }

    // Step 2: Collect all the message ObjectIds from the retrieved group messages
    const messageIds = groupMessages.flatMap(groupMessage => groupMessage.message);
    console.log("Message IDs:", messageIds);  // Debugging

    // Step 3: Fetch all the group detail messages using the collected messageIds
    const groupDetailMessages = await GroupDetailMessageModel.find({ '_id': { $in: messageIds } }).exec();
    console.log("Group Detail Messages:", groupDetailMessages);  // Debugging

    if (!groupDetailMessages || groupDetailMessages.length === 0) {
      console.log("No group detail messages found");
      return [];
    }

    // Return only groupDetailMessages
    return groupDetailMessages;
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return [];
  }
};

module.exports = getGroupMessages;
