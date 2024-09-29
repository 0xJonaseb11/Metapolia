var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');

var router = express.Router();

router.get('/', function(req, res) {
    var errors = req.flash('error');
    var error = '';
    if (errors.length) {
        error = errors[0];
    }

    res.render('partials/login', {
        title: 'Chess Hub - Login',
        error: error,
        isLoginPage: true
    });
});

router.post('/',
    passport.authenticate('local',{ failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
        console.log("here");
        User.findOneAndUpdate({_id: req.user._id}, { lastConnection: new Date() }, {} ,function (err, user) {
            // req.flash('welcomeMessage', 'Welcome ' + user.name + '!');
            // res.redirect('/');
            res.status(200).send({
                message: 'Welcome ' + user.name + '!'
            })
        });
    });

module.exports = router;
