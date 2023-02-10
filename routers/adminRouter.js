const express = require('express');
const { getAdminHome, getAddProduct, adminProduct, getAdminProduct, getAdminCategory, getAddCategory, addCategory, deleteCategory, addProduct } = require('../controllers/adminController');
const userModel = require('../models/userModel')
const router = express.Router();



router.get('/',getAdminHome)
router.get('/addProduct',getAddProduct)
router.get('/product',getAdminProduct)
router.get('/category',getAdminCategory)
router.get('/addCategory',getAddCategory)
router.get('/categoryDelete/:id',deleteCategory)


router.post('/add',addCategory)
router.post('/addProduct',addProduct)






module.exports = router;