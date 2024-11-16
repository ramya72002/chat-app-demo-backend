const express = require('express')
const { Server } = require('socket.io')
const http  = require('http')
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
const updateGroupMessages = require('../helpers/userDataById')

const UserModel = require('../models/UserModel')
const { ConversationModel,MessageModel } = require('../models/ConversationModel')
const getConversation = require('../helpers/getConversation')
const getGroupConversations = require('../helpers/getGroupConversations')
const getGroupMessages= require('../helpers/getGroupMessages')
const GroupModel=require('../models/GroupModel')
const {  GroupMessageModel , GroupDetailMessageModel } = require('../models/GroupMessageModel')

const app = express()

/***socket connection */
const server = http.createServer(app)
const io = new Server(server,{
    cors : {
        origin : process.env.FRONTEND_URL,
        credentials : true
    }
})

/***
 * socket running at http://localhost:8080/
 */

//online user
const onlineUser = new Set()

io.on('connection',async(socket)=>{
    console.log("connect User ", socket.id)

    const token = socket.handshake.auth.token 

    //current user details 
    const user = await getUserDetailsFromToken(token)

    //create a room
    socket.join(user?._id.toString())
    onlineUser.add(user?._id?.toString())

    io.emit('onlineUser',Array.from(onlineUser))

    socket.on('message-page',async(userId)=>{
        console.log('userId123456',userId)
        const userDetails = await UserModel.findById(userId).select("-password")
        
        const payload = {
            _id : userDetails?._id,
            name : userDetails?.name,
            email : userDetails?.email,
            phone:userDetails?.phone,
            provider:userDetails?.provider,
            profile_pic : userDetails?.profile_pic,
            online : onlineUser.has(userId)
        }
        socket.emit('message-user',payload)


         //get previous message
         const getConversationMessage = await ConversationModel.findOne({
            "$or" : [
                { sender : user?._id, receiver : userId },
                { sender : userId, receiver :  user?._id}
            ]
        }).populate('messages').sort({ updatedAt : -1 })

        socket.emit('message',getConversationMessage?.messages || [])
    })

    socket.on('group-message-page',async(userId,groupId)=>{
        const groupName = await GroupModel.findById(groupId);
        socket.emit('group-name', groupName);

       
        const groupDetails = await GroupMessageModel.find({ groupId: groupId });
 
    if (!groupDetails) {
      console.log('Group not found');
      return;
    }

    // Step 2: Get all messages for the given groupId using the getGroupMessages function
    const groupMessages = await getGroupMessages(groupId);
  
    const updatedGroupMessages=await updateGroupMessages(groupMessages)
 
    // Step 3: Emit the group messages back to the client
    socket.emit('group-message-user', updatedGroupMessages);
    console.log('groupMessagesInDetail', updatedGroupMessages);

    })


    //new message
    socket.on('new message',async(data)=>{

        //check conversation is available both user

        let conversation = await ConversationModel.findOne({
            "$or" : [
                { sender : data?.sender, receiver : data?.receiver },
                { sender : data?.receiver, receiver :  data?.sender}
            ]
        })

        //if conversation is not available
        if(!conversation){
            const createConversation = await ConversationModel({
                sender : data?.sender,
                receiver : data?.receiver
            })
            conversation = await createConversation.save()
        }
        
        const message = new MessageModel({
          text : data.text,
          imageUrl : data.imageUrl,
          videoUrl : data.videoUrl,
          msgByUserId :  data?.msgByUserId,
        })
        const saveMessage = await message.save()

        const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
            "$push" : { messages : saveMessage?._id }
        })

        const getConversationMessage = await ConversationModel.findOne({
            "$or" : [
                { sender : data?.sender, receiver : data?.receiver },
                { sender : data?.receiver, receiver :  data?.sender}
            ]
        }).populate('messages').sort({ updatedAt : -1 })


        io.to(data?.sender).emit('message',getConversationMessage?.messages || [])
        io.to(data?.receiver).emit('message',getConversationMessage?.messages || [])

        //send conversation
        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)

        io.to(data?.sender).emit('conversation',conversationSender)
        io.to(data?.receiver).emit('conversation',conversationReceiver)
    })

    
    socket.on('new group message', async (data) => {
        try {
            // Check if the group exists
            const group = await GroupModel.findById(data?.groupId);

        // If the group does not exist, you can send an error message
            if (!group) {
                return io.to(data?.sender).emit('message error', 'Group not found.');
            }
    
            // Create a new GroupDetailMessage
            const groupDetailMessage = new GroupDetailMessageModel({
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                msgByUserId: data?.msgByUserId,
            });
    
            // Save the GroupDetailMessage
            const savedGroupDetailMessage = await groupDetailMessage.save();
    
            // Create a new GroupMessage and link it to the group
            const groupMessage = new GroupMessageModel({
                groupId: data?.groupId,
                senderId: data?.msgByUserId,
                message: [savedGroupDetailMessage._id], // Referencing the groupDetailMessage
            });
    
            // Save the GroupMessage
            const savedGroupMessage = await groupMessage.save();
    
            // Populate the group conversation with messages
            const updatedGroupMessages = await GroupMessageModel.find({ groupId: data?.groupId })
                .populate('message')
                .sort({ updatedAt: -1 });
            const messagesList = updatedGroupMessages.map(groupMessage => groupMessage.message[0]);
            const updatedmessagesList=await updateGroupMessages(messagesList)

    
            // Emit the updated group messages to all members
            group.members.forEach((memberId) => {
    
                // Ensure the memberId is properly converted to string for Socket.IO rooms
                io.to(memberId.toString()).emit('group-message-user', updatedmessagesList);
            });
    
        } catch (error) {
            console.error("Error handling new group message:", error);
            io.to(data?.sender).emit('message error', 'An error occurred while sending the message.');
        }
    });



    //sidebar
    socket.on('sidebar',async(currentUserId)=>{
        console.log("current user",currentUserId)

        const conversation = await getConversation(currentUserId)

        socket.emit('conversation',conversation)
        const groupconversations=await getGroupConversations(currentUserId)
         socket.emit('fetch-user-groups',groupconversations)
        
    })

    socket.on('seen',async(msgByUserId)=>{
        
        let conversation = await ConversationModel.findOne({
            "$or" : [
                { sender : user?._id, receiver : msgByUserId },
                { sender : msgByUserId, receiver :  user?._id}
            ]
        })

        const conversationMessageId = conversation?.messages || []

        const updateMessages  = await MessageModel.updateMany(
            { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
            { "$set" : { seen : true }}
        )

        //send conversation
        const conversationSender = await getConversation(user?._id?.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id?.toString()).emit('conversation',conversationSender)
        io.to(msgByUserId).emit('conversation',conversationReceiver)
    })

    socket.on('fetch-user-groups', async (userId) => {
        console.log("Received fetch-user-groups with userId:", userId);
        try {
            // Fetch the groups where the user is a member
            const groups = await GroupModel.find({ members: userId }).lean(); // `.lean()` makes the result plain JavaScript objects
    
            // Map groups to convert ObjectIds to strings
            const formattedGroups = groups.map(group => {
                return {
                    ...group,
                    _id: group._id.toString(),  // Convert ObjectId to string
                    members: group.members.map(memberId => memberId.toString()), // Convert each member's ObjectId to string
                };
            });
    
            console.log("bbb groups received:", formattedGroups);
            socket.emit('user-groups', formattedGroups);  // Send groups back to the client
        } catch (error) {
            console.error('Error fetching user groups:', error);
            socket.emit('user-groups', []); // Send empty array if error occurs
        }
    });
    

    //disconnect
    socket.on('disconnect',()=>{
        onlineUser.delete(user?._id?.toString())
        console.log('disconnect user ',socket.id)
    })
})

module.exports = {
    app,
    server
}

