var mongoose = require('mongoose');

var FlatEntrySchema = new mongoose.Schema({
  title : String,
  size : String,
  price : String,
  url : String
});

module.exports = mongoose.model('FlatEntry', FlatEntrySchema);
