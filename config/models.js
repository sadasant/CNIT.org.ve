
// Modules
const mongoose = require('mongoose')
    , Schema   = mongoose.Schema
    , ObjectId = Schema.ObjectId

var models = {}


// Exports
module.exports = function() {

  mongoose.model('Ticket', models.Ticket)

}


models.Ticket = new Schema({
    "_id"           : ObjectId
  , name            : String
  , last_name       : String
  , email           : String
  , cedula          : String
  , organization    : String
  , city            : String
  , type_of_payment : String
  , payment_number  : String
  , payment_date    : String
  , payment_ammount : Number
  , tickets_stud    : Number
  , tickets_else    : Number
  , special_code    : String
  , state           : String
 })

// Well, yeah, fat controllers and skinny models, for now :)
