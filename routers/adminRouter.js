const express = require('express');
const { getAdminHome, getAddProduct, adminProduct, getAdminProduct, getAdminCategory, getAddCategory, addCategory, deleteCategory, addProduct, getDeleteProduct, getUser, banUser, unBanUser, getadminlogin, login, getEditCategory, editCategory, getOrders, getBanner, getCoupons, unlist, list, getEditProduct, editProduct, addBanner, getaddBanner, geteditBanner, editBanner, logout, orderstatus, getAddCoupon, addCoupon, deleteCoupon, getViewOrder } = require('../controllers/adminController');
const userModel = require('../models/userModel')
const upload = require('../middlewares/multer')
const adminlogin = require('../middlewares/adminlogin');
const { cancelProduct, returnProduct } = require('../controllers/userController');
const router = express.Router();


router.use(adminlogin)
router.get('/',getAdminHome)
router.get('/orders',getOrders)
router.get('/vieworders/:id',getViewOrder)
router.get('/banners',getBanner)
router.get('/addbanner',getaddBanner)
router.get('/editBanner/:id',geteditBanner)
router.get('/coupons',getCoupons)
router.get('/add-coupon',getAddCoupon)
router.get('/login',getadminlogin)
router.get('/logout',logout)
router.post('/login',login)
router.get('/addProduct',getAddProduct)
router.get('/product',getAdminProduct)
router.get('/editProduct/:id',getEditProduct)
router.get('/unlistProduct/:id',unlist)
router.get('/listProduct/:id',list)
router.get('/category',getAdminCategory)
router.get('/edit-category/:id',getEditCategory)
router.get('/add-category',getAddCategory)
router.get('/delete-category/:id',deleteCategory)
router.get('/delete-coupon/:id',deleteCoupon)
router.get('/productDelete/:id',getDeleteProduct)


router.post('/addProduct',upload.fields([{name:'product',maxCount:1},{name:'subImages',maxCount:10}]),addProduct)
router.post('/editProduct',upload.fields([{name:'product',maxCount:1},{name:'subImages',maxCount:10}]),editProduct)
router.post('/addBanner',upload.single('image'),addBanner)
router.post('/editBanner',upload.single('image'),editBanner)
router.post('/edit-category/',editCategory)
router.post('/add-category',addCategory)
router.post('/add-coupon',addCoupon)
router.post('/orderstatus',orderstatus)










module.exports = router;