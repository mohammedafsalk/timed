const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    productName:String,
    productCategory:String,
    quantity:Number,
    price:Number,
    ProductDescrpition:String,
    
})

const productModel = mongoose.model('products',productSchema)

module.exports = productModel;