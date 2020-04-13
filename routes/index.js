var express = require('express');
var router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');

function genPassword(password) {
  var salt = crypto.randomBytes(32).toString('hex');
  var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return {
    salt: salt,
    hash: genHash
  };
}

router.get('/', function(req, res,) {
  res.status(200).send({ title: 'Express' });
});

router.post('/register', (req, res, next) => {
  try {
    const saltHash = genPassword(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      hash: hash,
      salt: salt
    });
    newUser.save().then((user) => {
      req.login(user, function (err) {
        if (!err ){
          res.redirect('/current-user');
        } else {
          res.redirect('/login');
        }
      })
    });
  } catch(err) {
    res.status(500).send({success: false, msg: 'Internal server error'});
  }
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }),
  (err, req, res, next) => {
    if (err) next(err);
});

router.get('/logout', (req, res, next) => {
  try {
    req.logout();
    res.status(200).send({success: true, data: 'loggedout'});
  } catch(err) {
    res.status(200).send({success: false, msg: err});
  }
});

router.get('/login-success', (req, res, next) => {
  res.status(200).send({success: true, data: 'loggedin'});
});

router.get('/login-failure', (req, res, next) => {
  res.status(200).send({success: false, msg: 'Email or password incorrect!'});
});

router.get('/current-user', (req, res, next) => {
  if (req.isAuthenticated()) {
    res.status(200).send({success: true, data: req.user});
  } else {
    res.status(500).send({success: false, msg: 'You are not authenticated'});
  }
});

// delete below code and handle via a frontend
router.get('/login', (req, res, next) => {
  const form = '<h1>Login Page</h1><form method="POST" action="/login">\
  <br>Enter Email:<br><input type="email" name="email">\
  <br>Enter Password:<br><input type="password" name="password">\
  <br><br><input type="submit" value="Submit"></form>';
  res.send(form);
});

router.get('/register', (req, res, next) => {
  const form = '<h1>Register Page</h1><form method="post" action="register">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter email:<br><input type="email" name="email">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';
  res.send(form);
});

module.exports = router;
