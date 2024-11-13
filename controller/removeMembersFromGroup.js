const GroupModel = require('../models/GroupModel');

async function removeMembersFromGroup(request, response) {
    try {
        const { groupId, membersToRemove } = request.body;

        // Find the group
        const group = await GroupModel.findById(groupId);

        if (!group) {
            return response.status(404).json({
                message: 'Group not found',
                error: true
            });
        }

        console.log("Original members:", group.members);
        console.log("Members to remove:", membersToRemove);

        // Convert members to strings for comparison
        const membersToRemoveStr = membersToRemove.map(member => member.toString());
        group.members = group.members
            .map(member => member.toString())
            .filter(member => !membersToRemoveStr.includes(member));

        await group.save();

        console.log("Updated members after removal:", group.members);

        return response.json({
            message: 'Members removed from the group successfully',
            data: group,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = removeMembersFromGroup;
