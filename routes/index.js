var mailer = require('nodemailer');

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

  // TODO:
  //  Now that you have validated the data,
  //  it's time to create the random value, this is less important right now, so just
  //  save a string like:
  //    var randomValue = 'this will be the random value after the rest is done'

  // TODO:
  //  Then you can make the transport object...
  //  to make sure our users and passwords are not
  //  available to the public, you can include
  //  a secret.js file on the top of this file
  //  that secret could be similar to this file:
  //    <https://gist.github.com/2859635#file_secret.js>
  //
  //  So here we could do like:
  //    service : secret.service // haha, awesome!
  //
  //  Remember to add that secret file to the .gitignore file.

  // TODO:
  //  So far so good, now it's time to send the freaking mail.
  //  Express lets you render partial views, like this:
  //
  //    var data = {
  //      // Cool things that the jade view will use
  //    }
  //
  //    res.partial('email/new_request', data, renderedPartial)
  //
  //    function renderedPartial(err, body) {
  //      if (err) {
  //        console.log(err)
  //        return res.send({ error : "D:" }) // I kid, write a better error x_x
  //      }
  //
  //      var options = {
  //        // sendMail options
  //        html : body
  //      }
  //
  //      smptTransport.sendMail(options, mailSent)
  //    })
  //
  //    // etc...
  //
  //  As you can see, we received a `body` with the html
  //  using `res.partial` :)
  //  yey!! \o/
  //

  var transportObject = {
    service : "Gmail"
  , auth    : {
      user  : "CNIT@cnit.com"
    , pass  : "ab123456"
    }
  }

  var smptTransport = mailer.createTransport("SMTP", transportObject);

  var mailOptions = {
    from    : "examp@CNIT.com"
  , to      : "obeladrian@gmail.com"
  , subject : "Mensaje Desde Node"
  , text    : "Dummy text"
  }

  smptTransport.sendMail(mailOptions, mailSent)

  function mailSent(err,res) {
    if (err) return console.log(err)
    console.log("Message Sent: "+res.message);
  }

  console.log(user)
  res.redirect('back')
}
