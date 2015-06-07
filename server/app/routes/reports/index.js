'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var ImageCapture = mongoose.model('ImageCapture');
var User = mongoose.model('User');



// - api/user/:userId/reports

router.get('/', function(req, res, next) {
	ImageCapture.find({}, function(err, data) {
		res.json(data);
	});
});




router.get('/:id', function(req, res, next) {
	res.json(req.user);
});

router.param('id', function(req, res, next, id) {
	User.findById(id, function(err, user) {
		if(err) return next(err);
		if(!user) return res.status(404).end();
		req.user = user;
		next();
	});
});

module.exports = router;


// screencapture function 
var Nightmare = require('nightmare');
var nightmare = new Nightmare();






// image diff function



// frequency function 




