/* Checks to see if we are in development mode, requires the `.env` file which includes some secret codes. */
// console.log(process.env.SECRET); // this is how we would access the keys in `.env` file
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const router = express.Router();
const { isLoggedin, validateCampground, authorizeUser } = require('../middlewares.js');
const campground = require('../controllers/campground.js'); // Campground Controller

/* Used for image upload */
const multer = require('multer'); // The middleware that helps us upload/parse images from a form
const { storage } = require('../cloudinary/index.js'); // Our cloudinary account information and setup config
const upload = multer({ storage }); // destination can be local({ dest: 'uploads/' }) or cloud(storage)

router.route('/')
    // 1. GET /campgrounds - lists the list of all campgrounds
    .get(campground.indexCampground)
    // 3. POST /campgrounds - creats a new campgrounds
    .post(isLoggedin, upload.array('image'), validateCampground, campground.createNewCampground);

// 3. GET /campgrounds/new - Form to add a new campgrounds
router.get('/new', isLoggedin, campground.renderNewForm);

router.route('/:id')
    // 2. GET /campgrounds/:id - Get a specific campgrounds
    .get(campground.showCampground)
    // 6. PUT /campgrounds/:id - updates a campgrounds
    .put(isLoggedin, authorizeUser, upload.array('image'), validateCampground, campground.updateCampground)
    // 7. DELETE /campgrounds/:id - Deletes a campgrounds
    .delete(isLoggedin, authorizeUser, campground.deleteCampground);

// 5. GET /campgrounds/edit - a form to edit a specfic campgrounds
router.get('/:id/edit', isLoggedin, authorizeUser, campground.renderEditForm);

module.exports = router;