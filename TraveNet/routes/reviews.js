const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const travelnet = require('../models/travelnet');
const Review = require('../models/review');
const { reviewSchema } = require('../checkSchema.js')
const { isLoggedIn, isReviewAuthor } = require('../middleware');
const review = require('../controllers/review')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.post('/:id/reviews', isLoggedIn, validateReview, catchAsync(review.createReview))

router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(review.deleteReview))

module.exports = router;
