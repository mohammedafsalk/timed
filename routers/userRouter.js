const express = require('express');
const { getUserLogin, getUserSignup, getSignupOtp, userSignup, signupOtp, getHome, getLogout, login, getForgetPassword, forgetpassword, forgetOtp, getOtp, getnewpassword, newpassword, getCheckout, getCart, getProduct, getShopPage, getWishlist, getorderHistory, getUserProfile, getaddAddress, addAddress, deleteAddress } = require('../controllers/userController');
const userModel = require('../models/userModel')
const router = express.Router();

router.get('/login',getUserLogin)
router.get('/signup',getUserSignup)
router.get('/signup/otp',getSignupOtp)
router.get('/',getHome)
router.get('/product-list',getShopPage)
router.get('/product/:id',getProduct)
router.get('/cart',getCart)
router.get('/wishlist',getWishlist)
router.get('/checkout',getCheckout)
router.get('/logout',getLogout)
router.get('/forgotpassword',getForgetPassword)
router.get('/forgotpassword/otp',getOtp)
router.get('/forgotpassword/newpassword',getnewpassword)
router.get('/orderhistory',getorderHistory)
router.get('/userprofile',getUserProfile)
router.get('/add-address',getaddAddress)
router.get('/delete-address/:id',deleteAddress)

router.post('/signup',userSignup)
router.post('/signupOtp',signupOtp)
router.post('/login',login)
router.post('/forgotpassword',forgetpassword)
router.post('/forgetOtp',forgetOtp)
router.post('/newpassword',newpassword)
router.post('/add-address',addAddress)






module.exports = router;