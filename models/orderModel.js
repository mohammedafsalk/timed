const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    orderStatus:{
        type:String,
        default:"Pending"
    },
    paid:{
        type:Boolean,
        required:true,
        default:false
    },
    address:{
        type:Object,
        required:true
    },
    product:{
        type:Object,
        required:true
    },
    createdAt:{
        type:Date,
        default: new Date()
    },
    userId:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    dispatch:{
        type:Date,
        default: new Date(new Date().setDate(new Date().getDate() + 7))
    },
    payment:{
        type:Object,
        default:{}
    },
    paymentType:{
        type:String,
        default:'cod'
    },
    total:{
        type:Number,
        required:true
    },
    amountPayable:{
        type:Number,
        default:0
    }
},{timestamps:true})

const orderModel = mongoose.model('orders',orderSchema)

module.exports = orderModel;