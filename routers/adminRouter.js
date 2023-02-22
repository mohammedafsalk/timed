const express = require('express');
const { getAdminHome, getAddProduct, adminProduct, getAdminProduct, getAdminCategory, getAddCategory, addCategory, deleteCategory, addProduct, getDeleteProduct, getUser, banUser, unBanUser, getadminlogin, login, getEditCategory, editCategory, getOrders, getBanner, getCoupons, unlist, list, getEditProduct, editProduct } = require('../controllers/adminController');
const userModel = require('../models/userModel')
const upload = require('../middlewares/multer')
const router = express.Router();



router.get('/',getAdminHome)
router.get('/orders',getOrders)
router.get('/banners',getBanner)
router.get('/coupons',getCoupons)
router.get('/login',getadminlogin)
router.post('/login',login)
router.get('/addProduct',getAddProduct)
router.get('/product',getAdminProduct)
router.get('/editProduct/:id',getEditProduct)
router.get('/category',getAdminCategory)
router.get('/edit-category/:id',getEditCategory)
router.get('/add-category',getAddCategory)
router.get('/delete-category/:id',deleteCategory)
router.get('/productDelete/:id',getDeleteProduct)
router.get('/unlistProduct/:id',unlist)
router.get('/listProduct/:id',list)


router.post('/addProduct',upload.fields([{name:'product',maxCount:1},{name:'subImages',maxCount:10}]),addProduct)
router.post('/editProduct',editProduct)
router.post('/edit-category/',editCategory)
router.post('/add-category',addCategory)










module.exports = router;