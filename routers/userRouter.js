const express = require('express');
const { userlogin, usersignup } = require('../controllers/userController');
const userModel = require('../models/userModel')
const router = express.Router();

router.get('/userlogin',userlogin)
router.get('/usersignup',usersignup)

router.post('/usersignup',)






module.exports = router;