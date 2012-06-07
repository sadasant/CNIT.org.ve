// MVC Sugar
var express = require('express')

// Routes
var routes = require('./routes');

// Stylus and Nib
var stylus = require('stylus')
var nib = require('nib')

function nibCompile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', false)
    .use(nib());
}

// The express server
var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(stylus.middleware({ 
      src: __dirname + '/public'
    , compile: nibCompile 
  }))
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))
})

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

app.configure('production', function(){
  app.use(express.errorHandler())
})

// Routes

app.get('/', routes.index)
app.get('/participa/', routes.participate)
app.get('/nosotros/', routes.us)
app.post('/register', routes.register)
app.get('*', routes.e404)

app.listen(17955, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)
})
