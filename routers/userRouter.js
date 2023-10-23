const express = require('express');
const { getUserLogin, getUserSignup, getSignupOtp, userSignup, signupOtp, getHome, getLogout, login, getForgetPassword, forgetpassword, forgetOtp, getOtp, getnewpassword, newpassword, getCheckout, getCart, getProduct, getShopPage, getWishlist, getorderHistory, getUserProfile, getaddAddress, addAddress, deleteAddress, getEditAddress, editAddress, getEditProfile, editProfile, cart, addtoCart, addToWishlist, removefromCart, deletewishlist, incQuantity, decQuantity, getOrderplaced, checkOut, returnURL, getviewOrder, applyCoupon, returnProduct, cancelProduct } = require('../controllers/userController');
const checkUser = require('../middlewares/checkUser');
const userModel = require('../models/userModel')
const router = express.Router();

router.get('/login',getUserLogin)
router.get('/signup',getUserSignup)
router.get('/signup/otp',getSignupOtp)
router.get('/logout',getLogout)
router.get('/forgotpassword',getForgetPassword)
router.get('/forgotpassword/otp',getOtp)
router.post('/signup',userSignup)
router.post('/signupOtp',signupOtp)
router.post('/login',login)
router.post('/forgotpassword',forgetpassword)
router.post('/forgetOtp',forgetOtp)
router.post('/newpassword',newpassword)
router.get('/',getHome)
router.get('/product-list',getShopPage)
router.get('/product/:id',getProduct)


router.use(checkUser)

router.get('/cart', getCart)
router.get('/delete-cartItem/:id',removefromCart)
router.get('/wishlist',getWishlist)
router.get('/delete-wishlistItem/:id',deletewishlist)
router.get('/checkout',getCheckout)
router.get('/forgotpassword/newpassword',getnewpassword)
router.get('/orderhistory',getorderHistory)
router.get('/vieworder/:id',getviewOrder)
router.get('/userprofile',getUserProfile)
router.get('/edit-profile/:id',getEditProfile)
router.get('/add-address',getaddAddress)
router.get('/delete-address/:id',deleteAddress)
router.get('/edit-address/:id',getEditAddress)
router.get('/addtoCart/:id',addtoCart)
router.get('/addTowishlist/:id',addToWishlist)
router.get('/checkout',getCheckout)
router.get('/orderplaced',getOrderplaced)
router.get("/return", returnURL)

router.get('/inc-quantity/:id', incQuantity)
router.get('/dec-quantity/:id', decQuantity)
router.get('/returnProduct/:id',returnProduct)
router.get('/cancelProduct/:id',cancelProduct)



router.post('/edit-profile',editProfile)
router.post('/add-address',addAddress)
router.post('/edit-address',editAddress)
router.post('/applycoupon',applyCoupon)
router.post('/checkout',checkOut)









module.exports = router;