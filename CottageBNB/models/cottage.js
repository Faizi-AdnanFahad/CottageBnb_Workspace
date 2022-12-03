const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url: String,
    filename: String
});

/* 
    Having a new Schema for our images allow us to have the `virtual` property. With the help of virtual,
    now we can call .thumbnail property on images to replace the url from 
    https://res.cloudinary.com/dfkwvksuu/image/upload/v1668031877/YelpCamp/fz2ae1geid8l2uqqvow9.avif
    to 
    https://res.cloudinary.com/dfkwvksuu/image/w_200/upload/v1668031877/YelpCamp/fz2ae1geid8l2uqqvow9.avif
    this will allow us to get a smaller verision of the file which is more efficient.
*/
imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

/* Allows JSON.stringfy method to accept virtuals */
const opts = { toJSON: { virtuals: true } };

const cottageSchema = new Schema({
    title: String,
    price: Number,
    images: [imageSchema],
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    user: { // the user who added the Cottage
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

/* The properties will be added as part of each Cottage model which will have popupMarkup as one of elements 
   that could store information about the a Cottage */
cottageSchema.virtual('properties.popupMarkup').get(function() {
    return `
    <strong>
        <a href="/cottages/${this._id}">${this.title}</a>
    <strong>
    <p>${this.description.substring(0, 20)}...</p>`
})

/* Delete all the associated reviews when a Cottage is deleted */
cottageSchema.post('findOneAndDelete', async function (theDeletedObjOrDoc) {
    // In our case, theDeletedObjOrDoc is the Cottage object that was deleted
    if (theDeletedObjOrDoc) {
        await Review.deleteMany({
            // query _id in Cottage.reviews array and delete them.
            _id: {
                $in: theDeletedObjOrDoc.reviews
            }
        })
    }
})

let Cottage = mongoose.model('Cottage', cottageSchema); // will be changed to 'Cottages' by Mongo
module.exports = Cottage;