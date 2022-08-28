const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require('nodemailer');
const path = require('path');
const { config } = require("dotenv");

require("dotenv").config();



var users = require("./src/model/user")

let port = 3000;
const App = new express();


App.listen(process.env.PORT || port , (err)=>{
    if(err)
    console.log(err)
    else
    console.log("connected to server on port "+port)
});

App.use(cors());
App.use(express.json());
App.use(express.urlencoded({extended:true}));

App.use(express.static('./dist/frontend'));


var dbpath= "mongodb+srv://subin:subin@cluster0.dpmyivk.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(dbpath,{useNewUrlParser:true, useUnifiedTopology:true});

var db = mongoose.connection;

db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("connected to DB");
});

App.post("/api/sendotp",(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: PUT, PATCH, DELETE, POST, GET");
    var OTP = Math.floor(1000 + Math.random() * 9000);
    let user={
        email: req.body.item.email,
        name : req.body.item.name,
        otp: OTP
    }
    users.findOneAndRemove({"email":user.email})
    .then(()=>{
        console.log("Removed old duplicate entry")
    })
    
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "inconspicuouscreature@gmail.com",
            pass: "qodkocdczgaucvki"
          }
    });
    let mailDetails = {
        from: 'inconspicuouscreature@gmail.com',
        to: user.email,
        subject: 'OTP for Sign up',
        html:"Hello "+user.name+"<br> Please find the below OTP in order to sign in <br> <h1>"+user.otp+"</h1>"
    }

    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            console.log('Email sent successfully');
        }
    });

    user = new users(user);
    user.save();
    res.send(user);
})


App.post("/api/otpverification",(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: PUT, PATCH, DELETE, POST, GET");
    let otp={
        email: req.body.item.user,
        otp : req.body.item.code,
    }
    console.log(otp)

    users.findOne({"email":otp.email},(err,data)=>{
        let status;
        if(err)
        console.log(err)
        else if(data.otp==otp.otp){
            console.log("success");
            status= true
            res.send(status)
        }
        else
        {
            status=false;
            console.log("Incorrect otp");
            res.send(status)
        }
    })
    
})   

App.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/frontend/index.html'));
    });  