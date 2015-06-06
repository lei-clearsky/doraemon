'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');

router.get('/', function (req, res, next) {
	UserModel.find({}, function (err, users) {
		if (err) return next(err);
		res.json(users);
	});
});

router.get('/:id', function (req, res, next) {
    UserModel.findById(req.params.id, function (err, user) {
    	if (err) return next(err);
    	res.json(user);
    });
});

router.post('/', function (req, res, next) {
	UserModel.create(req.body, function (err, user) {
		if (err) return next(err);
		console.log('new user!!! ', user);
		res.json(user);
	});
});


















