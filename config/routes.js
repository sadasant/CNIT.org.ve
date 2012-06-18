
// Modules
const mailer   = require('nodemailer')
    , crypto   = require('crypto')

var db
  , secret
  , routes = {}

// Fields Validation
var validate = {
      email          : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/
    , cedula         : /^[0-9]{6,8}$/
    , payment_number : /^\S{8,30}$/
    , just_numbers   : /^[0-9]*$/
    }

// Default global values
var max_email_times = 4
  , CODE_SIZE_BYTES = 4
  , ticket_stud_val = 200
  , ticket_else_val = 400


// Exporting...
module.exports = function(app) {

  db = app.set('db')
  secret = app.set('secret')

  app.get ('/'         , routes.index)
  app.post('/register' , routes.register)
  app.get ('/admin'    , routes.admin)
  app.post('/admin'    , routes.admin)
  app.post('/find'     , routes.find)
  app.post('/update'   , routes.update)
  app.get ('*'         , routes.e404)

}


// Possible improvements (TODO?):
// - Isolate routes by type, for example, index should be in ../routes/index.js
// - Put all the big code for creating tickets inside the ticket model


// Route: /
routes.index = function(req, res) {
  res.render('index', { title: 'CNIT' })
}

// Route: /register
routes.register = function(req,res) {

  var name            = req.body.name
    , last_name       = req.body.last_name
    , email           = req.body.email.trim()
    , cedula          = req.body.cedula.trim()
    , organization    = req.body.organization
    , city            = req.body.city
    , reference       = req.body.reference
    , unitec          = req.body.unitec
    , fapi            = req.body.fapi
    , uba             = req.body.uba
    , type_of_payment = req.body.type_of_payment
    , payment_number  = req.body.payment_number.replace(/[^0-9]+/g,'')
    , payment_date    = req.body.payment_date
    , payment_ammount = +req.body.payment_ammount
    , tickets_stud    = +req.body.tickets_stud
    , tickets_else    = +req.body.tickets_else
    , total_tickets   = tickets_stud + tickets_else
    , email_times     = 0
    , special_codes   = []
    , last_code
    , mail_options
    , err
    , ticket

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
  if (!(tickets_stud || tickets_else))
                         err = 'número de tickets'

  // Validating fields

  if (err) {
    return res.json({ "error" : 'Faltó el campo: '+err })
  }

  if (!validate.email.test(email)) {
    err = 'Correo inválido'
  } else
  if (!validate.cedula.test(cedula)) {
    err = 'Cédula inválida'
  } else
  if (!(type_of_payment && (type_of_payment == 'transferencia' || type_of_payment == 'deposito'))) {
    err = 'Tipo de pago inválido'
  } else
  if (!validate.payment_number.test(payment_number)) {
    err = 'Número de pago inválido'
  }

  total = (+tickets_stud * ticket_stud_val) + (+tickets_else * ticket_else_val)
  if ((+payment_ammount < total) || (+payment_ammount > total)) {
    err = 'El pago introducido no coincide con el monto total de entradas'
  }

  if (err) {
    return res.json({ error : err })
  }

  // Looking for a similar ticket
  db.tickets.count({ cedula : cedula, payment_number : payment_number }, foundTicket)

  function foundTicket(err, reg) {
    if (err) return res.json({ error : 'Por favor inténtalo de nuevo'})
    if (reg) return res.json({ error : 'El número de transacción ya ha sido utilizado'})
    // Generating special code...
    getRandomBytes()
  }

  function getRandomBytes() {
    crypto.randomBytes(CODE_SIZE_BYTES, gotRandomBytes)
  }

  function gotRandomBytes(err, buf) {
    if (err) return res.send({ error : "Error generating code" })
    last_code = buf.toString('hex')
    checkCodeInDB()
  }

  function checkCodeInDB(code) {
    db.tickets.count({special_codes : last_code}, checkedCodeInDB)
  }

  function checkedCodeInDB(err, count) {
    if (err) return res.send({ error : 'DB error' })
    if (count) return getRandomBytes()
    special_codes.push(last_code)
    if (special_codes.length < total_tickets) {
      return getRandomBytes()
    }
    sendToDB()
  }

  function sendToDB() {

    ticket = {
      name            : name
    , last_name       : last_name
    , email           : email
    , cedula          : cedula
    , organization    : organization
    , city            : city
    , reference       : reference
    , unitec          : unitec
    , fapi            : fapi
    , uba             : uba
    , type_of_payment : type_of_payment
    , payment_number  : payment_number
    , payment_date    : payment_date
    , payment_ammount : +payment_ammount
    , tickets_stud    : +tickets_stud
    , tickets_else    : +tickets_else
    , special_codes   : special_codes
    , state           : 'espera'
    }

    ;(new db.tickets(ticket)).save(savedTicket)

  }

  function savedTicket(err) {
    if (err) return res.send({ error : 'Error db' })
    sendMail()

    res.send({"status" : "ok"})
  }

  function sendMail() {

    smtpTransport = mailer.createTransport("SMTP", secret.transportObject)

    if (mail_options) {
      smtpTransport.sendMail(mail_options, sentMail)
      return
    }

    res.partial('email/new_request', { ticket : ticket }, function(err, html){
      if (err) console.log(err)

      // sending email to cnit ..
      mail_options = {
        from    : "CNIT.org.ve cnit.ve@gmail.com"
      , to      : "cnit.ve@gmail.com"
      , subject : "Nuevo Ticket: " + name + " " + last_name
      , html    : html
      }

      smtpTransport.sendMail(mail_options, sentMail)
    })
  }

  function sentMail(err){
    // just preventing infinite email sending
    email_times++

    if (err && email_times <= max_email_times){
      smtpTransport.close()
      return sendMail()
    }
  }
}

// Route: /admin
routes.admin = function(req, res) {
  var user = req.body.user
    , pass = req.body.pass
    , valid

  if (!req.session.admin) {
    valid = user === secret.auth.user && pass === secret.auth.pass
    if (!valid) {
      return res.render('auth', { title : 'Autenticar' })
    }
    req.session.admin = true
  }

  res.render('admin', { title : 'Panel Administrativo' })
}


// Route: /find
routes.find = function(req, res) {

  var query
    , k

  if (!req.session.admin) {
    return res.send(':(')
  }

  query = {
    name            : req.body.name
  , last_name       : req.body.last_name
  , email           : req.body.email
  , cedula          : req.body.cedula
  , organization    : req.body.organization
  , city            : req.body.city
  , reference       : req.body.reference
  , unitec          : req.body.unitec
  , fapi            : req.body.fapi
  , uba             : req.body.uba
  , type_of_payment : req.body.type_of_payment
  , payment_number  : req.body.payment_number
  , payment_date    : req.body.payment_date
  , payment_ammount : +req.body.payment_ammount
  , tickets_stud    : +req.body.tickets_stud
  , tickets_else    : +req.body.tickets_else
  , special_codes   : req.body.special_codes
  , state           : req.body.state
  }

  // Looking for a similar ticket
  for (k in query) {
    if (!query[k] || (typeof query[k] !== 'string' && isNaN(query[k]))) {
      delete query[k]
    }
  }

  console.log(query)
  db.tickets.find(query, foundTicket)

  function foundTicket(err, tickets) {
    tickets = tickets.map(function(e) {
      return {
        id              : e._id.toString()
      , name            : e.name
      , last_name       : e.last_name
      , email           : e.email
      , cedula          : e.cedula
      , organization    : e.organization
      , city            : e.city
      , reference       : e.reference
      , unitec          : e.unitec
      , fapi            : e.fapi
      , uba             : e.uba
      , type_of_payment : e.type_of_payment
      , payment_number  : e.payment_number
      , payment_date    : e.payment_date
      , payment_ammount : +e.payment_ammount
      , tickets_stud    : +e.tickets_stud
      , tickets_else    : +e.tickets_else
      , special_codes   : e.special_codes
      , state           : e.state
      }
    })
    res.partial('partials/tickets', { tickets : tickets }, function(err, html){
      res.send(err || html)
    })
  }
}


// Route: /update
routes.update = function(req, res) {

  var state = req.body.state
    , id    = req.body.id
    , ticket
    , mail_options
    , email_times = 0

  if (!req.session.admin) {
    return res.send(':(')
  }

  db.tickets.findOne({ _id : id }, found)

  function found(err, _ticket) {
    if (err) return res.send({ error : err })
    ticket = _ticket
    ticket.state = state
    ticket.save(state == 'aprobado' ? sendMail : done)
  }

  function sendMail(err) {
    if (err) return res.send({ error : err })

    smtpTransport = mailer.createTransport("SMTP", secret.transportObject)

    if (mail_options) {
      smtpTransport.sendMail(mail_options, sentMail)
      return
    }

    res.partial('email/approved_request', { ticket : ticket }, function(err, html){
      if (err) console.log(err)

      // sending email to cnit ..
      mail_options = {
        from    : "CNIT.org.ve cnit.ve@gmail.com"
      , to      : ticket.email
      , subject : "CNIT: " + ticket.name + ", ¡Tus entradas fueron aprobadas!"
      , html    : html
      }

      smtpTransport.sendMail(mail_options, sentMail)
    })
  }

  function sentMail(err){
    // just preventing infinite email sending
    email_times++

    if (err && email_times <= max_email_times){
      smtpTransport.close()
      return sendMail()
    }

    done()
  }

  function done() {
    return res.send({ state : state })
  }

}

