const GroupModel = require('../models/GroupModel'); // Assuming you have a Group model

async function createGroup(request, response) {
    try {
        
        const { groupName, members } = request.body; // Expecting groupName and an array of members
        console.log(request.body)
        // Ensure the group name is not empty
        if (!groupName || groupName.trim() === '') {
            return response.status(400).json({
                message: 'Group name is required',
                error: true
            });
        }

        // Ensure members are provided and not empty
        if (!members || members.length === 0) {
            return response.status(400).json({
                message: 'At least one member is required to create a group',
                error: true
            });
        }

        // Ensure that there are no duplicate members
        const uniqueMembers = [...new Set(members)];
        if (uniqueMembers.length !== members.length) {
            return response.status(400).json({
                message: 'Duplicate members are not allowed',
                error: true
            });
        }

        // Optionally, ensure that the current user is part of the group (if request.user is set)
        // const currentUser = request.user._id; // Assuming you're using some authentication middleware
        // if (!members.includes(currentUser)) {
        //     return response.status(400).json({
        //         message: 'The current user must be part of the group',
        //         error: true
        //     });
        // }

        // Create a new group document
        const newGroup = new GroupModel({
            groupName,
            members
        });

        await newGroup.save();

        return response.json({
            message: 'Group created successfully',
            data: newGroup,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = createGroup;
