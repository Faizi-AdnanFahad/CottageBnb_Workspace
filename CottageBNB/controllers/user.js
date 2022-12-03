const User = require('../models/user.js');

let renderSignUpForm = (req, res) => {
    res.render('Users/register.ejs');
}

let signUp = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username: username, email: email });
        const registerUser = await User.register(user, password); // saves the user with the hashed password to the database. register method is provided by passport framework
        /* Once a user is Signs up, we should remember them so they don't have to login again. The following `req.login` does that*/
        req.login(registerUser, (err) => {
            if (err) {
                next(err)
            }
            else {
                req.flash('success', 'A new user was successfully created!');
                res.redirect('/cottages');
            }
        });
    }
    catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
}

let renderLoginForm = (req, res) => {
    res.render('Users/login.ejs');
}

let logOut = (req, res) => {
    req.logout(function (err) {
        if (err) { 
            next(err); 
        }
        else {
            req.flash('success', "You have successfully signed out!");
            res.redirect('/cottages');
        }
    });
}

let authenticateUser = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const returnToUrl = req.session.returnToUrl;
    res.redirect(returnToUrl);
};

module.exports = { renderSignUpForm, signUp, renderLoginForm, logOut, authenticateUser };