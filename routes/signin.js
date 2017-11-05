var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signin');
});

// POST /signin
router.post('/', checkNotLogin, function(req, res, next) {
  var name = req.fields.name;
  var password = req.fields.password;

  UserModel.getUserByName(name)
    .then(function (user) {
      if (!user) {
        req.flash('error', 'user not exist');
        return res.redirect('back');
      }
      // check the password match
      if (sha1(password) !== user.password) {
        req.flash('error', 'username or password error');
        return res.redirect('back');
      }
      req.flash('success', 'signin successfully');
      // store user info into session
      delete user.password;
      req.session.user = user;
      // redirect to home page after signin
      res.redirect('/home');
    })
    .catch(next);
});

module.exports = router;
