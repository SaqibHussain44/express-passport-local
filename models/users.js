const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  firstName: String,
  lastName: String,
  organization: String,
  hash: String,
  salt: String
});
mongoose.model('User', UserSchema);