const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:String,
    product:Object,
    productSub:Array,
    category:String,
    quantity:Number,
    price:Number,
    brand:String,
    description:String,
    list:
    {
        type:Boolean,
        default:true,
    }
})

const productModel = mongoose.model('products',productSchema)

module.exports = productModel;