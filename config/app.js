
// Configurations
const models  = require('./models')
    , config  = require('./config')
    , routes  = require('./routes')

    // Modules
const express = require('express')


module.exports = function() {

  const app = express.createServer()

  models()

  config(app, express)

  routes(app)

  return app

}
