'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var ImageCapture = mongoose.model('ImageCapture');
var User = mongoose.model('User');

router.get('/imageCapture/:id', function (req, res, next) {
	console.log('test test');
	ImageCapture.findById(req.params.id)
			.exec()
			.then(function(img) {
				res.json(img);
				console.log('image capture ', img);
			});
});

router.get('/', function(req, res, next) {

	req.query.user = req.user._id;

	ImageCapture.find(req.query, function(err, data) {
		res.json(data);
	});
});

router.get('/:id', function(req, res, next) {
	req.imageCapture.populate('user', function(err, populateImageCapture){
		res.json(populateImageCapture);
	});
});

router.param('id', function(req, res, next, id) {
	ImageCapture.findById(id, function(err, imageCapture) {
		if(err) return next(err);
		if(!imageCapture) return res.status(404).end();
		req.imageCapture = imageCapture;
		next();
	});
});

module.exports = router;
