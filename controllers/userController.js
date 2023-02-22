const express = require('express')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const sentOTP= require("../helpers/sentOTP")
const router = express.Router();









module.exports={
    getUserLogin :(req,res)=>{
        if(req.session.user){
            res.redirect('/')
        }else{
            
            res.render('user/login')
        }
    },

    getHome:async(req,res)=>{
        if(req.session.user){
            const products = await productModel.find().lean()

            res.render('user/home',{products})
        }else{
            res.redirect('/login')
        }
    },
    getProduct:async(req,res)=>{

        const id = req.params.id
        const product = await productModel.findOne({id}).lean()
        console.log(product);
        res.render('user/productDetails',{product})
        
    },
    getShopPage:async(req,res)=>{

            res.render('user/shop')
    },
    getCart:async(req,res)=>{
            res.render('user/cart')

    },
    getWishlist:async(req,res)=>{
            res.render('user/wishlist')

    },
    getCheckout:async(req,res)=>{
            res.render('user/checkout')
    },

    getLogout:(req,res)=>{
        req.session.user=null
        res.redirect('/login')
    },
    
    getUserSignup :(req,res)=>{
        res.render('user/signup')
    },

    getSignupOtp:(req, res)=>{
        res.render('user/signupOtp')
    },

    getForgetPassword:(req,res)=>{
        res.render('user/forgetpassword')
    },

    getOtp:(req,res)=>{
        res.render('user/forgetOtp')
    },
    
    getnewpassword:(req,res)=>{
      res.render('user/newpassword')
    },

    getorderHistory:(req,res)=>{
       res.render('user/orderHistory')
    },

    getaddAddress:async(req,res)=>{
      res.render('user/addAddress')
    },

    addAddress:async(req,res)=>{
       const _id = req.session.user.id
       console.log(req.body);
       const u = await userModel.findByIdAndUpdate({_id},{$addToSet:{address:{...req.body, _id:Date.now()}}})
       res.redirect('/userprofile')

    },

    deleteAddress:async(req,res)=>{
      const id = req.params.id
      const uid = req.session.user.id
      console.log(uid);
      console.log(id);
      await userModel.updateOne({_id:uid},{$pull:{address:{_id:id}}})
      res.redirect('/userprofile')
    },

    getUserProfile:async(req,res)=>{

        if(req.session.user){

            const email = req.session.user.email
            const user = await userModel.findOne({email}).lean()
            res.render('user/profile',{user})

        

        }else{
            res.redirect('/login')
        }
    },

    userSignup : async(req,res)=>{
        try{

            
            const {name, email, password} = req.body
            console.log(req.body)
            const duplicateuser = await userModel.findOne({email})
    
        if(email ==""|| name == ""||password==""){
            const error ="all field reqiured"
            return res.render('user/signup',{error})
        }
    
        if(duplicateuser){
            const error = "User already exists"
            return res.render('user/signup',{errormsg})
        }else{
            const randomOtp= Math.floor(Math.random() * 1000000);
            req.session.tempUser={
                name, email, password, otp:randomOtp
            }
            await sentOTP(email, randomOtp);
            console.log(randomOtp)
            return res.redirect('/signup/otp')
        }
    }catch(err){
        console.log(err)
    }
        
    },
    signupOtp:async(req, res)=>{
        const {otp}=req.body;
        const {name, email, password}= req.session.tempUser;

        if(otp == req.session.tempUser.otp){

            const user = await userModel.create({
                name,email,password
            })
            return res.redirect('/login')
        }

        res.render('user/signupOtp', {error:"invalid OTP"})

    },

    forgetpassword:async(req,res)=>{

        console.log(req.body.email);
        console.log(userModel);
        let email=req.body.email
        const user = await userModel.findOne({email:req.body.email}).lean()
        console.log(user);

        if(user){
            
            const otp = Math.floor(Math.random()*1000)
            req.session.temp ={
                tempOtp : otp,
                email
            }
            console.log(otp)
            await sentOTP(email,otp)
            res.render('user/forgetOtp')
            
            

        }
        else{
            res.render('forgetpassword',{error:"No User Found"})
        }


    },

    forgetOtp:async(req,res)=>{

        const {otp} = req.body
        console.log(req.session.temp.tempOtp)
            console.log(req.body)
        
        if(otp == req.session.temp.tempOtp){
            res.redirect('/forgotpassword/newpassword')
        }else{
            res.render('user/forgetOtp',{error:"OTP is incorrect!"})
            
        }

    },

    newpassword:async(req,res)=>{

        const password = req.body.password
        const newpassword = req.body.newpassword
        const email = req.session.temp.email

        if(password === newpassword){
            await userModel.findOneAndUpdate({email},{$set:{password:newpassword}})
            res.redirect('/login')
        }else{
            res.render('user/newpassword',{error:'Confirmation failed,enter correctly'})
        }

    },

    login:async(req,res)=>{
       
      try{
        const email = req.body.email
        const password = req.body.password

        const userOg = await userModel.findOne({email})

        if(userOg){
           
            if(password === userOg.password && userOg.ban === false){
                req.session.user={
                    id:userOg._id,
                    name:userOg.name,
                    email:userOg.email
                }
                res.redirect('/')
            }
            else{
                res.render('user/login',{error:"Incorrect password!"})
            }
        }
      }catch(err){
        console.log(err);
      }
    }


}