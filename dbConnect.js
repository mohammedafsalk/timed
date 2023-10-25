const mongoose = require('mongoose')

const dbConnect = ()=>{
    mongoose.set('strictQuery',false)
    mongoose.connect(process.env.MONGOPASS)
    .then(()=>{
        console.log(' DB connected');  
        
    })
    .catch(err=>{
        console.log('error'+err);
    })
}

module.exports = dbConnect