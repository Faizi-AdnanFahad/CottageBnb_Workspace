const express = require('express');
const mongoose = require('mongoose'); // for database
const session = require('express-session');
const flash = require('connect-flash'); // Used to flash messages to the screen
const app = express();
const path = require('path');
const ExpressError = require('./utils/ExpressError.js'); // Custom Error Exception
const methodOverride = require('method-override') // allows us to use PATCH and DELETE in forms
const ejsMate = require('ejs-mate'); // boilerplate that reduces duplicates

/* Defined Routes */
const cottageRoutes = require('./routes/cottage.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/user.js');

// For authentication. Check passport documentation
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const PORT = 3000;

app.set('views', path.join(__dirname, '/views')); // makes sure that the file could be run from any path. Not just from the directory that app.js resides
app.set('view engine', 'ejs'); // sets ejs
app.use(express.urlencoded({ extended: true })); // enables incoming data from forms
app.use(methodOverride('_method')); // allows us to use PATCH and DELETE in forms
app.engine('ejs', ejsMate); // Tells express to specifically use ejs-mate instead of the default one.
// app.use(express.static('public')); for using normal DOM
app.use(express.static(path.join(__dirname, 'public'))); // Allows to use normal DOM and run javascript via express and Nodejs - Anything in public directory will be treated that way.


/* Setting up the session */
const sessionConfig = {
    secret: 'thishastobeabettersecret',
    resave: false, // recommended
    saveUninitialized: true, // recommended
    cookie: {
        httpOnly: true, // For security reasons
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig)); // sends a session id at each request
app.use(flash()); // Sets up the flash

// Setting up passport authentication - session() should come before this
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/********************************************************/

// Checking wether database was connected or not
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

/********************************************************/

// 1. Connect Mongoose to Mongod
main()
    .then(() => {
        console.log("MONGO CONNECTION SUCCESSFUL!");
    })
    .catch((err) => {
        console.log("OH NO MONGO ERROR!")
        console.log(err)
    });

async function main() { // connects Mongoose to Mongod
    await mongoose.connect('mongodb://localhost:27017/cottage-bnb', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }); // creates a data base called 'cottage-bnb'
};

/***************************ROUTES*****************************/

// Adding a flash to the local variables list so its accessible within any ejs file
app.use((req, res, next) => {
    /* The `if-statement` below helps us store the URLs/path a user wanted to go without being authenticated. The requested path is stored in a session because once the user is logged in, 
       to redirect them to the original path the wanted to go. Note that if a user logs in normally, nothing is stored in this session and in this case, the user
       is redirected to `/cottages` which is addresed in the /login POST route in the /routes/user.js
    */
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnToUrl = req.originalUrl;
    }
    else {
        req.session.returnToUrl = '/cottages';
    }
    // req.user is contains all the information about the user which was successfully authenticated by `passport`, undefined if hasn't been authenticated yet.
    res.locals.currentUser = req.user; // saves the current authenticated user to currentUser which is accessible via any ejs template. - req.user is provided by `passport` when a user is authenticated. - Used to hide or show links on UI based on wether is authenticated or not
    res.locals.success = req.flash('success'); // access the flash with the key `success` amd store it in the local variable stack so its available in all ejs files.
    res.locals.error = req.flash('error');
    next();
});

/**************************************************************/
// Accessing Routes
app.use('/', userRoutes);
app.use('/cottages', cottageRoutes);
app.use('/cottages/:id/reviews', reviewRoutes);

app.get('/', async (req, res) => {
    res.render("home.ejs");
});
/**************************************************************/

/* For unknown routes */
app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found!", 404));
})

/* The default Error Handler - Will catch all errors thrown at it */
app.use((err, req, res, next) => {
    // Set default message and statuCode if not provided
    if (!err.message) {
        err.message = "Some error was thrown!"
    }
    else if (!err.statusCode) {
        err.statusCode = 500;
    }

    res.status(err.statusCode).render('error.ejs', { err });
})

app.listen(PORT, () => {
    console.log("Serving on port: ", PORT);
});