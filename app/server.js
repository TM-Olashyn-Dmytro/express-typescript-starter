"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
const express = require("express");
const compression = require("compression"); // compresses requests 
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
const errorHandler = require("errorhandler");
const lusca = require("lusca");
const dotenv = require("dotenv");
const mongo = require("connect-mongo"); //(session)
const flash = require("express-flash");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const expressValidator = require("express-validator");
const expressStatusMonitor = require("express-status-monitor");
let MongoStore = mongo(session);
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env.example' });
/**
 * Controllers (route handlers).
 */
const homeController = require("./controllers/home");
const userController = require("./controllers/user");
const apiController = require("./controllers/api");
const contactController = require("./controllers/contact");
/**
 * API keys and Passport configuration.
 */
const passportConfig = require("./config/passport");
/**
 * Create Express server.
 */
const app = express();
/**
 * Connect to MongoDB.
 */
//mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
    console.log('MongoDB connection error. Please make sure MongoDB is running.');
    process.exit();
});
/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
        req.path !== '/login' &&
        req.path !== '/signup' &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    }
    else if (req.user &&
        req.path == '/account') {
        req.session.returnTo = req.path;
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(req.session.returnTo || '/');
});
/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());
/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});
module.exports = app;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cclxuICovXHJcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCAqIGFzIGNvbXByZXNzaW9uIGZyb20gJ2NvbXByZXNzaW9uJzsgIC8vIGNvbXByZXNzZXMgcmVxdWVzdHMgXHJcbmltcG9ydCAqIGFzIHNlc3Npb24gZnJvbSAnZXhwcmVzcy1zZXNzaW9uJztcclxuaW1wb3J0ICogYXMgYm9keVBhcnNlciBmcm9tICdib2R5LXBhcnNlcic7XHJcbmltcG9ydCAqIGFzIGxvZ2dlciBmcm9tICdtb3JnYW4nO1xyXG5pbXBvcnQgKiBhcyBlcnJvckhhbmRsZXIgZnJvbSAnZXJyb3JoYW5kbGVyJztcclxuaW1wb3J0ICogYXMgbHVzY2EgZnJvbSAnbHVzY2EnOyBcclxuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XHJcbmltcG9ydCAqIGFzIG1vbmdvIGZyb20gJ2Nvbm5lY3QtbW9uZ28nOyAvLyhzZXNzaW9uKVxyXG5pbXBvcnQgKiBhcyBmbGFzaCBmcm9tICdleHByZXNzLWZsYXNoJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgbW9uZ29vc2UgZnJvbSAnbW9uZ29vc2UnO1xyXG5pbXBvcnQgKiBhcyBwYXNzcG9ydCBmcm9tICdwYXNzcG9ydCc7XHJcbmltcG9ydCBleHByZXNzVmFsaWRhdG9yID0gcmVxdWlyZSgnZXhwcmVzcy12YWxpZGF0b3InKTtcclxuaW1wb3J0ICogYXMgZXhwcmVzc1N0YXR1c01vbml0b3IgZnJvbSAnZXhwcmVzcy1zdGF0dXMtbW9uaXRvcic7XHJcblxyXG5cclxuXHJcbmxldCBNb25nb1N0b3JlID0gbW9uZ28oc2Vzc2lvbik7XHJcblxyXG4vKipcclxuICogTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZnJvbSAuZW52IGZpbGUsIHdoZXJlIEFQSSBrZXlzIGFuZCBwYXNzd29yZHMgYXJlIGNvbmZpZ3VyZWQuXHJcbiAqL1xyXG5kb3RlbnYuY29uZmlnKHsgcGF0aDogJy5lbnYuZXhhbXBsZScgfSk7XHJcblxyXG5cclxuLyoqXHJcbiAqIENvbnRyb2xsZXJzIChyb3V0ZSBoYW5kbGVycykuXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyBob21lQ29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL2hvbWUnO1xyXG5pbXBvcnQgKiBhcyB1c2VyQ29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL3VzZXInO1xyXG5pbXBvcnQgKiBhcyBhcGlDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvYXBpJztcclxuaW1wb3J0ICogYXMgY29udGFjdENvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9jb250YWN0JztcclxuXHJcbi8qKlxyXG4gKiBBUEkga2V5cyBhbmQgUGFzc3BvcnQgY29uZmlndXJhdGlvbi5cclxuICovXHJcbmltcG9ydCAqIGFzIHBhc3Nwb3J0Q29uZmlnIGZyb20gJy4vY29uZmlnL3Bhc3Nwb3J0JztcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgRXhwcmVzcyBzZXJ2ZXIuXHJcbiAqL1xyXG5jb25zdCBhcHAgPSBleHByZXNzKCk7XHJcblxyXG4vKipcclxuICogQ29ubmVjdCB0byBNb25nb0RCLlxyXG4gKi9cclxuLy9tb25nb29zZS5Qcm9taXNlID0gZ2xvYmFsLlByb21pc2U7XHJcbm1vbmdvb3NlLmNvbm5lY3QocHJvY2Vzcy5lbnYuTU9OR09EQl9VUkkgfHwgcHJvY2Vzcy5lbnYuTU9OR09MQUJfVVJJKTtcclxuXHJcbm1vbmdvb3NlLmNvbm5lY3Rpb24ub24oJ2Vycm9yJywgKCkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKCdNb25nb0RCIGNvbm5lY3Rpb24gZXJyb3IuIFBsZWFzZSBtYWtlIHN1cmUgTW9uZ29EQiBpcyBydW5uaW5nLicpO1xyXG4gIHByb2Nlc3MuZXhpdCgpO1xyXG59KTtcclxuXHJcblxyXG5cclxuLyoqXHJcbiAqIEV4cHJlc3MgY29uZmlndXJhdGlvbi5cclxuICovXHJcbmFwcC5zZXQoJ3BvcnQnLCBwcm9jZXNzLmVudi5QT1JUIHx8IDMwMDApO1xyXG5hcHAuc2V0KCd2aWV3cycsIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi92aWV3cycpKTtcclxuYXBwLnNldCgndmlldyBlbmdpbmUnLCAncHVnJyk7XHJcbmFwcC51c2UoZXhwcmVzc1N0YXR1c01vbml0b3IoKSk7XHJcbmFwcC51c2UoY29tcHJlc3Npb24oKSk7XHJcbmFwcC51c2UobG9nZ2VyKCdkZXYnKSk7XHJcbmFwcC51c2UoYm9keVBhcnNlci5qc29uKCkpO1xyXG5hcHAudXNlKGJvZHlQYXJzZXIudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlIH0pKTtcclxuYXBwLnVzZShleHByZXNzVmFsaWRhdG9yKCkpO1xyXG5hcHAudXNlKHNlc3Npb24oe1xyXG4gIHJlc2F2ZTogdHJ1ZSxcclxuICBzYXZlVW5pbml0aWFsaXplZDogdHJ1ZSxcclxuICBzZWNyZXQ6IHByb2Nlc3MuZW52LlNFU1NJT05fU0VDUkVULFxyXG4gIHN0b3JlOiBuZXcgTW9uZ29TdG9yZSh7XHJcbiAgICB1cmw6IHByb2Nlc3MuZW52Lk1PTkdPREJfVVJJIHx8IHByb2Nlc3MuZW52Lk1PTkdPTEFCX1VSSSxcclxuICAgIGF1dG9SZWNvbm5lY3Q6IHRydWVcclxuICB9KVxyXG59KSk7XHJcbmFwcC51c2UocGFzc3BvcnQuaW5pdGlhbGl6ZSgpKTtcclxuYXBwLnVzZShwYXNzcG9ydC5zZXNzaW9uKCkpO1xyXG5hcHAudXNlKGZsYXNoKCkpO1xyXG5hcHAudXNlKGx1c2NhLnhmcmFtZSgnU0FNRU9SSUdJTicpKTsgXHJcbmFwcC51c2UobHVzY2EueHNzUHJvdGVjdGlvbih0cnVlKSk7XHJcbmFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgcmVzLmxvY2Fscy51c2VyID0gcmVxLnVzZXI7XHJcbiAgbmV4dCgpO1xyXG59KTtcclxuYXBwLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAvLyBBZnRlciBzdWNjZXNzZnVsIGxvZ2luLCByZWRpcmVjdCBiYWNrIHRvIHRoZSBpbnRlbmRlZCBwYWdlXHJcbiAgaWYgKCFyZXEudXNlciAmJlxyXG4gICAgICByZXEucGF0aCAhPT0gJy9sb2dpbicgJiZcclxuICAgICAgcmVxLnBhdGggIT09ICcvc2lnbnVwJyAmJlxyXG4gICAgICAhcmVxLnBhdGgubWF0Y2goL15cXC9hdXRoLykgJiZcclxuICAgICAgIXJlcS5wYXRoLm1hdGNoKC9cXC4vKSkge1xyXG4gICAgcmVxLnNlc3Npb24ucmV0dXJuVG8gPSByZXEucGF0aDtcclxuICB9IGVsc2UgaWYgKHJlcS51c2VyICYmXHJcbiAgICAgIHJlcS5wYXRoID09ICcvYWNjb3VudCcpIHtcclxuICAgIHJlcS5zZXNzaW9uLnJldHVyblRvID0gcmVxLnBhdGg7XHJcbiAgfVxyXG4gIG5leHQoKTtcclxufSk7XHJcbmFwcC51c2UoZXhwcmVzcy5zdGF0aWMocGF0aC5qb2luKF9fZGlybmFtZSwgJ3B1YmxpYycpLCB7IG1heEFnZTogMzE1NTc2MDAwMDAgfSkpO1xyXG5cclxuLyoqXHJcbiAqIFByaW1hcnkgYXBwIHJvdXRlcy5cclxuICovXHJcbmFwcC5nZXQoJy8nLCBob21lQ29udHJvbGxlci5pbmRleCk7XHJcbmFwcC5nZXQoJy9sb2dpbicsIHVzZXJDb250cm9sbGVyLmdldExvZ2luKTtcclxuYXBwLnBvc3QoJy9sb2dpbicsIHVzZXJDb250cm9sbGVyLnBvc3RMb2dpbik7XHJcbmFwcC5nZXQoJy9sb2dvdXQnLCB1c2VyQ29udHJvbGxlci5sb2dvdXQpO1xyXG5hcHAuZ2V0KCcvZm9yZ290JywgdXNlckNvbnRyb2xsZXIuZ2V0Rm9yZ290KTtcclxuYXBwLnBvc3QoJy9mb3Jnb3QnLCB1c2VyQ29udHJvbGxlci5wb3N0Rm9yZ290KTtcclxuYXBwLmdldCgnL3Jlc2V0Lzp0b2tlbicsIHVzZXJDb250cm9sbGVyLmdldFJlc2V0KTtcclxuYXBwLnBvc3QoJy9yZXNldC86dG9rZW4nLCB1c2VyQ29udHJvbGxlci5wb3N0UmVzZXQpO1xyXG5hcHAuZ2V0KCcvc2lnbnVwJywgdXNlckNvbnRyb2xsZXIuZ2V0U2lnbnVwKTtcclxuYXBwLnBvc3QoJy9zaWdudXAnLCB1c2VyQ29udHJvbGxlci5wb3N0U2lnbnVwKTtcclxuYXBwLmdldCgnL2NvbnRhY3QnLCBjb250YWN0Q29udHJvbGxlci5nZXRDb250YWN0KTtcclxuYXBwLnBvc3QoJy9jb250YWN0JywgY29udGFjdENvbnRyb2xsZXIucG9zdENvbnRhY3QpO1xyXG5hcHAuZ2V0KCcvYWNjb3VudCcsIHBhc3Nwb3J0Q29uZmlnLmlzQXV0aGVudGljYXRlZCwgdXNlckNvbnRyb2xsZXIuZ2V0QWNjb3VudCk7XHJcbmFwcC5wb3N0KCcvYWNjb3VudC9wcm9maWxlJywgcGFzc3BvcnRDb25maWcuaXNBdXRoZW50aWNhdGVkLCB1c2VyQ29udHJvbGxlci5wb3N0VXBkYXRlUHJvZmlsZSk7XHJcbmFwcC5wb3N0KCcvYWNjb3VudC9wYXNzd29yZCcsIHBhc3Nwb3J0Q29uZmlnLmlzQXV0aGVudGljYXRlZCwgdXNlckNvbnRyb2xsZXIucG9zdFVwZGF0ZVBhc3N3b3JkKTtcclxuYXBwLnBvc3QoJy9hY2NvdW50L2RlbGV0ZScsIHBhc3Nwb3J0Q29uZmlnLmlzQXV0aGVudGljYXRlZCwgdXNlckNvbnRyb2xsZXIucG9zdERlbGV0ZUFjY291bnQpO1xyXG5hcHAuZ2V0KCcvYWNjb3VudC91bmxpbmsvOnByb3ZpZGVyJywgcGFzc3BvcnRDb25maWcuaXNBdXRoZW50aWNhdGVkLCB1c2VyQ29udHJvbGxlci5nZXRPYXV0aFVubGluayk7XHJcblxyXG4vKipcclxuICogQVBJIGV4YW1wbGVzIHJvdXRlcy5cclxuICovXHJcbmFwcC5nZXQoJy9hcGknLCBhcGlDb250cm9sbGVyLmdldEFwaSk7XHJcbmFwcC5nZXQoJy9hcGkvZmFjZWJvb2snLCBwYXNzcG9ydENvbmZpZy5pc0F1dGhlbnRpY2F0ZWQsIHBhc3Nwb3J0Q29uZmlnLmlzQXV0aG9yaXplZCwgYXBpQ29udHJvbGxlci5nZXRGYWNlYm9vayk7XHJcblxyXG4vKipcclxuICogT0F1dGggYXV0aGVudGljYXRpb24gcm91dGVzLiAoU2lnbiBpbilcclxuICovXHJcbmFwcC5nZXQoJy9hdXRoL2ZhY2Vib29rJywgcGFzc3BvcnQuYXV0aGVudGljYXRlKCdmYWNlYm9vaycsIHsgc2NvcGU6IFsnZW1haWwnLCAncHVibGljX3Byb2ZpbGUnXSB9KSk7XHJcbmFwcC5nZXQoJy9hdXRoL2ZhY2Vib29rL2NhbGxiYWNrJywgcGFzc3BvcnQuYXV0aGVudGljYXRlKCdmYWNlYm9vaycsIHsgZmFpbHVyZVJlZGlyZWN0OiAnL2xvZ2luJyB9KSwgKHJlcSwgcmVzKSA9PiB7XHJcbiAgcmVzLnJlZGlyZWN0KHJlcS5zZXNzaW9uLnJldHVyblRvIHx8ICcvJyk7XHJcbn0pO1xyXG5hcHAuZ2V0KCcvYXV0aC9nb29nbGUnLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoJ2dvb2dsZScsIHsgc2NvcGU6ICdwcm9maWxlIGVtYWlsJyB9KSk7XHJcbmFwcC5nZXQoJy9hdXRoL2dvb2dsZS9jYWxsYmFjaycsIHBhc3Nwb3J0LmF1dGhlbnRpY2F0ZSgnZ29vZ2xlJywgeyBmYWlsdXJlUmVkaXJlY3Q6ICcvbG9naW4nIH0pLCAocmVxLCByZXMpID0+IHtcclxuICByZXMucmVkaXJlY3QocmVxLnNlc3Npb24ucmV0dXJuVG8gfHwgJy8nKTtcclxufSk7XHJcbmFwcC5nZXQoJy9hdXRoL3R3aXR0ZXInLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoJ3R3aXR0ZXInKSk7XHJcbmFwcC5nZXQoJy9hdXRoL3R3aXR0ZXIvY2FsbGJhY2snLCBwYXNzcG9ydC5hdXRoZW50aWNhdGUoJ3R3aXR0ZXInLCB7IGZhaWx1cmVSZWRpcmVjdDogJy9sb2dpbicgfSksIChyZXEsIHJlcykgPT4ge1xyXG4gIHJlcy5yZWRpcmVjdChyZXEuc2Vzc2lvbi5yZXR1cm5UbyB8fCAnLycpO1xyXG59KTtcclxuXHJcblxyXG4vKipcclxuICogRXJyb3IgSGFuZGxlci4gUHJvdmlkZXMgZnVsbCBzdGFjayAtIHJlbW92ZSBmb3IgcHJvZHVjdGlvblxyXG4gKi9cclxuYXBwLnVzZShlcnJvckhhbmRsZXIoKSk7ICBcclxuXHJcbi8qKlxyXG4gKiBTdGFydCBFeHByZXNzIHNlcnZlci5cclxuICovXHJcbmFwcC5saXN0ZW4oYXBwLmdldCgncG9ydCcpLCAoKSA9PiB7XHJcbiAgY29uc29sZS5sb2coKCcgIEFwcCBpcyBydW5uaW5nIGF0IGh0dHA6Ly9sb2NhbGhvc3Q6JWQgaW4gJXMgbW9kZScpLCBhcHAuZ2V0KCdwb3J0JyksIGFwcC5nZXQoJ2VudicpKTtcclxuICBjb25zb2xlLmxvZygnICBQcmVzcyBDVFJMLUMgdG8gc3RvcFxcbicpO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYXBwO1xyXG4iXX0=
