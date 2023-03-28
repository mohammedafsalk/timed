const userModel = require("../models/userModel");

async function checkUser(req, res, next){
    const id=req.session?.user?.id;
    if(id){
        let user = await userModel.findOne({_id:id}, {password:0});
        req.user=user
        next()

    }else{
        req.session.user=null;
        res.redirect("/login")
    }
}

module.exports=checkUser