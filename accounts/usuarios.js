const passport = require('passport');
const express = require('express');

const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/users')
require('../loggers/log4js')
const log4js = require("log4js");

const loggerConsola = log4js.getLogger('consola');
const loggerWarn = log4js.getLogger('warn');
const loggerError = log4js.getLogger('error');


// setear facebook client id y secret key por linea de comando
let FACEBOOK_CLIENT_ID = " "
let FACEBOOK_CLIENT_SECRET = " ";

if (process.argv[4] && process.argv[5]) {
    FACEBOOK_CLIENT_ID = process.argv[4];
    FACEBOOK_CLIENT_SECRET = process.argv[5];
} else {
    loggerConsola.warn('No se ingresaron los valores correctamente. Se procede a usar valores por defecto')
    loggerWarn.warn('No se ingresaron los valores correctamente. Se procede a usar valores por defecto')

    FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
    FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
}

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'emails'],
    scope: ['email']
}, function (accessToken, refreshToken, profile, done) {
    let userProfile = profile._json;
    loggerConsola.info(userProfile)

    return done(null, userProfile);
}));

passport.serializeUser(function (user, done) {

    done(null, user);
});

passport.deserializeUser(function (user, done) {

    done(null, user);
});

