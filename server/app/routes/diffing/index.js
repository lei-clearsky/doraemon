'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var UserModel = mongoose.model('User');

router.get('/', function (req, res) {
	UserModel.find({}, function (err, users) {
		res.json(users);
	});
});

router.get('/:id', function (req, res) {
    UserModel.findById(req.params.id, function (err, user) {
    	res.json(user);
    });
});

router.post('/', function (req, res) {
	UserModel.create(req.body, function (err, user) {
		res.json(user);
	});
});


















