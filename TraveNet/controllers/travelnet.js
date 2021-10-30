const travelnet = require('../models/travelnet');
const catchAsync = require('../utils/catchAsync');

module.exports.index = async (req, res) => {
    const campground = await travelnet.find({});
    res.render('campgrounds/index', { campground });
};

module.exports.newForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createCamp = async (req, res, next) => {

    const campground = new travelnet(req.body.campground);
    campground.image = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully made a new review');
    res.redirect(`/travelnet/${campground._id}`)
}

module.exports.viewIdPage = async (req, res) => {
    const campground = await travelnet.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Woops, something went wrong!');
        return res.redirect('/travelnet');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditPage = async (req, res) => {
    const campground = await travelnet.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Woops, something went wrong!');
        return res.redirect('/travelnet');
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.editPage = async (req, res) => {
    const { id } = req.params
    const campground = await travelnet.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated the page');
    res.redirect(`/travelnet/${campground._id}`);
}

module.exports.deletePage = async (req, res) => {
    const { id } = req.params
    await travelnet.findByIdAndDelete(id)
    res.redirect('/travelnet')
}