const express = require('express')
const passport = require('passport')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { ensureGuest } = require('../middleware/auth');
const User = require("../models/User");
// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile' , 'email'] }))

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard')
  }
)

// @desc    Register
// @route   GET /register
router.get("/register", ensureGuest, (req, res) => {
  res.render("register", {
    layout: "login",
  });
});

// @desc    Login
// @route   GET /login
router.get("/login", ensureGuest, (req, res) => {
  res.render("login", {
    layout: "login",
  });
});

router.post('/register', (req, res) => {
  const { displayName, firstName, lastName, email, password, password2 } = req.body;
  const username=req.body.email;
  let errors = [];

  

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      displayName,
      firstName,
      lastName,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
      displayName,
      firstName,
      lastName,
      email,
      password,
      password2
        });
      } else {
        const newUser = new User({
          displayName,
      firstName,
      lastName,
      email,
      password,
      username
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/auth/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

// @desc    Logout user
// @route   /auth/logout
// Logout
router.get('/logout', (req, res, next) => {
  req.logout((error) => {
      if (error) {return next(error)}
      res.redirect('/')
  })
})

module.exports = router
