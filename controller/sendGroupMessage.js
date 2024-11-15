const {GroupMessageModel} = require('../models/GroupMessageModel'); // Assuming you have a GroupMessage model
const {GroupDetailMessageModel} = require('../models/GroupMessageModel');

async function sendGroupMessage(request, response) {
    try {
        const { groupId, senderId, text, imageUrl, videoUrl } = request.body; // Expecting groupId, senderId, and message details

        // Create a new GroupDetailMessage and save it to the database
        const newDetailMessage = new GroupDetailMessageModel({
            text,
            imageUrl,
            videoUrl,
            msgByUserId: senderId
        });
        await newDetailMessage.save();

        // Create a new GroupMessage and link it to the GroupDetailMessage
        const newMessage = new GroupMessageModel({
            groupId,
            senderId,
            message: [newDetailMessage._id] // Reference the detail message
        });
        await newMessage.save();

        return response.json({
            message: 'Message sent successfully',
            data: {
                groupMessage: newMessage,
                messageDetails: newDetailMessage
            },
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
