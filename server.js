const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const PDFDocument = require('pdfkit');
const path = require('path'); // Import path for static files

const app = express();

mongoose.connect('mongodb://localhost:27017/carbonFootprint');

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', UserSchema);

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the intro page
app.get('/intro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'intro.html'));
});

// Register User
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.json({ success: false, message: 'All fields are required.' });
    }
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.json({ success: false, message: err.message });
        const newUser = new User({
            username,
            password: hash
        });
        newUser.save((err) => {
            if (err) return res.json({ success: false, message: err.message });
            res.json({ success: true, message: 'User registered successfully' });
        });
    });
});

// Login User
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

const CalculationSchema = new mongoose.Schema({
    username: String,
    milesDriven: Number,
    powerConsumption: Number,
    footprint: Number,
    date: { type: Date, default: Date.now }
});

const Calculation = mongoose.model('Calculation', CalculationSchema);

// Save calculation
app.post('/calculate', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ success: false, message: 'You must be logged in to calculate your carbon footprint.' });
    }

    const { milesDriven, powerConsumption } = req.body;
    const footprint = (milesDriven * 0.404 * 4) + (powerConsumption * 0.92);
    const newCalculation = new Calculation({
        username: req.user.username,
        milesDriven,
        powerConsumption,
        footprint
    });
    newCalculation.save((err) => {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, footprint });
    });
});

// Generate PDF Report
app.get('/generate-report', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ success: false, message: 'You must be logged in to generate a report.' });
    }

    const username = req.user.username;
    Calculation.find({ username }, (err, calculations) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
        doc.pipe(res);

        doc.fontSize(25).text('Carbon Footprint Report', { align: 'center' });
        doc.moveDown();
        calculations.forEach(calculation => {
            doc.fontSize(16).text(`Date: ${calculation.date.toDateString()}`);
            doc.fontSize(14).text(`Miles Driven: ${calculation.milesDriven}`);
            doc.fontSize(14).text(`Power Consumption: ${calculation.powerConsumption} kWh`);
            doc.fontSize(14).text(`Carbon Footprint: ${calculation.footprint} kg of CO2`);
            doc.moveDown();
        });
        doc.end();
    });
});

// Use a different port (e.g., 3001)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
