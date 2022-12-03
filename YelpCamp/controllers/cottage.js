const Cottage = require('../models/cottage.js'); // model
const { cloudinary } = require("../cloudinary"); // Cloudinary object with settups that we created

/* To get coordinates infromation from the MapBox API - https://github.com/mapbox/mapbox-sdk-js */ 
const geoCode = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = geoCode({ accessToken: mapBoxToken });

let indexCottage = async (req, res, next) => {
    try {
        let cottages = await Cottage.find({}); // get all cottages in our database.
        res.render('cottages/index.ejs', { campgrounds: cottages });
    }
    catch (e) {
        next(e);
    }
};

let renderNewForm = (req, res) => {
    res.render('cottages/new.ejs')
}

let createNewCottage = async (req, res, next) => {
    try {
        const { title, location, price, description, image } = req.body;
        let cottage = new Cottage({ user: req.user._id, title: title, location: location, price: price, description: description, image: image });

        /* Get the geocoding information based on the user input from campground.location */
        let geoData = await geocodingClient.forwardGeocode({
            query: cottage.location,
            limit: 1
          }).send();
        cottage.geometry = geoData.body.features[0].geometry; // retrieve the logtitude and latitude
        // the information about parsed files(includes image information) could be found in `req.files`
        /* Maps the url and filename from the parsed image from cloudinary with multer and the returned is an array which is mapped to the image's array in campground. */
        cottage.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        await cottage.save();
        // Create a new flash when a new Cottage is successfully created!
        req.flash('success', 'Successfully added a new Cottage!');
        res.redirect(`/cottages/${cottage._id}`);
    }
    catch (e) {
        next(e); // pass the error to the default error handler (router.use)
    }
}

let showCottage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cottage = await Cottage.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'user'
            }
        }).populate('user'); // expand the reviews too so they are accssible in the .ejs file. - If we don't do that, we will only have the IDs of reviews.
        if (!cottage) {
            req.flash('error', 'Cottage was not found!');
            res.redirect('/cottages');
        }
        else {
            res.render('cottages/show.ejs', { campground: cottage });
        }
    }
    catch (e) {
        next(e);
    }
}

let renderEditForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        let cottage = await Cottage.findById(id);
        if (!cottage) {
            req.flash('error', 'Cottage was not found!');
            res.redirect('/cottages');
        }
        else {
            res.render('cottages/edit.ejs', { campground: cottage });
        }
    }
    catch (e) {
        next(e);
    }
}

let updateCottage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, location, price, description, image } = req.body;
        let cottage = await Cottage.findByIdAndUpdate(id, { title: title, location: location, price: price, description: description, image, image });
        let newImages = req.files.map(f => ({ url: f.path, filename: f.filename })); // returns array
        cottage.images.push(...newImages); // spread the elements of array so we only push the elements in the array and not the array itself
        await cottage.save();
        /* Deletes images */
        if (req.body.deleteImages) {
            /* Deletes images from cloudinary */
            /* deleteImages is an array that stores the filenameID that have been selected with checkboxes. Check edit.ejs for more info*/
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            /* Deletes images from database */
            await cottage.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        }
        req.flash('success', 'Successfully updated the Cottage!');
        res.redirect(`/cottages/${id}`);
    }
    catch (e) {
        next(e);
    }
}

let deleteCottage = async (req, res, next) => {
    try {
        const { id } = req.params;
        let cottage = await Cottage.findByIdAndDelete(id);
        /* Deletes images from cloudinary */
        for (let image of cottage.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
        req.flash('success', 'Successfully deleted the Cottage!');
        res.redirect('/cottages');
    }
    catch (e) {
        next(e);
    }
}

/* To be used in route files - Here specifically in Cottage's routes file */
module.exports = {
    indexCottage: indexCottage,
    renderNewForm,
    createNewCottage: createNewCottage,
    showCottage: showCottage,
    renderEditForm,
    updateCottage: updateCottage,
    deleteCottage: deleteCottage
};