var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

// GET /signout
router.get('/', checkLogin, function(req, res, next) {
  // clear user info in session
  req.session.user = null;
  req.flash('success', 'sign out successfully');
  // redirect to home page
  res.redirect('/home');
});

module.exports = router;
