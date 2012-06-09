
// Modules
const mongoose = require('mongoose')
    , stylus   = require('stylus')
    , nib      = require('nib')
    , secret   = require('../secret')


module.exports = function(app, express) {

  const db = mongoose.createConnection(secret.mongo_url)

  // Nib compiler
  function nibCompile(str, path) {
    return stylus(str)
      .set('filename', path)
      .set('compress', false)
      .use(nib())
  }

  // Configuration
  app.configure(function(){

    this // less code ?

    // Requests conf
    .use(express.bodyParser())
    .use(express.methodOverride())
    .use(express.cookieParser())
    .use(express.session({ secret: secret.session }))
    .use(app.router)

    // Views conf
    .set('views', __dirname + '/../views')
    .set('view engine', 'jade')
    .use(stylus.middleware({
        src: __dirname + '/../public'
      , compile: nibCompile
      }))
    .use(express.static(__dirname + '/../public'))

    // DB conf
    .set('db', {
      'main'    : db
    , 'tickets' : db.model('Ticket')
    })

    // Secrets conf
    .set('secret', secret)
  })

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  })

  app.configure('production', function(){
    app.use(express.errorHandler())
  })

}
