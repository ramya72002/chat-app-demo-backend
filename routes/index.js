const express = require('express')
const registerUser = require('../controller/registerUser')
const checkEmail = require('../controller/checkEmail')
const checkPassword = require('../controller/checkPassword')
const userDetails = require('../controller/userDetails')
const logout = require('../controller/logout')
const updateUserDetails = require('../controller/updateUserDetails')
const searchUser = require('../controller/searchUser')
const searchUsers = require('../controller/searchUsers')
const sendEmails = require('../controller/sendEmails')
const sendSms = require('../controller/sendSms')
const handleSendSms = require('../controller/sendSms')
const createGroup = require('../controller/createGroup')
const getUserGroups = require('../controller/getUserGroups') // Controller for getting user's groups
const addMembersToGroup = require('../controller/addMembersToGroup') // Controller for adding members to a group
const removeMembersFromGroup = require('../controller/removeMembersFromGroup') // Controller for removing members from a group
const sendGroupMessage = require('../controller/sendGroupMessage') // Controller for sending a group message
const getGroupMessages = require('../controller/getGroupMessages')

const router = express.Router()

//create user api
router.post('/register',registerUser)
//check user email
router.post('/email',checkEmail)
//check user password
router.post('/password',checkPassword)
//login user details
router.get('/user-details',userDetails)
//logout user
router.get('/logout',logout)
//update user details
router.post('/update-user',updateUserDetails)
//search user
router.post("/search-user",searchUser)
router.post("/search-users",searchUsers)
router.post("/sendEmails",sendEmails)

router.post("/sendSms",sendSms)
router.post("/send_sms",handleSendSms)
// Create a group
router.post('/create-group', createGroup)


// Get user groups API
router.get('/user-groups', getUserGroups)

// Add members to group API
router.post('/add-members', addMembersToGroup)

// Remove members from group API
router.post('/remove-members', removeMembersFromGroup)

// Send group message API
router.post('/send-group-message', sendGroupMessage)

// Get group messages API
router.get('/group-messages', getGroupMessages)


module.exports = router