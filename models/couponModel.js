const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
   name:String,
   code:String,
   expDate:String,
   discount:Number,
   minAmount:Number,
})

const couponModel = mongoose.model('coupons',couponSchema)

module.exports = couponModel;