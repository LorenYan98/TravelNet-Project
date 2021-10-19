const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./checkSchema.js')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const travelnet = require('./models/travelnet');
const methodOverride = require('method-override');


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/travelnet')
        .then(() => {
            console.log("CONNECTION OPEN!!");
        })
        .catch(() => {
            console.log("CONNECTION FAILS");
        })
}

const app = express();
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/travelnet', async (req, res) => {
    const campground = await travelnet.find({});
    res.render('campgrounds', { campground });
})

app.get('/travelnet/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/travelnet', validateCampground, catchAsync(async (req, res, next) => {

    const campground = new travelnet(req.body.campground);
    await campground.save();
    res.redirect(`/travelnet/${campground._id}`)
}))

app.get('/travelnet/:id', catchAsync(async (req, res, next) => {
    const campground = await travelnet.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))

app.get('/travelnet/:id/edit', catchAsync(async (req, res) => {
    const campground = await travelnet.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}))

app.put('/travelnet/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await travelnet.findById(req.params.id);
    await travelnet.findByIdAndUpdate(id, { ...req.body.campground });
    res.render('campgrounds/show', { campground });
}))

app.delete('/travelnet/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await travelnet.findByIdAndDelete(id)
    res.redirect('/travelnet')
}))

app.post('/travelnet/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await travelnet.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/travelnet/${campground._id}`);
}))

app.delete('/travelnet/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await travelnet.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId)
    res.redirect(`/travelnet/${id}`)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh no. Something went wrong'
    res.status(statusCode).render('error', { err })

})

app.listen(3000, () => {
    console.log('SERVING ON PORT 3000')
})