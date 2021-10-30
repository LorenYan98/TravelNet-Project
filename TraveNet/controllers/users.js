const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.registerVerify = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const newuser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('error', e.message);
            res.redirect('./register');
        })
    } catch (e) {

    }
    req.flash('success', 'Welcome to the main page')
    res.redirect('./travelnet');
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.loginVerify = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || '/travelnet';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', 'Good Bye')
    res.redirect('/travelnet');

}