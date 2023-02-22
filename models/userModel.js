const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    address:Array,
    ban:
    {
        type:Boolean,
        default:false,
    }
})

const userModel = mongoose.model('users',userSchema)

module.exports = userModel;