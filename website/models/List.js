var mongoose = require('mongoose');

var ListSchema = new mongoose.Schema({
  key : String,
  list: String, // should be MIXED
});

module.exports = mongoose.model('List', ListSchema);
