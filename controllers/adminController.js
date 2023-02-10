const express = require('express')
const userModel = require('../models/userModel')
const adminModel = require('../models/adminModel')
const categoryModel = require('../models/categoryModel')
const productModel = require('../models/productModel')
const router = express.Router();

const getAdminHome=(req,res)=>{
    res.render('adminHome')
}

const getAddProduct=async(req,res)=>{

    const categories = await categoryModel.find().lean()
    res.render('addProduct',{categories})
}

const getAdminProduct=async(req,res)=>{

    const products = await productModel.find().lean()
    res.render('adminProduct',{products})
}

const addProduct =(req,res)=>{
     
    const {name:proname,category:procategory,price,quantity,description:prodescrpition} = req.body;
    console.log(req.body);

    // if(category ===""|| name ==""|| quantity ===""||price ===""||description ===""){
    //     const error = "Please fill every field"
    //     res.render('addProduct',{error})
    // }else{
    //     const products = new productModel({})
    //     console.log(products);
    //     res.redirect('/admin/product')
    // }
    const products = new productModel({productName:proname,productCategory:procategory,price:price,quantity:quantity,ProductDescrpition:prodescrpition})
        products.save()
        console.log(products);
        res.redirect('/admin/product')
   
}

const getAdminCategory=async(req,res)=>{

    const categories = await categoryModel.find().lean()

    res.render('adminCategory',{categories})
}

const getAddCategory=(req,res)=>{
    res.render('addCategory')
}

const addCategory = async(req,res)=>{
   const category = req.body.category
   console.log(category);

   const newCategory = await categoryModel.findOne({category})

   if(newCategory){
     const error = "category exists"
     res.render('addCategory',{error})
   }else{
    const categories = new categoryModel({category})
    categories.save()
    res.redirect('/admin/category')
   }
}

const deleteCategory = async(req,res)=>{
    const id = req.params.id
    await categoryModel.deleteOne({_id:id})
    res.redirect('/admin/category')
}

module.exports={
  getAdminHome,getAddProduct,getAdminProduct,getAdminCategory,getAddCategory,addCategory,deleteCategory,addProduct
}