var nodemailer = require('nodemailer');
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'CNIT' })
};

exports.participate = function(req, res) {
  res.render('participate', { title: 'CNIT - ¡Participa!' })
}

exports.us = function(req, res) {
  res.render('us', { title: 'CNIT - Nuestro equipo' })
}

exports.sendEmail = function(req,res){
  var smptTransport  = nodemailer.createTransport("SMTP",{
  	service: "Gmail",
  	auth: {
  		user: "CNIT@cnit.com",
  		pass: "ab123456"
  	}
  });
  var mailOptions = {
  	from   : "examp@CNIT.com",
  	to     : "obeladrian@gmail.com",
  	subject: "Mensaje Desde Node",
  	text   : "Dummy text"
  }
  smptTransport.sendMail(mailOptions,function(err,res){
  	err ? console.log(error) : console.log("Message Sent: "+res.message);

  });
  console.log(req.body.user);
  res.redirect('back');
}