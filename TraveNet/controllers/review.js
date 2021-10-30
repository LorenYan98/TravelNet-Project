const travelnet = require('../models/travelnet');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    const campground = await travelnet.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!');
    res.redirect(`/travelnet/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await travelnet.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId)
    res.redirect(`/travelnet/${id}`)
}