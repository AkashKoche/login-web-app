const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // Correct pattern for express-mysql-session
const passport = require('passport');

const pool = require('./database'); // Import the mysql2 connection pool directly

/* Initializations */
const app = express();
require('./lib/passport');

/* Settings */
const PORT = process.env.PORT || 3000; // Standardized to 3000 for Docker internal network
app.set('port', PORT);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

/* Middlewares */
app.use(session({
    secret: 'crud_links_session',
    resave: false,
    saveUninitialized: false,
    // FIX: Hand your working mysql2 pool directly to the session store
    store: new MySQLStore({}, pool) 
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

/* Global Variables */
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

/* Routes */
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));

/* Public */
app.use(express.static(path.join(__dirname, 'public')));

/* Starting the server */
app.listen(app.get('port'), '0.0.0.0', () => { 
    console.log(`🚀 Web Server running successfully on port: ${app.get('port')}`);
});
