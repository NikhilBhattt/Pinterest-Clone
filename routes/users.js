const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')
require('dotenv').config()

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pinterest-db'

mongoose.connect(mongoURI)

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
