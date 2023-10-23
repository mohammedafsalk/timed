const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
   name:String,
   code:String,
   expDate:Date,
   discount:Number,
   minAmount:Number,
})

const couponModel = mongoose.model('coupons',couponSchema)

module.exports = couponModel;