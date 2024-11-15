const { GroupMessageModel } = require('../models/GroupMessageModel'); // Import models
const { GroupDetailMessageModel } = require('../models/GroupMessageModel');

async function getGroupMessages(request, response) {
    try {
        const { groupId } = request.query; // Extract groupId from query parameters

        if (!groupId) {
            return response.status(400).json({
                message: 'groupId is required',
                success: false
            });
        }

        // Fetch all messages for the given group, with full details from GroupDetailMessageModel
        const messages = await GroupMessageModel.find({ groupId })
            .populate('senderId', 'name email') // Populate sender info (name and email)
            .populate({
                path: 'message', // Populate message details
                model: 'groupdetailmessage',
                select: 'text imageUrl videoUrl seen msgByUserId createdAt updatedAt __v' // Include necessary fields
            });

        return response.json({
            message: 'Group messages retrieved successfully',
            data: messages,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = getGroupMessages;
