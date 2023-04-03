const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
      productName:String,
      caption:String,
      heading:String,
      desc:String,
      img:Object

})

const bannerModel = mongoose.model('banners',bannerSchema)

module.exports = bannerModel;