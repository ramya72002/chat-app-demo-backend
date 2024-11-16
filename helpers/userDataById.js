const UserModel = require("../models/UserModel");

const userDataById = async (user_id) => {
  try {
    if (!user_id) {
      return { message: "User ID is required", error: true };
    }

    // Fetch user information from the database using the user_id
    const userInformation = await UserModel.findById(user_id);

    // If user is not found
    if (!userInformation) {
      return { message: "User not found", error: true };
    }

    return { name: userInformation?.name }; // Return user name wrapped in an object
  } catch (error) {
    return { message: error.message || error, error: true };
  }
};

const updateGroupMessages = async (groupMessages) => {
  const updatedGroupMessages = await Promise.all(groupMessages.map(async (message) => {
    // Convert the message to a plain object using toObject()
    const plainMessage = message.toObject ? message.toObject() : message;

    const userResponse = await userDataById(plainMessage.msgByUserId);

    if (!userResponse.error) {
       
      // Create a new object with msgByName and without msgByUserId
      return { 
        ...plainMessage, 
        msgByName: userResponse.name, 
      };
    } else {
       
      // Handle user not found scenario
      return { 
        ...plainMessage, 
        msgByName: "Unknown User", 
      };
    }
  }));

 
  return updatedGroupMessages;
};



module.exports = updateGroupMessages;
