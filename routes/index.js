var mailer = require('nodemailer')
  , crypto = require('crypto')
  , secret = require('./secret')

// Fields Validation
var validate = {
      email          : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/
    , cedula         : /^[0-9]{6,8}$/
    , just_numbers   : /^[0-9]*$/
    }

// Route: /
exports.index = function(req, res) {
  res.render('index', { title: 'CNIT' })
}

// Route: /participate
exports.participate = function(req, res) {
  res.render('participate', { title: 'CNIT - ¡Participa!' })
}

// Route: /us
exports.us = function(req, res) {
  res.render('us', { title: 'CNIT - Nuestro equipo' })
}

// Route: /register
exports.register = function(req,res) {

  var name            = body.req.name
    , last_name       = body.req.last_name
    , email           = body.req.email
    , cedula          = body.req.cedula
    , organization    = body.req.organization
    , city            = body.req.city
    , type_of_payment = body.req.type_of_payment
    , payment_number  = body.req.payment_number
    , payment_date    = body.req.payment_date
    , payment_ammount = body.req.payment_ammount
    , tickets_stud    = body.req.tickets_stud
    , tickets_prof    = body.req.tickets_prof
    , ticket_stud_val = 200
    , ticket_prof_val = 400
    , special_code
    , mail_options
    , err

  // Verifying the existence of the critical fields

  if (!name            ) err = 'nombre'               ; else
  if (!last_name       ) err = 'apellido'             ; else
  if (!email           ) err = 'correo'               ; else
  if (!cedula          ) err = 'cédula de indentidad' ; else
  //if (!organization    ) err = 'organización'         ; else
  //if (!city            ) err = 'city'                 ; else
  if (!type_of_payment ) err = 'tipo de pago'         ; else
  if (!payment_number  ) err = 'número de pago'       ; else
  if (!payment_date    ) err = 'fecha de pago'        ; else
  if (!payment_ammount ) err = 'monto de pago'        ; else
  if (!(tickets_stud || tickets_prof))
                         err = 'número de tickets'

  // Validating fields

  if (err) {
    res.json({ error : 'Faltó el campo '+err })
  }

  if (!validate.email.test(email)) {
    err = 'Correo inválido'
  } else
  if (!validate.cedula.test(cedula)) {
    err = 'Cédula inválida'
  } else
  if (!(payment_type == 'transferencia' || 'deposito')) {
    err = 'Tipo de pago inválido'
  } else
  if (!validate.just_numbers.test(payment_number)) {
    err = 'Número de pago inválido'
  } else
  if (!validate.just_numbers.test(tickets_stud)) {
    err = 'Número de entradas de estudiantes inválido'
  } else
  if (!validate.just_numbers.test(ticket_prof)) {
    err = 'Número de entradas de profesionales inválido'
  } else
  if (!validate.just_numbers.test(payment_ammount)) {
    err = 'Monto de pago inválido'
  }

  total = (+tickets_stud * ticket_stud_val) + (+tickets_prof * ticket_prof_val)
  if ((+payment_ammount < total) || (+payment_ammount > total)) {
    err = 'El pago introducido no coincide con el monto total de entradas'
  }

  if (err) {
    res.json({ error : err })
  }

  // Generating special code...
  getRandomBytes()

  function getRandomBytes() {
    crypto.randomBytes(4, gotRandomBytes)
  }

  function gotRandomBytes(err, buf) {
    if (err){
      console.error("Error generating user code")
      return res.send({ "status" : "fail", "error" : "Error generating code" })
    }
    special_code = buf.toString('hex')
    checkInDB()

  function checkInDB() {
    // Check in db
    // db.registry.find({special_code : special_code}, checkedInDB)
  }

  function checkedInDB(err, reg) {
    if (err) return res.send({ error : ':( hubo un error' })
    if (reg) return getRandomBytes()
    sendToDB()
  }

  function sendToDB() {
    // Send it to mongo
    //
    // var reg = {
    //   // estructure...
    //   state = 'esperando'
    // }
    //
    // reg = new db.registry(reg)
    //
    // reg.save(savedRegistry)
    //
  }

  function savedRegistry(err) {
    if (err) return res.send({ error : ':( hubo un error' })
    sendMail()
    // returning json ..
    res.send({"status" : "ok"})
  }

  function sendMail() {

    // TODO:
    //   SEND MAIL TO THE USER AND TO THE CNIT MAIL

    // transport object created with secret file options...

    smtpTransport = mailer.createTransport("SMTP", secret.transportObject)

    if (mail_options) {
      smtpTransport.sendMail(mail_options, sentMail)
    }

    // generating html body email with data..
    res.partial('email/new_request', user, function(err, html){
      if (err){
        console.error("Error generating body/email html")
        return res.send({ "status" : "fail", "error" : "Error generating email" })
      }

      // sending email to cnit ..
      mail_options = {
        from : "cnit.ve@gmail.com"
      , to : "cnit.ve@gmail.com"
      , subject : "Registro usuario: " + name + " " + last_name
      , html : html
      }

      smtpTransport.sendMail(mail_options, sentMail)
    }
  }

  function sentMail(err, res){
    smtpTransport.close()
    if (err) return sendMail()
  }

}
