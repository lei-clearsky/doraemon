'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

router.use('/:id/reports', require('../reports'));

router.get('/', function(req, res, next) {
	User.find({}, function(err, data) {
		res.json(data);
	});
});

router.post('/', function(req, res, next) {
	User.create(req.body, function(err, inserted) {
		if (err) throw err;
		res.json(inserted);
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