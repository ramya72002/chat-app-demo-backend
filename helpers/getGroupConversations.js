const GroupModel = require('../models/GroupModel');
const { GroupMessageModel } = require("../models/GroupMessageModel");

const getGroupConversations = async (userId) => {
  if (!userId) {
    console.error("Invalid userId provided");
    return [];
  }

  try {
    console.log("Fetching groups for user:", userId);

    // Find all groups where the user is a member
    const userGroups = await GroupModel.find({ members: userId }).populate('members', 'name email'); // Optionally populate members' details
    console.log("User Groups:", userGroups);

    const groupConversations = await Promise.all(
      userGroups.map(async (group) => {
        // Fetch the latest group message for the group
        const latestGroupMessage = await GroupMessageModel.findOne({ groupId: group._id })
          .sort({ timestamp: -1 })
          .populate('message', 'text imageUrl videoUrl seen msgByUserId')
          .populate('senderId', 'name email'); // Populate sender details if needed

        // Calculate unseen messages count for the user
        const unseenMessages = latestGroupMessage
          ? latestGroupMessage.message.filter(msg => !msg.seen && msg.msgByUserId.toString() !== userId).length
          : 0;

        return {
          _id: group._id,
          groupName: group.groupName,
          members: group.members,
          lastMessage: latestGroupMessage?.message[latestGroupMessage.message.length - 1] || null,
          lastMessageTimestamp: latestGroupMessage?.timestamp || null,
          unseenMessages,
        };
      })
    );

    return groupConversations;
  } catch (error) {
    console.error("Error fetching group conversations:", error);
    return [];
  }
};

module.exports = getGroupConversations;
