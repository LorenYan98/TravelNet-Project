const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campground = require('../controllers/travelnet')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const travelnet = require('../models/travelnet');

router.route('/')
    .get(catchAsync(campground.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.createCamp))

router.get('/new', isLoggedIn, catchAsync(campground.newForm))

router.route('/:id')
    .get(catchAsync(campground.viewIdPage))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campground.editPage))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deletePage))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.renderEditPage))

module.exports = router;