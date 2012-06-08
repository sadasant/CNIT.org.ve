var mailer   = require('nodemailer')
  , crypto   = require('crypto')
  , secret   = require('../secret')
  , mongoose = require('mongoose')

// Fields Validation
var validate = {
      email          : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/
    , cedula         : /^[0-9]{6,8}$/
    , just_numbers   : /^[0-9]*$/
    }

// some stuff
var email_times = 0
  , max_email_times = 4
  , CODE_SIZE_BYTES = 4

// Db model
var UserModel = new mongoose.Schema({ 
    "_id"           : mongoose.Schema.ObjectId
  , name            : String
  , last_name       : String
  , email           : String
  , cedula          : String
  , organization    : String
  , city            : String
  , type_of_payment : String
  , payment_number  : Number
  , payment_date    : String
  , payment_ammount : Number
  , tickets_stud    : Number
  , tickets_prof    : Number
  , special_code    : String
  , state           : String
 })
// db model
var User = mongoose.model('users', UserModel)


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

  var name            = req.body.user.name
    , last_name       = req.body.user.last_name
    , email           = req.body.user.email
    , cedula          = req.body.user.cedula
    , organization    = req.body.user.organization
    , city            = req.body.user.city
    , type_of_payment = req.body.user.type_of_payment
    , payment_number  = req.body.user.payment_number
    , payment_date    = req.body.user.payment_date
    , payment_ammount = req.body.user.payment_ammount
    , tickets_stud    = req.body.user.tickets_stud
    , tickets_prof    = req.body.user.tickets_prof
    , ticket_stud_val = 200
    , ticket_prof_val = 400
    , special_code
    , mail_options
    , err

  // Verifying the existence of the critical fields

  if (!name            ) err = 'nombre'               ; else
  if (!last_name       ) err = 'apellido'             ; else
  if (!email           ) err = 'correo'               ; else
  if (!cedula          ) err = 'cédula de indentidad'; else
  if (!organization    ) err = 'organización'        ; else
  if (!city            ) err = 'city'                 ; else
  if (!type_of_payment ) err = 'tipo de pago'         ; else
  if (!payment_number  ) err = 'número de pago'      ; else
  if (!payment_date    ) err = 'fecha de pago'        ; else
  if (!payment_ammount ) err = 'monto de pago'        ; else
  if (!(tickets_stud || tickets_prof))
                         err = 'número de tickets'

  // Validating fields

  if (err) {
    return res.json({ "error" : 'Faltó el campo '+err })
  }

  if (!validate.email.test(email)) {
    err = 'Correo inválido'
  } else
  if (!validate.cedula.test(cedula)) {
    err = 'Cédula inválida'
  } else
  if (!(type_of_payment == 'transferencia' || 'deposito')) {
    err = 'Tipo de pago inválido'
  } else
  if (!validate.just_numbers.test(payment_number)) {
    err = 'Número de pago inválido'
  } else
  if (!validate.just_numbers.test(tickets_stud)) {
    err = 'Número de entradas de estudiantes inválido'
  } else
  if (!validate.just_numbers.test(tickets_prof)) {
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
    return res.json({ error : err })
  }
  // if everything its ok.. we connect with DB
  mongoose.connect(secret.mongo_url)

  // Generating special code...
  getRandomBytes()

  function getRandomBytes() {
    crypto.randomBytes(CODE_SIZE_BYTES, gotRandomBytes)
  }

  function gotRandomBytes(err, buf) {
    if (err) return res.send({ error : "Error generating code" })
    special_code = buf.toString('hex')
    checkInDB()
  }

  function checkInDB() {
    User.count({special_code : special_code}, checkedInDB)
  }

  function checkedInDB(err, count) {
    if (err) return res.send({ error : 'DB error' })
    if (count) return getRandomBytes()
    sendToDB()
  }

  function sendToDB() {
    var user = new User()
    user.name            = name
    user.last_name       = last_name
    user.email           = email
    user.cedula          = cedula
    user.organization    = organization
    user.city            = city
    user.type_of_payment = type_of_payment
    user.payment_number  = +payment_number
    user.payment_date    = payment_date
    user.payment_ammount = +payment_ammount
    user.tickets_stud    = +tickets_stud
    user.tickets_prof    = +tickets_prof
    user.special_code    = special_code
    user.state           = 'espera'

    user.save(savedRegistry)
  }

  function savedRegistry(err) {
    if (err) return res.send({ error : 'Error db' })
    sendMail()

    res.send({"status" : "ok"})
  }

  function sendMail() {

    // TODO:
    //   SEND MAIL TO THE USER AND TO THE CNIT MAIL

    // TODO:
    // put on email/new_request.jade COOL desing & create object
    // to pass it in partial


    smtpTransport = mailer.createTransport("SMTP", secret.transportObject)

    if (mail_options) {
      smtpTransport.sendMail(mail_options, sentMail)
    }else{
      res.partial('email/new_request', {name : name}, function(err, g_html){
        if (err) console.log(err)

        // sending email to cnit ..
        mail_options = {
          from    : "<cnit> cnit.ve@gmail.com"
        , to      : "cnit.ve@gmail.com"
        , subject : "Registro usuario: " + name + " " + last_name
        , html    : g_html
        }

        smtpTransport.sendMail(mail_options, sentMail)
      })
    }
  }

  function sentMail(err, res){
    // just preventing infinite email sending
    email_times++
    if (err){
      if(email_times <= max_email_times){
          smtpTransport.close()
          return sendMail()
      }else {email_times = 0;return}
    }
  }
}
