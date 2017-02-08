var mongoose = require('mongoose');

var ListSchema = new mongoose.Schema({
  title: String,
  email: String,
  //list : String,
  lastsave : String
});

module.exports = mongoose.model('List', ListSchema);
