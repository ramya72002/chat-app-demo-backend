const UserModel = require('../models/UserModel')

async function searchUsers(request,response){
    try {
        const { search } = request.body

        const query = new RegExp(search,"i","g")

        const user = await UserModel.find({
            "$or" : [
                { name : query },
                { email : query }
            ]
        }).select("-password")

        return response.json({
            message : 'all users',
            data : user,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true
        })
    }
}

module.exports = searchUsers