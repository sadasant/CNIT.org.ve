var nodemailer = require('nodemailer');

exports.index = function(req, res) {
  res.render('index', { title: 'CNIT' })
};


exports.participate = function(req, res) {
  res.render('participate', { title: 'CNIT - ¡Participa!' })
}


exports.us = function(req, res) {
  res.render('us', { title: 'CNIT - Nuestro equipo' })
}


exports.sendEmail = function(req,res) {

  var user = req.body.user

  var transportObject = {
    service : "Gmail"
  , auth    : {
      user  : "CNIT@cnit.com"
    , pass  : "ab123456"
    }
  }

  var smptTransport = nodemailer.createTransport("SMTP", transportObject);

  var mailOptions = {
    from    : "examp@CNIT.com"
  , to      : "obeladrian@gmail.com"
  , subject : "Mensaje Desde Node"
  , text    : "Dummy text"
  }

  smptTransport.sendMail(mailOptions, mailSent)

  function mailSent(err,res) {
    if (err) return console.log(error)
    console.log("Message Sent: "+res.message);
  }

  console.log(user)
  res.redirect('back')
}
