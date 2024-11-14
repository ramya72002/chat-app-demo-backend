const GroupModel = require('../models/GroupModel')
const { GroupMessageModel, GroupDetailMessageModel } = require("../models/GroupMessageModel");

const getGroupConversations = async (userId) => {
  if (userId) {
    try {
      console.log("Fetching groups for user:", userId);

      // Ensure GroupModel is defined
      if (!GroupModel) {
        console.error("GroupModel is not defined");
      }

      // Find the groups where the user is a member
      const userGroups = await GroupModel.find({ members: userId });
      console.log("User Groups:", userGroups);

      const groupConversations = [];

      // For each group, fetch the latest group message
      for (const group of userGroups) {
        const latestGroupMessage = await GroupMessageModel.findOne({ groupId: group._id }).sort({ timestamp: -1 });

        // You can also fetch group detail messages, if needed
        // const latestGroupDetailMessage = await GroupDetailMessageModel.find({ groupId: group._id }).sort({ createdAt: -1 });

        groupConversations.push({
          _id: group._id,
          groupName: group.groupName,
          members: group.members,
          lastMessage: latestGroupMessage ? latestGroupMessage.message : null,
          lastMessageTimestamp: latestGroupMessage ? latestGroupMessage.timestamp : null
        });
      }

      return groupConversations;
    } catch (error) {
      console.error("Error fetching group conversations:", error);
      return [];
    }
  } else {
    console.error("Invalid userId provided");
    return [];
  }
};

module.exports = getGroupConversations;
