const express = require('express')
const userModel = require('../models/userModel')
const router = express.Router();

const userlogin = (req,res)=>{
    res.render('userlogin')
}

const usersignup =(req,res)=>{
    res.render('usersignup')
}

const getusersignup = async(req,res)=>{

    const {uname:name,uemail=email,uphone:phone,upword:password} = req.body
    const duplicateuser = await userModel.findOne({email})

    if(uemail ==""|| uname == ""|| uphone ==""||upassword==""){
        const error ="all field reqiured"
        res.render('userSignup',{error})
    }

    if(duplicateuser){
        const errormsg = "User already exists"
        res.render('usersignup',{errormsg})
    }else{

        const user = new userModel ({name:uname,email:uemail,phone:uphone,password:upassword})
    }
    
}





module.exports={

    userlogin,usersignup

}