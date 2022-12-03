const Campground = require('../models/cottage.js'); // model
const Review = require('../models/review.js');

let makeReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        const { rating, revBody } = req.body;
        const newReview = new Review({ rating: rating, body: revBody, user: req.user._id });
        const populatedReview = await newReview.populate('user');
        // console.log(populatedReview);
        campground.reviews.push(populatedReview);
        await campground.save();
        await newReview.save();
        req.flash('success', 'Successfully added a new Review!');
        res.redirect(`/campgrounds/${id}`);
    }
    catch (e) {
        next(e);
    }
}

let deleteReview = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        await Review.findByIdAndDelete(reviewId);
        /* The Pull operator is a mongoose operation that will check the reviews array and remove anything with the id of `reviewId`*/
        /* In our case, we are updating the relevant campground with the REVIEW Object deleted for using the `reviewId`*/
        // Note that you could also write a custom function to delete a review from the campground.reviews array
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        req.flash('success', 'Successfully deleted a review!');
        res.redirect(`/campgrounds/${id}`);
    }
    catch (e) {
        next(e);
    }
}

module.exports = { makeReview, deleteReview };