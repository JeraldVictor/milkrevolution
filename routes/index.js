var express = require('express');
var router = express.Router();

let sendMail = require("./mail").sendMail
let auth = require('./auth');

const crypto = require('crypto');
const uniqid = require('uniqid');
const db = require("./db");


// let subject = "Jerald's Msg"
// let body = "hey its jerald from new mail"
// sendMail("fly2jeraldvictor1999@gmail.com", subject, body)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Milk Revolution',msg:null });
});

router.get('/login',(req,res)=>{
  res.render("login", {
    msg: null,link:'/login'
  });
})

router.post("/login", (req, res) => {
  let phn = req.body.phn;
  let password = req.body.password;

  db.query("select * from users where phn = ?", [phn], (err, list) => {
    if (err) {
      console.log(err)
    } else {
      if (list.length > 0) {
        crypto.pbkdf2(password, 'salt', 10, 64, 'sha512', (err, hash) => {
          if (err) throw err;
          if(list[0].password === hash.toString('hex')){
            req.session.userId = list[0].id;
            req.session.username = list[0].name
            req.session.roll = list[0].roll
            req.session.phn = list[0].phn
            if (req.session.roll === "admin") {
              res.redirect("/admin")
            } else if (req.session.roll === "buyer") {
              // res.redirect("/buyer/"+list[0].id)
              res.redirect('/buyer');
            }else if (req.session.roll === "seller") {
              res.redirect('/buyer');
            }
          } else {
            res.render("login", {
              msg: "Incorrect UserId/Password",link:'/login'
            });
          }
        })
      } else {
        res.render("login", {
          msg: "UserId Not Found",link:'/login'
        });
      }
    }
  })
})

router.get('/login/admin',(req,res)=>{
  res.render("login", {
    msg: null,link:'/login/admin'
  });
})

router.post("/login/admin", (req, res) => {
  let phn = req.body.phn;
  let password = req.body.password;

  db.query("select * from users where email = ?", [phn], (err, list) => {
    if (err) {
      console.log(err)
    } else {
      if (list.length > 0) {
        crypto.pbkdf2(password, 'salt', 10, 64, 'sha512', (err, hash) => {
          if (err) throw err;
          if(list[0].password === hash.toString('hex')){
            req.session.userId = list[0].id;
            req.session.username = list[0].name
            req.session.roll = list[0].roll
            req.session.phn = list[0].phn
            if (req.session.roll === "admin") {
              res.redirect("/admin")
            } 
          } else {
            res.render("login", {
              msg: "Incorrect UserId/Password"
            });
          }
        })
      } else {
        res.render("login", {
          msg: "UserId Not Found"
        });
      }
    }
  })
})

router.get('/reg',(req,res)=>{
  res.render("register", {
    msg: null
  });
})

router.post('/reg',(req,res)=>{
  let password = req.body.password
  let roll = req.body.roll
  let name = req.body.name
  let phn = req.body.phn
  let email = req.body.email
  let shop = req.body.shop
  let address = req.body.address
  
  crypto.pbkdf2(password, 'salt', 10, 64, 'sha512', (err, hash) => {
    if (err) throw err;
    let record = {
      id: uniqid(),
      password: hash.toString('hex'),
      roll,
      name,
      phn,
      email,
      shop,
      address
    };
    // res.send({record})
    db.query("INSERT INTO `users`(`id`, `phn`, `name`, `email`, `roll`, `address`, `shop`, `password`) VALUES (?,?,?,?,?,?,?,?)",
    [record.id,record.phn,record.name,record.email,record.roll,record.address,record.shop,record.password],(err)=>{
      if(err){
        throw err
      }else{
        let subject = "Welcome To MilkRevolution "+ record.name
        let body = 
        `Dear ${record.name} , <br>
        Thank You For Registering With us.
        <br> 
        Now You can Login To Our Website Using
        <br>
        Your Mobile Number <strong> ${record.phn}</strong> will be your User Id To Login & Password which you gave while Registation.
        <br>
        With Regards
        Team Milk Revolution
        email: contact@milkrevelution.in
        `
        sendMail(record.email, subject, body)
        subject = 'New Registation Mr.'+ record.name
        sendMail('meril@milkrevolution.in', subject, body)
        res.render('register',{msg:'Registered'});
      }
    })
  })
})


router.get("/logout", (req, res) => {
  req.session.userId = undefined;
  req.session.roll = undefined;
  req.session.destroy(function(err) {
    if(err) console.log(err);
    res.render("login", { msg: "logged Out Sucessfully",link:'/login' })
  });
})
module.exports = router;
