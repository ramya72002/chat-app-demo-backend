const GroupMessageModel = require('../models/GroupMessageModel')

async function getGroupMessages(request, response) {
    try {
        const { groupId } = request.query; // Expecting groupId as a query parameter
        
        // Fetch all messages for the given group
        const messages = await GroupMessageModel.find({
            groupId
        }).populate('senderId', 'name email'); // Optionally populate sender info

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
