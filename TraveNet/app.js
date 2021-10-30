if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const travelnetRoutes = require('./routes/travelnet')
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');

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
app.use(express.static(path.join(__dirname, 'public')));
const sessionConfig = {
    secret: 'Thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'loren@gmail.com', username: 'Loren' });
    const newuser = await User.register(user, 'good');
    res.send(newuser);
})

app.use('/', userRoutes);
app.use('/travelnet', travelnetRoutes);
app.use('/travelnet', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
})



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