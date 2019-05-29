var express = require('express');
var router = express.Router();

const uniqid = require('uniqid');
const db = require("../db");

let auth = require('../auth');
let sendMail = require("../mail").sendMail

router.get('/',(req,res)=>{
    db.query("SELECT * FROM `products`",(err,list)=>{
        if(err) throw err;
        res.render('seller',{msg:null,list});
    })
    
})

router.post('/',(req,res)=>{
    let record ={
        id : uniqid(),
        uid : '',
        phn : req.body.phn,
        name: req.body.name,
        odate:req.body.date,
        product:req.body.product,
        quantity : req.body.qt,
        msg:req.body.msg,
        status:'pending'
    }
    db.query("select id as uid ,email from users where phn=?",[record.phn],(err,list)=>{
        if(err){
            throw err
        }else{
            if(list.length >0){
                record.uid = list[0].uid
                db.query("INSERT INTO `seller`(`id`, `uid`, `phn`, `name`, `odate`, `product`, `quantity`, `msg`, `status`) VALUES (?,?,?,?,?,?,?,?,?)",
                [record.id,record.uid,record.phn,record.name,record.odate,record.product,record.quantity,record.msg,record.status],(err1)=>{
                    if(err1){
                        throw err1
                    }else{
                        let subject = "Greetings From MilkRevolution "+ record.name
                        let body = 
                        `Dear ${record.name} , <br>
                        Thank You For Intrest on Us, Our Team Will contact you soon.
                        <br> 
                        <br>
                        With Regards
                        Team Milk Revolution
                        email: support@milkrevelution.in
                        `
                        sendMail(list[0].email, subject, body)
                        subject = 'Product Arrived by Seller To Your Site By Mr.'+ record.name
                        sendMail('meril@milkrevolution.in', subject, body)
                        db.query("SELECT * FROM `products`",(err1,list2)=>{
                            if(err1) throw err1;
                        res.render('seller',{msg:'Thank You We Will Contact You As Soon As Posible',alert:'success',list:list2});
                        })
                    }
                })
            }else{
                db.query("SELECT * FROM `products`",(err1,list2)=>{
                    if(err1) throw err1;
                res.render('seller',{msg:'User Not Found Please Register',alert:'danger',list:list2});
                })
            }
        }
    })
})

router.get('/:id',auth(),(req, res)=> {
    // res.send('<h1 style="text-align:center">Page Under Construction<h1>')
    res.render('index', { title: 'Milk Revolution',msg:"Page Under Construction" });
});

module.exports = router;