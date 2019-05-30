const mysql      = require('mysql');
const options= require('./options')

const connection = mysql.createConnection(options);

connection.connect((err)=>{
    if(err){
      console.log(err)
    }else{
      console.log("ok mysql connected")
    }
  });
  setInterval(function () {
    connection.query('SELECT 1');
  }, 5000);
  module.exports = connection;