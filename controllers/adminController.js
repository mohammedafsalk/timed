const express = require("express");
const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const { findByIdAndUpdate } = require("../models/userModel");
const router = express.Router();

module.exports = {
  getAdminHome: (req, res) => {
    res.render("admin/home");
  },

  getadminlogin: (req, res) => {
    res.render("admin/login");
  },

  getOrders: (req, res) => {
    res.render("admin/orders");
  },

  getBanner: (req, res) => {
    res.render("admin/banners");
  },

  getCoupons: (req, res) => {
    res.render("admin/coupons");
  },

  login: (req, res) => {
    console.log(req.body);
    const email = "admin123@gmail.com";
    const password = "1234";

    if (email == req.body.email && password == req.body.password) {
      res.redirect("/admin");
    } else {
      res.render("admin/login", { error: "Email or Password is Incorrect!" });
    }
  },

  getAddProduct: async (req, res) => {
    const categories = await categoryModel.find().lean();
    res.render("admin/addProduct", { categories });
  },

  getAdminProduct: async (req, res) => {
    const products = await productModel.find().lean();
    res.render("admin/product", { products });
  },

  addProduct: (req, res) => {
    productModel
      .create({
        name: req.body.name,
        product: req.files.product[0],
        productSub: req.files.subImages,
        category: req.body.category,
        price: req.body.price,
        brand: req.body.brand,
        description: req.body.description,
        quantity: req.body.quantity,
      })
      .then((products) => {
        res.redirect("/admin/product");
      })
      .catch((Error) => {
        console.log(Error);
        res.render("addProduct");
      });
  },

  getEditProduct:async(req,res)=>{

    const _id = req.params.id
    const product = await productModel.findById({_id}).lean()
    const category = await categoryModel.find().lean()
    console.log(category);
    console.log((product));
     res.render('admin/editProduct',{product,category})
  },

  editProduct:async(req,res)=>{
      const _id = req.body._id
      await productModel.findByIdAndUpdate(_id,{$set:{
        name:req.body.name,
        brand:req.body.brand
      }})
      res.redirect('/admin/product')
  },

  getDeleteProduct: async (req, res) => {
    const _id = req.params.id;

    await productModel.findByIdAndDelete({ _id });
    res.redirect("/admin/product");
  },

  getAdminCategory: async (req, res) => {
    const categories = await categoryModel.find().lean();

    res.render("admin/category", { categories });
  },

  getAddCategory: (req, res) => {
    res.render("admin/addCategory");
  },

  getEditCategory: async (req, res) => {
    const _id = req.params.id;
    const category = await categoryModel.findOne({ _id }).lean();
    res.render("admin/editCategory", { category });
  },

  editCategory: async (req, res) => {
    const _id = req.body._id;
    await categoryModel.findOneAndUpdate(_id, {
      $set: { category: req.body.category },
    });
    res.redirect("/admin/category");
  },

  addCategory: async (req, res) => {
    const category = req.body.category;

    const newCategory = await categoryModel.findOne({ category });

    if (newCategory) {
      const error = "category exists";
      res.render("admin/addCategory", { error });
    } else {
      const categories = new categoryModel({ category });
      categories.save();
      res.redirect("/admin/category");
    }
  },

  deleteCategory: async (req, res) => {
    const id = req.params.id;
    await categoryModel.deleteOne({ _id: id });
    res.redirect("/admin/category");
  },

  unlist: async (req, res) => {
    const _id = req.params.id;

    await productModel.findByIdAndUpdate({ _id }, { $set: { list: false } });
    res.redirect("/admin/product");
  },

  list: async (req, res) => {
    const _id = req.params.id;

    await productModel.findByIdAndUpdate({ _id }, { $set: { list: true } });
    res.redirect("/admin/product");
  },
};
