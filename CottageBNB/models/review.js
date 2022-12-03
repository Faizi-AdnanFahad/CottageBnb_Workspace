const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewShema = new Schema({
    body: String, // Will store the review comment
    rating: Number,
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }
});

let Review = mongoose.model('Review', reviewShema);

module.exports = Review;