const express = require('express');
const passport = require('passport');
const User = require('../models/user.js');
const router = express.Router();
const user = require('../controllers/user.js');

router.route('/register')
    .get(user.renderSignUpForm)
    .post(user.signUp);

router.route('/login')
    .get(user.renderLoginForm) 
    // passport.authenticalt will compare our creditials to the database according to `local` logic and flashes and redirects acordingly
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: 'login', keepSessionInfo: true, }), user.authenticateUser);

router.get('/logout', user.logOut);


module.exports = router;