const express = require('express')
const {engine} = require('express-handlebars')
const dbConnect = require('./dbConnect')
const userRouter = require('./routers/userRouter')
const adminRouter = require('./routers/adminRouter')
const session = require('express-session')
const MongoStore = require('connect-mongo');
require('dotenv').config()

dbConnect()
const app = express()

app.engine('hbs',engine({extname:".hbs"}))
app.set('view engine','hbs')
app.use(session({
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/E_commerce' }),
    secret:"12656",
    resave:false,
    saveUninitialized:true
}))
app.use(express.urlencoded({extended:true}))
app.use(express.static(__dirname + '/public'));

app.use('/',userRouter)
app.use('/admin',adminRouter)


app.listen(2000,()=>{
    console.log("server running");
})
