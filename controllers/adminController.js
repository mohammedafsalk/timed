const express = require("express");
const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const bannerModel = require("../models/bannerModel");
const { findByIdAndUpdate } = require("../models/userModel");
const orderModel = require("../models/orderModel");
const couponModel = require("../models/couponModel");
const moment = require('moment')
const router = express.Router();

module.exports = {
  getAdminHome: async (req, res) => {
    const totalUsers = await userModel.find().countDocuments();
    const totalProducts = await productModel.find().countDocuments();
    const totalorders = await orderModel.find().countDocuments();

    const deliveredOrder = await orderModel
      .find({
        orderStatus: "Delivered",
      })
      .lean();

    let totalRevenue = 0;
    let Orders = deliveredOrder.filter((item) => {
      totalRevenue = totalRevenue + item.total;
    });

    const monthlyDataArray= await orderModel.aggregate([{$group:{_id:{$month:"$createdAt"}, sum:{$sum:"$total"}}}])
    console.log(monthlyDataArray)
    let 
    monthlyDataObject={}
    monthlyDataArray.map(item=>{
      monthlyDataObject[item._id]=item.sum
    })
    let monthlyData=[]
    for(let i=1; i<=12; i++){
        monthlyData[i-1]= monthlyDataObject[i] ?? 0
      }
      console.log(monthlyData)
    res.render("admin/home", {
      totalUsers,
      totalProducts,
      totalorders,
      totalRevenue,
      monthlyData
    });
  },
  getSalesReport: async (req, res) => {
    
    let startDate = new Date(new Date().setDate(new Date().getDate() - 8))
    let endDate = new Date()
    
    if(req.query.startDate){
        startDate = new Date(req.query.startDate)
        startDate.setHours(0, 0, 0, 0);
    }
    if(req.query.endDate){
        endDate = new Date(req.query.endDate)
        endDate.setHours(24, 0, 0, 0);
    }
    if(req.query.filter=='thisYear'){
      let currentDate= new Date()
      startDate= new Date(currentDate.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate= new Date(new Date().setDate(new Date().getDate() +1 ))
      endDate.setHours(0, 0, 0, 0);
    }
    if(req.query.filter=='lastYear'){
      let currentDate= new Date()
      startDate= new Date(currentDate.getFullYear()-1, 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate= new Date(currentDate.getFullYear()-1, 11, 31);
      endDate.setHours(0, 0, 0, 0);
    }
    if(req.query.filter=='thisMonth'){
      let currentDate= new Date()
      startDate= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate= new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1);
      endDate.setHours(0, 0, 0, 0);
    }
    if(req.query.filter=='lastMonth'){
      let currentDate= new Date()
      startDate= new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate.setHours(0, 0, 0, 0);
    }

  const orders = await orderModel
    .find({createdAt: { $gt: startDate, $lt: endDate }})
    .sort({ createdAt: -1 })
    .lean();
  let totalOrders = orders.length;
  let totalRevenue = 0;
  let totalPending = 0;
  console.log(orders)
  let deliveredOrders = orders.filter((item) => {
    console.log(item.orderStatus)

    if (item.orderStatus == "Pending" || item.orderStatus == 'outForDelivery') {
      totalPending++;
    }

    totalRevenue = totalRevenue + item.product.price;
    return item.orderStatus=='Delivered';
  });
  let totalDispatch = deliveredOrders.length;

  let orderTable=[]
  orders.map(item=>{
    orderTable.push([item.product.name, item.total, item.orderStatus, item.quantity, item.createdAt.toLocaleDateString() ])
  })
  let byCategory= await orderModel.aggregate([{$match:{createdAt: { $gt: startDate, $lt: endDate }}},{$group:{_id:"$product.category", count:{$sum:1}, profit:{$sum:"$product.price"}}}])
  let byBrand= await orderModel.aggregate([{$match:{createdAt: { $gt: startDate, $lt: endDate}}},{$group:{_id:"$product.brand", count:{$sum:1}, profit:{$sum:"$product.price"}}}])

  let filter=req.query.filter ?? "";
  if(!req.query.filter && !req.query.startDate){
    filter="lastWeek"
  }
  res.render("admin/salesReport", {
    orders,
    totalDispatch,
    totalOrders,
    totalPending,
    totalRevenue,
    startDate:moment(new Date(startDate).setDate(new Date(startDate).getDate() + 1)).utc().format('YYYY-MM-DD'),
    endDate:moment(endDate).utc().format('YYYY-MM-DD'),
    orderTable,
    categories:byCategory,
    byBrand,
    filter
  });
  },


  getadminlogin: (req, res) => {
    res.render("admin/login");
  },

  getOrders: async (req, res) => {
    const order = await orderModel.find().sort({_id:-1}).lean();
    let empty = true;
    if (order[0]) {
      empty = false;
    }
    for (let i in order) {
      if (order[i].orderStatus == "Returned") {
        order[i].returned = true;
      }
      if (order[i].orderStatus == "Cancelled") {
        order[i].cancelled = true;
      }
    }
    console.log(order);
    res.render("admin/orders", { order, empty });
  },

  getViewOrder: async (req, res) => {
    const _id = req.params.id;
    let orders = await orderModel.findById(_id).lean();
    res.render("admin/viewOrder", {
      orders,
      dispatch: orders.dispatch.toLocaleDateString(),
    });
  },

  orderstatus: async (req, res) => {
    const order = await orderModel.findById(req.body.id);

    if (req.body.action == "Returned") {
      await orderModel
        .updateOne({ _id: req.body.id }, { $set: { orderStatus: "Returned" } });
          await userModel.findByIdAndUpdate(order.userId, {
            $inc: {
              wallet: order.total- order.amountPayable,
            }
          });
          
          await productModel.findByIdAndUpdate(order.product._id, {
            $inc: {
              quantity: order.quantity,
            }
          });
          res.redirect("back")
    } else {
      await orderModel
        .updateOne(
          { _id: req.body.id },
          { $set: { orderStatus: req.body.action } }
        )
        .then((result) => {
          res.redirect("back");
        });
    }
  },

  getBanner: async (req, res) => {
    try {
      const banner = await bannerModel.find().lean();
      res.render("admin/banners", { banner });
    } catch (error) {
      console.log(error);
    }
  },

  getaddBanner: (req, res) => {
    res.render("admin/addBanner");
  },

  geteditBanner: async (req, res) => {
    try {
      const id = req.params.id;
      const banner = await bannerModel.findById({ _id: id }).lean();
      res.render("admin/editBanner", { banner });
    } catch (error) {
      console.log(error);
    }
  },

  editBanner: async (req, res) => {
    try {
      const id = req.body._id;

      if (!req.file) {
        await bannerModel.findByIdAndUpdate(id, {
          $set: {
            productName: req.body.name,
            caption: req.body.caption,
            heading:req.body.mainhead,
            desc: req.body.description,
          },
        });
      }
      if (req.file) {
        await bannerModel.findByIdAndUpdate(id, {
          $set: {
            productName: req.body.name,
            caption: req.body.caption,
            heading:req.body.mainhead,
            desc: req.body.description,
            img: req.file.filename,
          },
        });
      }
      res.redirect("/admin/banners");
    } catch (error) {
      console.log(error);
    }
  },

  addBanner: (req, res) => {
    bannerModel
      .create({
        productName: req.body.name,
        caption: req.body.caption,
        heading:req.body.mainhead,
        desc: req.body.description,
        img: req.file.filename,
      })
      .then((banners) => {
        res.redirect("/admin/banners");
      })
      .catch((Error) => {
        console.log(Error);
        res.render("admin/addBanner");
      });
  },

  getCoupons: async (req, res) => {
    const coupons = await couponModel.find().lean();
    coupons.forEach((item, index)=>{
      coupons[index].expDate=new Date(item.expDate).toLocaleDateString()
    })
    res.render("admin/coupons", { coupons });
  },

  getAddCoupon: (req, res) => {
    res.render("admin/addCoupon");
  },

  addCoupon: (req, res) => {
    console.log(req.body);
    const expDate = new Date(req.body.exp);
    const currentDate = new Date();
    if (expDate <= currentDate) {
      return res.render("admin/addCoupon", {
        msg: "Expiry date must be greater than current date",
      });
    }
    const formattedExpDate = expDate.toLocaleDateString();
    couponModel
      .create({
        name: req.body.name,
        code: req.body.code,
        expDate,
        discount: req.body.discount,
        minAmount: req.body.minamnt,
      })
      .then((coupons) => {
        res.redirect("/admin/coupons");
      })
      .catch((Error) => {
        console.log(Error);
        res.render("admin/addCoupon");
      });
  },

  getEditCoupon: async (req, res) => {
    const id = req.params.id;
    const coupon = await couponModel.findOne({ _id: id }).lean();
    res.render("admin/editCoupon", { coupon });
  },

  editCoupon: async (req, res) => {
    try {
      const _id = req.body._id;
      await couponModel.findOneAndUpdate(_id, {
        $set: {
          name: req.body.category,
          code: req.body.code,
          expDate: new Date(req.body.exp),
          discount: req.body.discount,
          minAmount: req.body.minamnt,
        },
      });
      res.redirect("/admin/coupons");
    } catch (error) {
      console.log(error);
    }
  },

  deleteCoupon: async (req, res) => {
    const id = req.params.id;
    await couponModel.deleteOne({ _id: id });
    res.redirect("/admin/coupons");
  },

  login: (req, res) => {
    try {
      console.log(req.body);
      const email = "admin123@gmail.com";
      const password = "1234";

      if (email == req.body.email && password == req.body.password) {
        req.session.admin = {
          email: req.body.email,
          password: req.body.password,
        };
        res.redirect("/admin");
      } else {
        res.render("admin/login", { error: "Email or Password is Incorrect!" });
      }
    } catch (error) {
      console.log(error);
    }
  },

  logout: (req, res) => {
    req.session.admin = null;
    res.redirect("/admin/login");
  },

  getAddProduct: async (req, res) => {
    try {
      const categories = await categoryModel.find().lean();
      res.render("admin/addProduct", { categories });
    } catch (error) {
      console.log(error);
    }
  },

  getAdminProduct: async (req, res) => {
    try {
      let name = req.query.name ?? "";
      const products = await productModel
        .find({
          $or: [
            { name: new RegExp(name, "i") },
            { category: new RegExp(name, "i") },
          ],
        })
        .lean();
      res.render("admin/product", { products });
    } catch (error) {
      console.log(error);
    }
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
        res.render("admin/addProduct");
      });
  },

  getEditProduct: async (req, res) => {
    try {
      const _id = req.params.id;
      const product = await productModel.findById({ _id }).lean();
      const category = await categoryModel.find().lean();
      console.log(category);
      console.log(product);
      res.render("admin/editProduct", { product, category });
    } catch (error) {
      console.log(error);
    }
  },

  editProduct: async (req, res) => {
    try {
      const _id = req.body._id;

      if (!req.files.product && !req.files.subImages) {
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            ...req.body,
          },
        });
      }
      if (req.files.product && !req.files.subImages) {
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            ...req.body,
            product: req.files.product[0],
          },
        });
      }
      if (!req.files.product && req.files.subImages) {
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            ...req.body,
            productSub: req.files.subImages,
          },
        });
      }
      if (req.files.product && req.files.subImages) {
        await productModel.findByIdAndUpdate(_id, {
          $set: {
            ...req.body,
            product: req.files.product[0],
            productSub: req.files.subImages,
          },
        });
      }

      res.redirect("/admin/product");
    } catch (error) {
      console.log(error);
    }
  },

  getDeleteProduct: async (req, res) => {
    try {
      const _id = req.params.id;

      await productModel.findByIdAndDelete({ _id });
      res.redirect("/admin/product");
    } catch (error) {
      console.log(error);
    }
  },

  getAdminCategory: async (req, res) => {
    try {
      const categories = await categoryModel.find().lean();

      res.render("admin/category", { categories });
    } catch (error) {
      console.log(error);
    }
  },

  getAddCategory: (req, res) => {
    res.render("admin/addCategory");
  },

  getEditCategory: async (req, res) => {
    try {
      const _id = req.params.id;
      const category = await categoryModel.findOne({ _id }).lean();
      res.render("admin/editCategory", { category });
    } catch (error) {
      console.log(error);
    }
  },

  editCategory: async (req, res) => {
    try {
      const _id = req.body._id;
      await categoryModel.findOneAndUpdate(_id, {
        $set: { category: req.body.category },
      });
      res.redirect("/admin/category");
    } catch (error) {
      console.log(error);
    }
  },

  addCategory: async (req, res) => {
    try {
      const category = req.body.category;

      const newCategory = await categoryModel.findOne({
        category: { $regex: new RegExp("^" + category + "$", "i") },
      });

      if (newCategory) {
        const error = "category exists";
        res.render("admin/addCategory", { error });
      } else {
        const categories = new categoryModel({ category });
        categories.save();
        res.redirect("/admin/category");
      }
    } catch (error) {
      console.log(error);
    }                                                         
  },

  deleteCategory: async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      const cat = await categoryModel.findOne(
        { _id: id },
        { category: 1, _id: 0 }
      );

      const product = await productModel.find({ category: cat.category });
      console.log(product);

      if (product.length === 0) {
        await categoryModel.deleteOne({ _id: id });
        res.redirect("/admin/category");
      } else {
        const msg = "Product exists, Operation failed";
        categories = await categoryModel.find().lean();
        res.render(`admin/category`, { msg, categories });
      }
    } catch (error) {
      console.log(error);
    }
  },

  unlist: async (req, res) => {
    try {
      const _id = req.params.id;

      await productModel.findByIdAndUpdate({ _id }, { $set: { list: false } });
      res.redirect("/admin/product");
    } catch (error) {
      console.log(error);
    }
  },

  list: async (req, res) => {
    try {
      const _id = req.params.id;

      await productModel.findByIdAndUpdate({ _id }, { $set: { list: true } });
      res.redirect("/admin/product");
    } catch (error) {
      console.log(error);
    }
  },
};
