const GroupModel = require('../models/GroupModel')

async function getUserGroups(request, response) {
    try {
        const { userId } = request.query; // Expecting userId as a query parameter
        
        // Fetch all groups the user is part of
        const groups = await GroupModel.find({
            members: userId
        });

        return response.json({
            message: 'User groups retrieved successfully',
            data: groups,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = getUserGroups;
