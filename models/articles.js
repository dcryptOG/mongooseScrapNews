
// dependency
var mongoose = require('mongoose');

//creates Schema class
var Schema = mongoose.Schema;

// create Articles schema
var ArticlesSchema = new Schema ({
  title: {
    type: String,
    required: true,
    index: { unique: true }
  },
  source: {
    type: String,
  },
  summary: {
    type: String,
  },
  link: {
    type: String,
  },
  img: {
    type: String,
  },
  status: {
    type: Number,
    default: 0
  },
  notes: {
    // saves one comment's ObjectID
    type: Schema.Types.ObjectId,
    ref: 'Notes'
  }
});

// creates Articles model from schema using mogoose model method
var Articles = mongoose.model('Articles', ArticlesSchema);

// exports Articles model
module.exports = Articles;