const express = require('express');
const router = express.Router({ mergeParams: true }); // Merges the parameters of other routes so they are all accessible
const { reviewSchema } = require('../joiSchema.js'); // Joi Custom Schema - We have put it in a differnet file to respect the seperation of concern.
const Campground = require('../models/campground.js'); // model
const Review = require('../models/review.js');
const { validateReviews, isLoggedin, authorizeUserToDeleteReview } = require('../middlewares.js');
const review = require('../controllers/review.js'); // Review Controller

// The POST /campgrounds/:id/reviews route that saves a review for a campground
router.post('/', isLoggedin, validateReviews, review.makeReview);

// The DELETE route will delete if a review is deleted on an individual campgroud. It deletes the review itself and also its reference from the list of reviews in the campground.
router.delete('/:reviewId', isLoggedin, authorizeUserToDeleteReview, review.deleteReview);

module.exports = router;