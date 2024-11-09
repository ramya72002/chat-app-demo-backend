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


module.exports = router