const { GroupMessageModel, GroupDetailMessageModel } = require("../models/GroupMessageModel");
const GroupModel = require('../models/GroupModel');

const getGroupConversations = async (userId) => {
  if (!userId) {
    console.error("Invalid userId provided");
    return [];
  }

  try {
    console.log("Fetching groups for user:", userId);

    // Fetch all groups where the user is a member
    const userGroups = await GroupModel.find({ members: userId }).populate('members', 'name email');

    if (!userGroups.length) {
      console.log("User is not part of any groups");
      return [];
    }

    // Fetch all group messages for the user's groups
    const groupIds = userGroups.map(group => group._id);

    // Aggregate to find unseen messages per group
    const groupConversations = await Promise.all(
      userGroups.map(async (group) => {
        // Fetch group messages for the current group
        const groupMessages = await GroupMessageModel.find({ groupId: group._id })
          .populate({
            path: 'message',
            populate: {
              path: 'msgByUserId', // Populate message sender info if needed
              select: 'name email'
            }
          });

        // Calculate the unseen message count for the user in the current group
        let unseenMessages = 0;

        groupMessages.forEach((groupMessage) => {
          groupMessage.message.forEach((message) => {
            // If the userId is NOT in the seenBy array, it's an unseen message
            if (!message.seenBy.includes(userId)) {
              unseenMessages++;
            }
          });
        });

        // Get the latest message in the group
        const latestMessage = groupMessages.length > 0
          ? groupMessages[groupMessages.length - 1].message[groupMessages[0].message.length - 1]// Latest message in this group
          : null;

        return {
          _id: group._id,
          groupName: group.groupName,
          members: group.members,
          lastMessage: latestMessage,
          lastMessageTimestamp: latestMessage ? latestMessage.createdAt : null,
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
