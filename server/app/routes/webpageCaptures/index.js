'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var WebpageCapture = mongoose.model('WebpageCapture');
var User = mongoose.model('User');

// - api/user/:userId/webpageCaptures

router.get('/', function(req, res, next) {

	req.query.user = req.user._id;

	WebpageCapture.find(req.query, function(err, data) {
		res.json(data);
	});
});

router.get('/:id', function(req, res, next) {
	req.webpageCapture.populate('user', function(err, populatedWebpageCapture){
		res.json(populatedWebpageCapture);
	});
});

router.param('id', function(req, res, next, id) {
	WebpageCapture.findById(id, function(err, webpageCapture) {
		if(err) return next(err);
		if(!webpageCapture) return res.status(404).end();
		req.webpageCapture = webpageCapture;
		next();
	});
});

module.exports = router;
