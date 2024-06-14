const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  img : String,
  title : String,
  description : String
})

module.exports = mongoose.model('Post', postSchema);