const Campground = require('../models/campground.js'); // model
const { cloudinary } = require("../cloudinary"); // Cloudinary object with settups that we created

/* To get coordinates infromation from the MapBox API - https://github.com/mapbox/mapbox-sdk-js */ 
const geoCode = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = geoCode({ accessToken: mapBoxToken });

let indexCampground = async (req, res, next) => {
    try {
        let campgrounds = await Campground.find({}); // get all campgrounds in our database.
        res.render('campgrounds/index.ejs', { campgrounds });
    }
    catch (e) {
        next(e);
    }
};

let renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs')
}

let createNewCampground = async (req, res, next) => {
    try {
        const { title, location, price, description, image } = req.body;
        let campground = new Campground({ user: req.user._id, title: title, location: location, price: price, description: description, image: image });

        /* Get the geocoding information based on the user input from campground.location */
        let geoData = await geocodingClient.forwardGeocode({
            query: campground.location,
            limit: 1
          }).send();
        campground.geometry = geoData.body.features[0].geometry; // retrieve the logtitude and latitude
        // the information about parsed files(includes image information) could be found in `req.files`
        /* Maps the url and filename from the parsed image from cloudinary with multer and the returned is an array which is mapped to the image's array in campground. */
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        await campground.save();
        // Create a new flash when a new campground is successfully created!
        req.flash('success', 'Successfully added a new Campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    }
    catch (e) {
        next(e); // pass the error to the default error handler (router.use)
    }
}

let showCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'user'
            }
        }).populate('user'); // expand the reviews too so they are accssible in the .ejs file. - If we don't do that, we will only have the IDs of reviews.
        if (!campground) {
            req.flash('error', 'Campground was not found!');
            res.redirect('/campgrounds');
        }
        else {
            res.render('campgrounds/show.ejs', { campground });
        }
    }
    catch (e) {
        next(e);
    }
}

let renderEditForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        let campground = await Campground.findById(id);
        if (!campground) {
            req.flash('error', 'Campground was not found!');
            res.redirect('/campgrounds');
        }
        else {
            res.render('campgrounds/edit.ejs', { campground });
        }
    }
    catch (e) {
        next(e);
    }
}

let updateCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, location, price, description, image } = req.body;
        let campground = await Campground.findByIdAndUpdate(id, { title: title, location: location, price: price, description: description, image, image });
        let newImages = req.files.map(f => ({ url: f.path, filename: f.filename })); // returns array
        campground.images.push(...newImages); // spread the elements of array so we only push the elements in the array and not the array itself
        await campground.save();
        /* Deletes images */
        if (req.body.deleteImages) {
            /* Deletes images from cloudinary */
            /* deleteImages is an array that stores the filenameID that have been selected with checkboxes. Check edit.ejs for more info*/
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            /* Deletes images from database */
            await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        }
        req.flash('success', 'Successfully updated the Campground!');
        res.redirect(`/campgrounds/${id}`);
    }
    catch (e) {
        next(e);
    }
}

let deleteCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        let campground = await Campground.findByIdAndDelete(id);
        /* Deletes images from cloudinary */
        for (let image of campground.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
        req.flash('success', 'Successfully deleted the Campground!');
        res.redirect('/campgrounds');
    }
    catch (e) {
        next(e);
    }
}

/* To be used in route files - Here specifically in campground's routes file */
module.exports = {
    indexCampground,
    renderNewForm,
    createNewCampground,
    showCampground,
    renderEditForm,
    updateCampground,
    deleteCampground
};