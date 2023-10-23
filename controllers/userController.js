const axios = require("axios");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const sentOTP = require("../helpers/sentOTP");
const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");
const couponModel = require("../models/couponModel");
const session = require("express-session");
const bannerModel = require("../models/bannerModel");

var msg;

module.exports = {
  getUserLogin: (req, res) => {
    try {
      if (req.session.user) {
        res.redirect("/");
      } else {
        res.render("user/login");
      }
    } catch (error) {
      console.log(error);
    }
  },

  getHome: async (req, res) => {
    try {
      const banners = await bannerModel.find().lean();
      const products = await productModel.find().limit(4).lean();
      if (req.session.user) {
        let user = true;
        res.render("user/home", { products, user, banners });
      } else {
        user = false;
        res.render("user/home", { products, user, banners });
      }
    } catch (error) {
      console.log(error);
    }
  },

  getProduct: async (req, res) => {
    try {
      const id = req.params.id;
      let wishList = req.user?.wishlist ?? [];
      let exist = false;

      if (wishList.includes(id)) {
        let exist = true;
        const product = await productModel.findOne({ _id: id }).lean();
        res.render("user/productDetails", { product, exist });
      } else {
        const product = await productModel.findOne({ _id: id }).lean();
        res.render("user/productDetails", { product });
      }
    } catch (error) {
      console.log(error);
    }
  },
  getShopPage: async (req, res) => {
    try {
      const name = req.query.name ?? "";
      const category = req.query.category ?? "";
      const sort = req.query.sort ?? "";
      let all = true;
      let products = [];
      let noitems = false;
      let selectedSort = {};
      if (category != "") {
        all = false;
        if (sort == "asc") {
          products = await productModel
            .find({
              $or: [
                { name: new RegExp(name, "i") },
                { category: new RegExp(name, "i") },
              ],
              category: category,
            })
            .lean()
            .sort({ price: 1 });
        } else {
          products = await productModel
            .find({
              $or: [
                { name: new RegExp(name, "i") },
                { category: new RegExp(name, "i") },
              ],
              category: category,
            })
            .lean()
            .sort({ price: -1 });
        }
      } else {
        if (sort == "asc") {
          products = await productModel
            .find({
              $or: [
                { name: new RegExp(name, "i") },
                { category: new RegExp(name, "i") },
              ],
            })
            .lean()
            .sort({ price: 1 });
        } else {
          products = await productModel
            .find({
              $or: [
                { name: new RegExp(name, "i") },
                { category: new RegExp(name, "i") },
              ],
            })
            .lean()
            .sort({ price: -1 });
        }
      }

      const categories = await categoryModel.find().lean();

      let categoryList = categories.map((item) => {
        if (item.category == category) {
          return { category: item.category, selected: true };
        } else {
          return { category: item.category, selected: false };
        }
      });
      if (products.length === 0) {
        noitems = true;
        res.render("user/shop", {
          products,
          category: categoryList,
          name,
          all,
          noitems,
        });
        return;
      }
      selectedSort[sort] = true;
      res.render("user/shop", {
        products,
        category: categoryList,
        name,
        all,
        selectedSort,
      });
    } catch (error) {
      console.log(error);
    }
  },

  getCart: async (req, res) => {
    req.session.coupon = null;
    try {
      let cart = req.user?.cart;
      let cartQuantity = {};
      let cartProductIds = cart.map((item) => {
        cartQuantity[item.proId] = item.quantity;
        return item.proId;
      });

      msg = null;

      let coupon = req.session.coupon;

      let products = await productModel
        .find({ _id: { $in: cartProductIds } })
        .lean();
      let totalprice = 0;
      let outOfStock = false;

      products.forEach((item, index) => {
        products[index].cartQuantity = cartQuantity[item._id];
        products[index].totalprice = item.price * cartQuantity[item._id];
        totalprice = totalprice + item.price * cartQuantity[item._id];
        if (products[index].quantity < cartQuantity[item._id]) {
          products[index].outOfStock = true;
          outOfStock = true;
        }
      });
      if (coupon) {
        totalprice = totalprice - coupon.discount;
      }
      let empty = true;
      if (products[0]) {
        empty = false;
      }
      res.render("user/cart", {
        products,
        totalprice,
        empty,
        outOfStock,
        coupon,
        msg,
      });
    } catch (error) {
      console.log(error);
    }
  },

  incQuantity: async (req, res) => {
    try {
      const id = req.params.id;
      const product = await productModel.findOne({ _id: id }).lean();
      const maxQuantity = product.quantity;

      const user = await userModel.findOne({ _id: req.session.user.id });
      const quantities = {};
      user.cart.forEach((cartItem) => {
        quantities[cartItem.proId] = cartItem.quantity;
      });
      const updatedQuantity = quantities[id] + 1;
      await userModel.findOneAndUpdate(
        {
          _id: req.session.user.id,
          cart: { $elemMatch: { proId: req.params.id } },
        },
        {
          $inc: {
            "cart.$.quantity": 1,
          },
        }
      );
      res.redirect("/cart");
    } catch (error) {
      console.log(error);
    }
  },

  decQuantity: async (req, res) => {
    try {
      const id = req.params.id;
      let { cart } = await userModel.findOne(
        { "cart.proId": req.params.id },
        { _id: 0, cart: { $elemMatch: { proId: req.params.id } } }
      );

      if (cart[0].quantity <= 1) {
        return res.redirect("/cart");
      }

      await userModel.findOneAndUpdate(
        {
          _id: req.session.user.id,
          cart: { $elemMatch: { proId: req.params.id } },
        },
        {
          $inc: {
            "cart.$.quantity": -1,
          },
        }
      );
      res.redirect("/cart");
    } catch (error) {
      console.log(error);
    }
  },

  addtoCart: async (req, res) => {
    try {
      const id = req.params.id;
      if (!req.user) {
        res.json({ login: false });
      }

      let cart = req.user?.cart ?? [];
      const isProductInCart = cart.some((item) => item.proId === id);
      if (isProductInCart) {
        return res.json({ success: false, login: true });
      } else {
        await userModel.findByIdAndUpdate(req.session.user.id, {
          $pull: { wishlist: id },
        });
        await userModel.findByIdAndUpdate(req.session.user.id, {
          $addToSet: { cart: { proId: id, quantity: 1 } },
        });
      }
      return res.json({ success: true, login: true });
    } catch (error) {
      console.log(error);
    }
  },

  removefromCart: async (req, res) => {
    try {
      const id = req.params.id;
      const uid = req.session.user.id;
      await userModel.updateOne(
        { _id: uid },
        { $pull: { cart: { proId: id } } }
      );
      res.redirect("/cart");
    } catch (error) {
      console.log(error);
    }
  },

  applyCoupon: async (req, res) => {
    let UserCoupon = req.body.coupon;
    let coupon = await couponModel.findOne({ code: UserCoupon }).lean();

    const { cart } = req.user;
    let totalPrice = 0;
    let cartQuantity = {};
    let cartItemIds = cart.map((item) => {
      cartQuantity[item.proId] = item.quantity;
      return item.proId;
    });
    let products = await productModel
      .find({ _id: { $in: cartItemIds } })
      .lean();
    for (let item of products) {
      totalPrice += item.price * cartQuantity[item._id];
    }
  

    if (coupon) {
      if (coupon.expDate > new Date()) {
        
        if (coupon.minAmount <= totalPrice) {
          req.session.coupon = coupon;
          return res.json({ error: false, coupon });
        } else {
          return res.json({ error: true, message: "Coupon not Applicable" });
        }
      } else {
        return res.json({ error: true, message: "Coupon Expired" });
      }
    } else {
      return res.json({ error: true, message: "invalid Coupon" });
    }
  },

  getWishlist: async (req, res) => {
    try {
      let wishList = req.user?.wishlist;

      let products = await productModel.find({ _id: { $in: wishList } }).lean();

      let empty = true;
      if (products[0]) {
        empty = false;
      }

      res.render("user/wishlist", { products, empty });
    } catch (error) {
      console.log(error);
    }
  },

  addToWishlist: async (req, res) => {
    try {
      const id = req.params.id;
      if (!req.user) {
        return res.json({ login: false });
      }
      const user = await userModel.findOne({ _id: req.session.user.id });
      if (user.wishlist.includes(id)) {
        res.json({ success: false, login: true });
      } else {
        await userModel.findByIdAndUpdate(req.session.user.id, {
          $addToSet: { wishlist: id },
        });
        res.json({ success: true, login: true });
      }
    } catch (error) {
      console.log(error);
    }
  },

  deletewishlist: async (req, res) => {
    try {
      const id = req.params.id;
      userid = req.session.user.id;
      await userModel.updateOne({ _id: userid }, { $pull: { wishlist: id } });
      res.redirect("/wishlist");
    } catch (error) {
      console.log(error);
    }
  },

  getOrderplaced: (req, res) => {
    req.session.tempOrder = null;
    res.render("user/orderPlaced");
  },

  getCheckout: async (req, res) => {
    try {
      const address = req.user.address;
      let cart = req.user?.cart;
      let cartQuantity = {};
      let cartProductIds = cart.map((item) => {
        cartQuantity[item.proId] = item.quantity;
        return item.proId;
      });

      let coupon = req.session.coupon;

      let products = await productModel
        .find({ _id: { $in: cartProductIds } })
        .lean();
      let totalprice = 0;
      products.forEach((item, index) => {
        products[index].cartQuantity = cartQuantity[item._id];
        products[index].totalprice = item.price * cartQuantity[item._id];
        totalprice = totalprice + item.price * cartQuantity[item._id];
      });

      if (coupon) {
        totalprice = totalprice - coupon.discount;
      }

      res.render("user/checkout", {
        address,
        products,
        totalprice,
        coupon,
        wallet: req.user.wallet,
      });
    } catch (error) {
      console.log(error);
    }
  },

  checkOut: async (req, res) => {
    try {
      req.session.tempOrder = null;
      const { payment, address: addressId, wallet } = req.body;
      let walletMoney = req.user.wallet;

      const _id = req.session.user.id;
      const user = await userModel.findById({ _id }).lean();
      const cart = user.cart;
      let cartQuantities = {};
      req.session.payment = payment;
      const cartList = cart.map((item) => {
        cartQuantities[item.proId] = item.quantity;
        return item.proId;
      });
      const { address } = await userModel.findOne(
        { "address._id": addressId },
        { _id: 0, address: { $elemMatch: { _id: addressId } } }
      );
      req.session.userAddress = {
        id: address._id,
      };
      const product = await productModel
        .find({ _id: { $in: cartList } })
        .lean();
      let totalPrice = 0;
      let price = 0;
      product.forEach((item, index) => {
        price = price + item.price * cart[index].quantity;
      });
      if (payment == "online") {
        req.session.tempOrder = {
          address,
          product,
          totalPrice,
          cartQuantities,
          payment,
        };

        let orderId = "order_" + Date.now();

        let couponAmount = 0;
        if (req.session.coupon) {
          couponAmount = req.session.coupon.discount;
        }
        let amountPayable = price - couponAmount;
        if (wallet) {
          if (walletMoney >= amountPayable) {
            amountPayable = 1;
            req.session.tempOrder.walletApplied = amountPayable;
            walletMoney -= amountPayable;
          } else {
            amountPayable -= walletMoney;
            req.session.tempOrder.walletApplied = walletMoney;
            walletMoney = 0;
          }
        }

        const options = {
          method: "POST",
          url: "https://sandbox.cashfree.com/pg/orders",
          headers: {
            accept: "application/json",
            "x-api-version": "2022-09-01",
            "x-client-id": process.env.CASHFREE_API,
            "x-client-secret": process.env.CASHFREE_SECRET,
            "content-type": "application/json",
          },
          data: {
            order_id: orderId,
            order_amount: amountPayable,
            order_currency: "INR",
            customer_details: {
              customer_id: _id,
              customer_email: user.email,
              customer_phone: address[0].mobile,
            },
            order_meta: {
              return_url:
                "https://timed.afsal.online/return?order_id={order_id}",
            },
          },
        };
        await axios
          .request(options)
          .then(function (response) {
            return res.render("user/paymentScr", {
              orderId,
              sessionId: response.data.payment_session_id,
            });
          })
          .catch(function (error) {});
      } else {
        console.log("cod");

        let orders = [];
        let i = 0;
        for (let item of product) {
          await productModel.updateOne(
            { _id: item._id },
            {
              $inc: {
                quantity: -1 * cartQuantities[item._id],
              },
            }
          );

          let couponAmount = 0;
          if (req.session.coupon) {
            couponAmount = req.session.coupon.discount;
          }
          let distributedCouponAmount = couponAmount / product.length;

          totalPrice = cartQuantities[item._id] * item.price;
          let amountPayable = totalPrice - distributedCouponAmount;
        
          if (wallet) {
            console.log(wallet, "inside wallet");
            if (walletMoney >= amountPayable) {
              walletMoney -= amountPayable;
              amountPayable = 0;
            } else {
              amountPayable -= walletMoney;
              walletMoney = 0;
            }
          }
          orders.push({
            address: address[0],
            product: item,
            userId: req.session.user.id,
            quantity: cartQuantities[item._id],
            total: totalPrice,
            amountPayable,
            dispatch: new Date(),
            paymentType: payment,
          });
          i++;
        }
        await orderModel.create(orders);
        await userModel.findByIdAndUpdate(
          { _id },
          {
            $set: { cart: [], wallet: walletMoney },
          }
        );
        req.session.coupon = null;
        req.session.tempOrder = null;
        req.session.payment = null;

        res.redirect("/orderplaced");
      }
    } catch (err) {
      res.json(err);
    }
  },

  returnURL: async (req, res) => {
    try {
      const order_id = req.query.order_id;
      let walletApplied = 0;
      const options = {
        method: "GET",
        url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
        headers: {
          accept: "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": process.env.CASHFREE_API,
          "x-client-secret": process.env.CASHFREE_SECRET,
          "content-type": "application/json",
        },
      };

      const response = await axios.request(options);

      if (response.data.order_status == "PAID") {
        let { product, address, totalPrice, cartQuantities } =
          req.session.tempOrder;

        let cart = req.user.cart;
        let orders = [];
        let i = 0;
        for (let item of product) {
          await productModel.updateOne(
            { _id: item._id },
            {
              $inc: {
                quantity: -1 * cartQuantities[item._id],
              },
            }
          );
          totalPrice = cart[i].quantity * item.price;

          orders.push({
            address: address[0],
            product: item,
            userId: req.session.user.id,
            quantity: cartQuantities[item._id],
            total: totalPrice,
            dispatch: new Date(),
            paymentType: req.session.payment,
          });
          i++;
        }

        const order = await orderModel.create(orders); //work as insert many
        if (req.session.tempOrder.walletApplied) {
          walletApplied = req.session.tempOrder.walletApplied;
        }
        await userModel.findByIdAndUpdate(
          { _id: req.session.user.id },
          {
            $set: { cart: [], wallet: req.user.wallet - walletApplied },
          }
        );

        req.session.coupon = null;
        req.session.tempOrder = null;
        req.session.payment = null;
        res.render("user/orderPlaced", { failed: false });
      } else {
        req.session.tempOrder = null;
        req.session.coupon = null;
        req.session.payment = null;

        res.render("user/orderPlaced", { failed: true });
      }
    } catch (err) {
      req.session.tempOrder = null;
      req.session.coupon = null;
      req.session.payment = null;
      res.render("user/orderPlaced", { failed: true });
    }
  },

  getLogout: (req, res) => {
    req.session.user = null;
    res.redirect("/login");
  },

  getUserSignup: (req, res) => {
    res.render("user/signup");
  },

  getSignupOtp: (req, res) => {
    res.render("user/signupOtp");
  },

  getForgetPassword: (req, res) => {
    res.render("user/forgetpassword");
  },

  getOtp: (req, res) => {
    res.render("user/forgetOtp");
  },

  getnewpassword: (req, res) => {
    res.render("user/newpassword");
  },

  getorderHistory: async (req, res) => {
    const id = req.session.user.id;
    const orders = await orderModel
      .find({ userId: id })
      .sort({ _id: -1 })
      .lean();

    let status = true;
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].orderStatus === "Delivered") {
        status = false;
        break;
      }
    }

    let empty = true;
    if (orders[0]) {
      empty = false;
    }

    res.render("user/orderHistory", { orders, empty, status });
  },
  getviewOrder: async (req, res) => {
    const id = req.params.id;
    const item = await orderModel.findById(id).lean();

    let pending = false;
    let delivered = false;
    let cancelled = false;
    let returnedProcessing = false;
    let returned = false;
    if (item.orderStatus == "Delivered") {
      delivered = true;
    }
    if (item.orderStatus == "Cancelled") {
      cancelled = true;
    }
    if (item.orderStatus == "Return Processed") {
      returnedProcessing = true;
    }
    if (item.orderStatus == "Returned") {
      returned = true;
    }
    if (item.orderStatus == "Pending") {
      pending = true;
    }

    res.render("user/viewOrder", {
      item,
      dispatch: item.dispatch.toLocaleDateString(),
      pending,
      delivered,
      cancelled,
      returnedProcessing,
      returned,
    });
  },

  getaddAddress: async (req, res) => {
    res.render("user/addAddress");
  },

  addAddress: async (req, res) => {
    try {
      const _id = req.session.user.id;
      await userModel.findByIdAndUpdate(
        { _id },
        { $addToSet: { address: { ...req.body, _id: Date.now().toString() } } }
      );
      res.redirect("/userprofile");
    } catch (error) {
      console.log(error);
    }
  },

  deleteAddress: async (req, res) => {
    try {
      const id = req.params.id;
      const uid = req.session.user.id;
      await userModel.updateOne(
        { _id: uid },
        { $pull: { address: { _id: id } } }
      );
      res.redirect("/userprofile");
    } catch (error) {
      console.log(error);
    }
  },

  getEditAddress: async (req, res) => {
    try {
      const { address } = await userModel.findOne(
        { "address._id": req.params.id },
        { _id: 0, address: { $elemMatch: { _id: req.params.id } } }
      );
      res.render("user/editAddress", { address: address[0] });
    } catch (error) {
      console.log(error);
    }
  },

  editAddress: async (req, res) => {
    try {
      await userModel.updateOne(
        {
          _id: req.session.user.id,
          address: { $elemMatch: { _id: req.body._id } },
        },
        {
          $set: {
            "address.$": req.body,
          },
        }
      );
      res.redirect("/userprofile");
    } catch (error) {
      console.log(error);
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const _id = req.session.user.id;
      const user = await userModel.findOne({ _id }).lean();
      res.render("user/profile", { user });
    } catch (error) {
      console.log(error);
    }
  },

  getEditProfile: async (req, res) => {
    try {
      const id = req.params.id;
      const user = await userModel.findOne({ _id: id }).lean();
      res.render("user/editProfile", { user });
    } catch (error) {
      console.log(error);
    }
  },

  editProfile: async (req, res) => {
    try {
      const id = req.body._id;
      await userModel.findOneAndUpdate(
        { id: id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          },
        }
      );
      res.redirect("/userprofile");
    } catch (error) {
      console.log(error);
    }
  },
  cancelProduct: async (req, res) => {
    const id = req.params.id;
    const order = await orderModel.findById(id);
    const proid = order.product._id;
    await orderModel.findByIdAndUpdate(id, {
      $set: {
        orderStatus: "Cancelled",
      },
    });

    if (order.paymentType == "online") {
      await userModel.findByIdAndUpdate(req.session.user.id, {
        $inc: {
          wallet: order.total - order.amountPayable,
        },
      });
    }
    await productModel.findByIdAndUpdate(proid, {
      $inc: {
        quantity: order.quantity,
      },
    });
    res.redirect("back");
  },

  returnProduct: async (req, res) => {
    const id = req.params.id;
    const order = await orderModel.findById(id);
    await orderModel.findByIdAndUpdate(id, {
      $set: {
        orderStatus: "Return Processed",
      },
    });

    res.redirect("back");
  },

  userSignup: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const duplicateuser = await userModel.findOne({ email });

      if (email == "" || name == "" || password == "") {
        const error = "all field reqiured";
        return res.render("user/signup", { error });
      }

      if (duplicateuser) {
        const error = "User already exists";
        return res.render("user/signup", { errormsg });
      } else {
        const randomOtp = Math.floor(Math.random() * 1000000);
        req.session.tempUser = {
          name,
          email,
          password,
          otp: randomOtp,
        };
        await sentOTP(email, randomOtp);
        return res.redirect("/signup/otp");
      }
    } catch (err) {
      console.log(err);
    }
  },

  signupOtp: async (req, res) => {
    try {
      const { otp } = req.body;
      const { name, email, password } = req.session.tempUser;

      if (otp == req.session.tempUser.otp) {
        const user = await userModel.create({
          name,
          email,
          password,
        });
        return res.redirect("/login");
      }
      res.render("user/signupOtp", { error: "invalid OTP" });
    } catch (error) {
      console.log(error);
    }
  },

  forgetpassword: async (req, res) => {
    try {
      let email = req.body.email;
      const user = await userModel.findOne({ email: req.body.email }).lean();

      if (user) {
        const otp = Math.floor(Math.random() * 1000);
        req.session.temp = {
          tempOtp: otp,
          email,
        };
        await sentOTP(email, otp);
        res.render("user/forgetOtp");
      } else {
        res.render("user/forgetpassword", { error: "No User Found" });
      }
    } catch (error) {
      console.log(error);
    }
  },

  forgetOtp: async (req, res) => {
    try {
      const { otp } = req.body;
      if (otp == req.session.temp.tempOtp) {
        res.render("user/newpassword");
      } else {
        res.render("user/forgetOtp", { error: "OTP is incorrect!" });
      }
    } catch (error) {
      console.log(error);
    }
  },

  newpassword: async (req, res) => {
    try {
      const password = req.body.password;
      const newpassword = req.body.newpassword;
      const email = req.session.temp.email;

      if (password === newpassword) {
        await userModel.findOneAndUpdate(
          { email },
          { $set: { password: newpassword } }
        );
        res.redirect("/login");
      } else {
        res.render("user/newpassword", {
          error: "Confirmation failed,enter correctly",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  login: async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;

      if (email == "" || password == "") {
        res.render("user/login", { error: "All fields required!" });
        return;
      }

      const userOg = await userModel.findOne({ email });

      if (userOg) {
        if (password == userOg.password) {
          req.session.user = {
            id: userOg._id,
            name: userOg.name,
          };
          res.redirect("/");
        } else {
          res.render("user/login", { error: "Invalid Password!" });
        }
      } else {
        res.render("user/login", { error: "Invalid Username or Password!" });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
