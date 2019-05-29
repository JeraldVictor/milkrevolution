var express = require('express');
var router = express.Router();

let auth = require('../auth');
const uniqid = require('uniqid');
const db = require("../db");

router.get('/',auth(),(req,res)=>{
    db.query("select * from products",(err,list)=>{
        if(err){
            throw err;
        }else{
            res.render("shop",{list});
        }
    })
})

router.post('/',auth(),(req,res)=>{

    let record ={
        id:uniqid(),
        uid:  req.session.userId,
        phn :req.session.phn,
        name:req.session.username,
        product:req.body.product,
        quantity:req.body.qt,
        status : 'pending',
        odate:req.body.date, 
        per:req.body.per,
        total:req.body.total,
        productId:req.body.pid
    }
    db.query("select id as uid from users where id=?",[record.uid],(err,list)=>{
        if(err){
            throw err
        }else{
            if(list.length >0){
                db.query("INSERT INTO `buyer`(`id`, `uid`, `name`, `phn`, `product`, `quantity`, `status`, `odate`, `per`, `total`) VALUES (?,?,?,?,?,?,?,?,?,?)",
                [record.id,record.uid,record.name,record.phn,record.product,record.quantity,record.status,record.odate,record.per,record.total],(err1)=>{
                    if(err1){
                        throw err1
                    }else{
                        db.query("select * from products where id=?",[record.productId],(err2,list1)=>{
                            if(err2){
                                throw err2;
                            }else{
                                res.render("product",{list:list1[0],msg:"Thank You We Will Contact You As Soon As Posible",alert:'success'});
                            }
                        })
                    }
                })
                // res.send({res:req.body})
            }else{
                res.render("product",{msg:"Error While Ordering",alert:'warning'});
            }
        }
    })
})

router.get('/product/:id',auth(),(req,res)=>{
    // res.send("Product "+req.params.id);
    db.query("select * from products where id=?",[req.params.id],(err,list)=>{
        if(err){
            throw err;
        }else{
            res.render("product",{list:list[0],msg:null});
        }
    })
})

router.get('/:id',auth(),(req, res)=> {
    // res.send('<h1 style="text-align:center">Page Under Construction<h1>')
    res.render('index', { title: 'Milk Revolution',msg:"Page Under Construction" });
});

module.exports = router;