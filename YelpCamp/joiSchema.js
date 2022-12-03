const Joi = require('joi'); // boilerplate that reduces duplicates

module.exports.campgroundSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    location: Joi.required(),
    description: Joi.required(),
    // images: Joi.required()
    deleteImages: Joi.array(),
    geometry: Joi.object()
}); 

module.exports.reviewSchema = Joi.object({
    revBody: Joi.string().required(),
    rating: Joi.number().min(0).max(5).required(),
});