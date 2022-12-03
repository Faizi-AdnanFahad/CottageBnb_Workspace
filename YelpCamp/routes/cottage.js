/* Checks to see if we are in development mode, requires the `.env` file which includes some secret codes. */
// console.log(process.env.SECRET); // this is how we would access the keys in `.env` file
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const router = express.Router();
const { isLoggedin, validateCottage: validateCottage, authorizeUser } = require('../middlewares.js');
const cottage = require('../controllers/cottage.js'); // Cottage Controller

/* Used for image upload */
const multer = require('multer'); // The middleware that helps us upload/parse images from a form
const { storage } = require('../cloudinary/index.js'); // Our cloudinary account information and setup config
const upload = multer({ storage }); // destination can be local({ dest: 'uploads/' }) or cloud(storage)

router.route('/')
    // 1. GET /cottages - lists the list of all cottages
    .get(cottage.indexCottage)
    // 3. POST /cottages - creats a new cottages
    .post(isLoggedin, upload.array('image'), validateCottage, cottage.createNewCottage);

// 3. GET /cottages/new - Form to add a new cottages
router.get('/new', isLoggedin, cottage.renderNewForm);

router.route('/:id')
    // 2. GET /cottages/:id - Get a specific cottages
    .get(cottage.showCottage)
    // 6. PUT /cottages/:id - updates a cottages
    .put(isLoggedin, authorizeUser, upload.array('image'), validateCottage, cottage.updateCottage)
    // 7. DELETE /cottages/:id - Deletes a cottages
    .delete(isLoggedin, authorizeUser, cottage.deleteCottage);

// 5. GET /cottages/edit - a form to edit a specfic cottages
router.get('/:id/edit', isLoggedin, authorizeUser, cottage.renderEditForm);

module.exports = router;