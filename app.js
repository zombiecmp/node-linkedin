// paspport dependencies

var passport = require('passport');
const express = require("express");
let session = require('express-session');

const app = express();
const port = process.env.PORT || "3000";

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

const SCOPE = ['r_liteprofile','r_emailaddress', 'w_member_social', 'rw_company_admin'];


// linkedin app settings
var LINKEDIN_CLIENT_ID = "86p8vmoyyb0cob";
var LINKEDIN_CLIENT_SECRET = "enJ7p84huzSIirjb";
const CALLBACK_URL = "http://localhost:3000/auth/linkedin/callback";
var Linkedin = require('node-linkedin')(LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET);

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_CLIENT_ID,
    clientSecret: LINKEDIN_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: SCOPE,
    passReqToCallback: true
},
function (req, accessToken, refreshToken, profile, done) {
    console.log(accessToken);
    process.nextTick(function () {
        return done(null, profile);
	});
}));

// for auth

app.get('/auth/linkedin',
  passport.authenticate('linkedin', { state: 'SOME STATE'  }),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
});

// for callback

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/' }),
function (req, res) {
    console.log('callback called');
    res.redirect('/');
});

app.get('/my-profile', function (req, res) {
    var token = (req.body && req.body.access_token) || 
    (req.query && req.query.access_token) || req.headers['x-access-token'];

    if (token != undefined) {
        var linkedin = Linkedin.init(token);
        console.log('linkedin init');

        linkedin.people.me(function(err, $in) {
            console.log('people me');
            if (err){
                console.log(err);
            }
            console.log($in);
            res.json($in);
        });
    }
});

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
  });