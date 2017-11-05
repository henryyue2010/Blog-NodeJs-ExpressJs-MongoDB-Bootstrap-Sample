var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signup');
});

// POST /signup
router.post('/', checkNotLogin, function(req, res, next) {
  var name = req.fields.name;
  var password = req.fields.password;
  var repassword = req.fields.repassword;

  // check
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('the username is limited to 1-10 characters');
    }

    if (password.length < 6) {
      throw new Error('the password is at least 6 characters');
    }
    if (password !== repassword) {
      throw new Error('the password does not match');
    }
  } catch (e) {
    // signup failed
    req.flash('error', e.message);
    return res.redirect('/signup');
  }

  // encrypt password
  password = sha1(password);

  // user information
  var user = {
    name: name,
    password: password,
  };
  // store user into db
  UserModel.create(user)
    .then(function (result) {
      //
      user = result.ops[0];
      // store user into session
      delete user.password;
      req.session.user = user;
      // write to flash
      req.flash('success', 'signup succeed');
      // jump to home page
      res.redirect('/home');

    })
    .catch(function (e) {
      // signup failed
      // jump to signup page
      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', 'the username has been used');
        return res.redirect('/signup');
      }
      next(e);
    });
});

module.exports = router;
