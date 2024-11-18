const UserModel = require("../models/UserModel");

const userDataById = async (user_id, userCache) => {
  try {
    if (!user_id) {
      return { message: "User ID is required", error: true };
    }

    // Check if user info is cached
    if (userCache[user_id]) {
      return { name: userCache[user_id] };
    }

    // Fetch user information from the database using the user_id
    const userInformation = await UserModel.findById(user_id);

    // If user is not found
    if (!userInformation) {
      return { message: "User not found", error: true };
    }

    // Cache user name to avoid redundant database calls
    userCache[user_id] = userInformation.name;

    return { name: userInformation.name }; // Return user name wrapped in an object
  } catch (error) {
    return { message: error.message || error, error: true };
  }
};

const updateGroupMessages = async (groupMessages) => {
  const userCache = {}; // Cache to store user info to avoid redundant queries

  const updatedGroupMessages = await Promise.all(groupMessages.map(async (message) => {
    // Convert the message to a plain object using toObject()
    const plainMessage = message.toObject ? message.toObject() : message;

    const userResponse = await userDataById(plainMessage.msgByUserId, userCache);

    // Create a new object with msgByName and without msgByUserId
    return { 
      ...plainMessage, 
      msgByName: userResponse.error ? "Unknown User" : userResponse.name,
    };
  }));

  return updatedGroupMessages;
};

module.exports = updateGroupMessages;
