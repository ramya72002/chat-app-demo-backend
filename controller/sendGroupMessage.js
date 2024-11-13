const GroupMessageModel = require('../models/GroupMessageModel') // Assuming you have a GroupMessage model

async function sendGroupMessage(request, response) {
    try {
        const { groupId, senderId, message } = request.body; // Expecting groupId, senderId, and message

        // Create a new message and save it to the database
        const newMessage = new GroupMessageModel({
            groupId,
            senderId,
            message
        });

        await newMessage.save();

        return response.json({
            message: 'Message sent successfully',
            data: newMessage,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = sendGroupMessage;
