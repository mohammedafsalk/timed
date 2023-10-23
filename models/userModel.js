const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    address:Array,
    cart:Array,
    wishlist:Array,
    ban:
    {
        type:Boolean,
        default:false,
    },
    wallet:{
        type:Number,
        default:0
    }
})

const userModel = mongoose.model('users',userSchema)

module.exports = userModel;