var express = require('express');
var router = express.Router();

const uniqid = require('uniqid');
const db = require("../db");
let multer = require('multer');
const fs =require('fs'),
path = require("path"),
b64 = require('base64-async');

let auth = require('../auth');
let sendMail = require("../mail").sendMail


// Setting up multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/uploads/')
    },
    filename: function(req, file, cb){
        global.fn= file.originalname;
        cb(null,global.fn);
    }
});
const upload=multer({storage:storage});

router.get('/',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
        
    db.query("SELECT * FROM `buyer` where status='pending'",(err1,list1)=>{
        if(err1) throw err1
        db.query("SELECT * FROM `seller` where status = 'pending'",(err2,list2)=>{
            if(err2) throw err2
            res.render('dashboard',{name:req.session.username,order:list1,products:list2});
        })
    })
    }
})

router.get('/buy',(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    db.query("SELECT * FROM `users` WHERE `roll`='buyer'",(err,list)=>{
        if(err) throw err
        res.render('admin/buy',{list})
    })
    }
})

router.get('/sell',(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    db.query("SELECT * FROM `users` WHERE `roll`='seller'",(err,list)=>{
        if(err) throw err
        res.render('admin/sell',{list})
    })
    }
})
router.get('/email/:id',(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    res.send({email:req.params.id})
    }
})

router.get('/products/list',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    db.query("select * from products",(err,list)=>{
        if(err){
            throw err;
        }else{
            res.send(list)
        }
    })
    }
});

router.get('/products',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    db.query("SELECT * FROM `products`",(err,list)=>{
        if(err) throw err;
        res.render('admin/product',{list});
    })
    }
})

router.get('/products/add',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    res.render('admin/add-product',{msg:null})
    }
})


router.post('/products/add',upload.any(),(req,res)=>{
    
    let record = {
        id:uniqid(),
        title:req.body.title,
        cost:req.body.cost,
        stock:req.body.stock,
        msg:req.body.msg
    }
    let loc='./public/uploads/'+global.fn;
    let buffer  = fs.readFileSync(loc)
    b64.encode(buffer).then((base64Image)=>{
        // res.send(base64Image.toString())
        // res.send(record);
        db.query("INSERT INTO `products`(`id`, `title`, `cost`, `stock`, `msg`, `image`) VALUES (?,?,?,?,?,?)",
        [record.id,record.title,record.cost,record.stock,record.msg,base64Image],(err)=>{
            if(err){
                throw err
            }else{
                fs.unlinkSync(loc);
                res.render('admin/add-product',{msg:'Product Added',alert:'success'})
            }
        })
    })
})

router.get('/products/update/:id',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    db.query("SELECT * FROM `products` where id=?",[req.params.id],(err,list)=>{
        if(err) throw err;
        res.render('admin/update-product',{list:list[0],msg:null})
    })
    }
})

router.post('/products/update/:id',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    let record = {
        id:req.params.id,
        title:req.body.title,
        cost:req.body.cost,
        stock:req.body.stock,
        msg:req.body.msg
    }
    
    // res.send(base64Image.toString())
    // res.send(record);
    db.query("UPDATE `products` SET `title`=?,`cost`=?,`msg`=? WHERE `id` =?",
    [record.title,record.cost,record.msg,record.id],(err)=>{
        if(err){
            throw err
        }else{
            db.query("SELECT * FROM `products` where id=?",[req.params.id],(err,list)=>{
                if(err) throw err;
                res.render('admin/update-product',{list:list[0],msg:'Product Updated',alert:'success'})
            })
            
        }
    })
    }
})

router.get("/products/update/image/:id",auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    db.query("SELECT * FROM `products` where id=?",[req.params.id],(err,list)=>{
        if(err) throw err;
        res.render('admin/image-update',{msg:null,id:req.params.id,list:list[0]});
    })
    }
})

router.post('/products/update/image/:id',upload.any(),(req,res)=>{
    let loc='./public/uploads/'+global.fn;
    let buffer  = fs.readFileSync(loc)
    b64.encode(buffer).then((base64Image)=>{
        db.query(" UPDATE `products` SET `image`=? where id=?",[base64Image,req.params.id],(err,list)=>{
            if(err) throw err
            fs.unlinkSync(loc);
            db.query("SELECT * FROM `products` where id=?",[req.params.id],(err,list)=>{
                if(err) throw err;
                res.render('admin/update-product',{list:list[0],msg:'Image Updated',alert:'success'})
            })
        })
    })
})

router.get('/products/delete/:id',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
   db.query("delete * from products where id=?",[req.params.id],(err,list)=>{
       if(err) throw err
       res.redirect('/admin/products')
   })
    }
})


router.get('/pending',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    db.query("SELECT * FROM `buyer` where status='pending'",(err1,list1)=>{
        if(err1) throw err1
        db.query("SELECT * FROM `seller` where status = 'pending'",(err2,list2)=>{
            if(err2) throw err2
            res.render('admin/pending',{order:list1,products:list2});
        })
    })
    }
})

router.get('/pending/:status/:id',(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    if(req.params.status == 'product'){
        db.query("UPDATE `buyer` SET `status`='finished' where id=?",[req.params.id],(err,list)=>{
            if(err){
                throw err
            }else{
                res.redirect('/admin/pending')
            }
        });
    }else if(req.params.status == 'order'){
        db.query("UPDATE `seller` SET  `status`='finished' where id=?",[req.params.id],(err,list)=>{
            if(err){
                throw err
            }else{
                res.redirect('/admin/pending')
            }
        });
    }
    }
})

router.get('/stock',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    db.query("SELECT * FROM `products`",(err,list)=>{
        if(err) throw err
        res.render("admin/stock",{list})
    })
    }
})

router.get('/stock/:status/:id',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    if(req.params.status == 'true'){
        db.query("update `products` set stock ='true'",(err,list)=>{
            if(err) throw err
            res.redirect('/admin/stock');
        })
    }else{
        db.query("update `products` set stock ='false'",(err,list)=>{
            if(err) throw err
            res.redirect('/admin/stock');
        })
    }
    }
})

router.get('/email',auth(),(req,res)=>{
    if(req.session.roll != 'admin'){
        req.session.userId = undefined;
        req.session.roll = undefined;
        req.session.destroy(function(err) {
          if(err) console.log(err);
          res.render("login", { msg: "Not Authorised",link:'/login' })
        });
    }else{
    res.render('admin/email');
    }
})

router.post('/email',auth(),(req,res)=>{
    let body=req.body.body
    body = body.replace(/\n/gi, '<br>')
    sendMail(req.body.to,req.body.sub,body)
    // console.log(body)
    res.render('admin/email');
})

router.get("/user/seller/:id",auth(),(req,res)=>{
    // res.send("Page Under Construction")
    db.query("SELECT * from users JOIN seller ON users.id = ? and seller.uid =?",[req.params.id,req.params.id],(err,list)=>{
        if(err) throw err
        res.render('admin/transaction',{list,buyer:false})
    })
})

router.get("/user/buyer/:id",auth(),(req,res)=>{
    // res.send("Page Under Construction")
    db.query("SELECT * from users JOIN buyer ON users.id = ? and buyer.uid =?",[req.params.id,req.params.id],(err,list)=>{
        if(err) throw err
        res.render('admin/transaction',{list,buyer:true})
    })
})

router.get('/:id',auth(),(req, res)=> {
    res.send('<h1 style="text-align:center">Page Under Construction<h1>')
});

module.exports = router;