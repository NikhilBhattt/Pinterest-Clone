const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/pin-db')

const userSchema = new mongoose.Schema({
  username: String,
  fullname: String,
  email: String,
  password: String,
  profileImg: String,
  posts : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Post'
  }],
  boards : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Post'
  }],
  likes : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Post'
  }]
})
userSchema.plugin(plm)
        
module.exports = mongoose.model('User', userSchema);