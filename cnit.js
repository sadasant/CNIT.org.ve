#!/usr/bin/env node

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
// CNIT.org.ve is the website of an event that our team (CDSTIC at http://www.unitec.edu.ve/)
// is working hard to make real. The team is divided in many sub-groups, one of them is just
// about software development, this group is learning how to make useful things with code,
// using technologies like HTML5, CSS3, jQuery and client-side JavaScript without libraries,
// Node.js, NoSQL databases, JAVA for android, virtual hosting and more.
//
// The first activity of that team was to build this website, it's an experience that has
// united us, it wasn't easy for many of us, as we're learning many things from zero,
// but we've helped each others, from the most experienced ones to the less experienced,
// our deal is to grow strong with time, and to make beautiful, useful and kick-ass apps!
//

if(!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development"
}

var app  = require('./config/app')()
  , port = process.env['app_port'] || 3000

app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)
})
