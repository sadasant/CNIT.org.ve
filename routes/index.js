var mailer = require('nodemailer')
  , crypto = require('crypto')
  , secret = require('./secret')

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

  // TODO:
  //  According to the issue: <https://github.com/sadasant/CNIT.org.ve/issues/1>
  //  the form will send to this route the following body elements:
  //    · name
  //    · lastName
  //    · email
  //    · identityCard
  //    · organization
  //    · city
  //    · type_of_payment
  //    · payment_number
  //    · payment_date
  //    · payment_ammount
  //    · n_tickets
  //
  //  So, req.body should have each one of them...

  var user = req.body.user

  // TODO:
  //  Once that we've stored each of the received body elements
  //  we should validate them, like this:
  //
  //  if (!mail.search(validMail)) {
  //    return res.send({ error : "Invalid Mail" })
  //  }
  //
  //  Where `validMail` is a RegEx.
  //  Usually regexes will do all this dirty job,
  //  so this is a plus thing, it's time to learn regexes! :D

  // Generating special code...

  crypto.randomBytes(4, function(err, buf) {
    if (err){
      console.error("Error generating user code")
      return res.send({ "status" : "fail", "error" : "Error generating code" })
    }
    user.special_code = buf.toString('hex'));
  });

  // transport object created with secret file options...

  var smtpTransport = mailer.createTransport("SMTP", secret.transportObject)
    , emailText

  
  // generating html body email with data..
  
  res.partial('email/new_request', user, function(err, body){
    if (err){
      console.error("Error generating body/email html")
      return res.send({ "status" : "fail", "error" : "Error generating email" })
    }
    emailText = body
  }

  // sending email to cnit ..
  
  var mailOptions = {
    from : "cnit.ve@gmail.com"
  , to : "cnit.ve@gmail.com"
  , subject : "Registro usuario: " + user.name + " " + user.lastName
  , html : emailText
  }

  smtpTransport.sendMail(mailOptions, function(err, res){
    if(err){
      console.error("Error sending email")
      return res.send({ "status" : "fail", "error" : "Error sending email" })
    }
    smtpTransport.close();
  })

  // returning json ..
  
  res.send({"status" : "ok" , "code" : user.special_code})

})