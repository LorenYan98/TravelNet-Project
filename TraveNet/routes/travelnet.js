const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const travelnet = require('../models/travelnet');
const { campgroundSchema } = require('../checkSchema.js')


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', async (req, res) => {
    const campground = await travelnet.find({});
    res.render('campgrounds', { campground });
})

router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new travelnet(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new review');
    res.redirect(`/travelnet/${campground._id}`)

}))

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await travelnet.findById(req.params.id).populate('reviews');
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Woops, something went wrong!');
        return res.redirect('/travelnet');
    }
    res.render('campgrounds/show', { campground });
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await travelnet.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await travelnet.findById(req.params.id);
    await travelnet.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated the page');
    res.redirect(`/travelnet/${campground._id}`);
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await travelnet.findByIdAndDelete(id)
    res.redirect('/travelnet')
}))

module.exports = router;