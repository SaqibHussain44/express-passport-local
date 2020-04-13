const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');

function validPassword(password, hash, salt) {
  var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

passport.use(new LocalStrategy({
  usernameField: 'email'
}, function(email, password, cb) {
  User.findOne({ email: email })
    .then((user) => {
      if (!user) { return cb(null, false) }
      const isValid = validPassword(password, user.hash, user.salt);
      if (isValid) {
        return cb(null, user);
      } else {
        return cb(null, false);
      }
    })
    .catch((err) => {
      cb(err);
    });
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user); 
  });
});
