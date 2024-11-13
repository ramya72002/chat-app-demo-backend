const GroupModel = require('../models/GroupModel');

async function addMembersTOGroup(req, res) {
    try {
        const { groupId, members } = req.body;

        // Check if `members` is an array before proceeding
        if (!Array.isArray(members)) {
            return res.status(400).json({ message: "Members should be an array", error: true });
        }

        // Find the group and add the new members to it
        const group = await GroupModel.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found", error: true });
        }

        // Ensure `group.members` is an array before concatenating
        group.members = Array.isArray(group.members) ? group.members.concat(members) : [...members];
        
        await group.save();

        return res.json({
            message: 'Members added successfully',
            data: group,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = addMembersTOGroup;
