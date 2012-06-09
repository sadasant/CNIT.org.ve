// CNIT.org.ve
// -----------
//
// Authored by:
// - Daniel Rodríguez  @sadasant
// - Stefan Maric      @alexstefan92
// - Sergio Bruni      @sergebruni
// - Adrian Obelmejías https://www.facebook.com/adrian.obelmejias
// - Daniel Aubourg    https://www.facebook.com/daniel.aubourg
//

if(!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development"
}

var app  = require('./config/app')()

app.listen(17955, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)
})
