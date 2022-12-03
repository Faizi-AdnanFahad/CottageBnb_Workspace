const { campgroundSchema, reviewSchema } = require('./joiSchema.js'); // Joi Custom Schema - We have put it in a differnet file to respect the seperation of concern.
const ExpressError = require('./utils/ExpressError.js'); // Custom Error Exception
const Campground = require('./models/cottage.js'); // model
const Review = require('./models/review.js'); // model

// Checks to see if use is authenticated (Logged in) - Gives certain permissions accordingly
const isLoggedin = (req, res, next) => {
    if (req.isAuthenticated()) { // the method is provided by passport
        next();
    }
    else {
        req.flash('error', 'You must be signed in first to log in!');
        res.redirect('/login');
    }
}

/* HELPER MIDDLEWARE */
/* The following validation by 'Joi' is very useful if left anything on form is left blank or invalid values are passed, then this throws an error. 
   Although it is already handled with Bootstrap's form validation, this code will prevent sending a request with invalid data from any tool such as Postman. */
/* Joi Validation - Server side */
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); // print the object to make it clear if it is confusing
    if (error) {
        const msg = error.details.map(el => el.message).join(','); // extract the error message from returned error object.
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
};

/* Joi Validation - Server side */
const validateReviews = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); // print the object to make it clear if it is confusing
    if (error) {
        const msg = error.details.map(el => el.message).join(','); // extract the error message from returned error object.
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
};

/* This middleware ensures that only the campground owner can perform certain tasks on campground such as edit/delete */
const authorizeUser = async (req, res, next) => {
    const { id } = req.params;
    let foundCampground = await Campground.findById({ _id: id });
    /* Check the current logged user against the campground's user id */
    if (!foundCampground.user.equals(req.user._id)) {
        req.flash('error', 'You do not have the neccessary permission to do this!');
        res.redirect(`/campgrounds/${id}`);
    }
    else {
        next();
    }
};

/* This middleware ensures that only the review owner can perform certain tasks on reviews such as edit/delete */
const authorizeUserToDeleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.user.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to delete this review!')
        res.redirect(`/campgrounds/${id}`);
    }
    else {
        next();
    }
}

module.exports = { isLoggedin, validateCampground, authorizeUser, validateReviews, authorizeUserToDeleteReview };