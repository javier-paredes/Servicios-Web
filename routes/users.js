require('dotenv').config()
const express = require('express');
require('../accounts/usuarios')
const passport = require('passport');
const Ethereal = require('../mensajeria/emailEthereal')
const Gmail = require('../mensajeria/emailGmail')

const routerUsuarios = express.Router();


// LOGIN CON FACEBOOK

routerUsuarios.get('/auth/facebook', passport.authenticate('facebook'));

routerUsuarios.get('/auth/facebook/callback', passport.authenticate('facebook',
    {
        successRedirect: '/login',
        failureRedirect: '/faillogin'
    }
));

routerUsuarios.get('/login', (req, res) => {

    Ethereal.enviarMailLogIn(req.user.email, req.user.name);
    Gmail.enviarMail(req.user.email, req.user.picture.data.url)
    res.render('vista', {
        showLogin: false,
        showContent: true,
        bienvenida: req.user.name,
        email: req.user.email,
        urlImg: req.user.picture.data.url,
        showBienvenida: true
    });
})

routerUsuarios.get('/faillogin', (req, res) => {
    res.sendFile(__dirname + '/public/failLogin.html')
})

// LOGOUT
routerUsuarios.get('/logout', (req, res) => {
    Ethereal.enviarMailLogOut(req.user.email, req.user.name)
    req.logout();
    res.sendFile(__dirname + '/public/logout.html')
})

module.exports = routerUsuarios;