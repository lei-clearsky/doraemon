'use strict';
var AWSkeys = require('../test-config/AWSkeys'); 
process.env.AWS_ACCESS_KEY_ID = AWSkeys.accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = AWSkeys.secretAccessKey;

var Nightmare = require('nightmare');
var nightmare = new Nightmare();

var Q = require('q');
var chalk = require('chalk');

var AWS = require('aws-sdk'); 
var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}});
AWS.config.region = AWSkeys.region; 

var router = require('express').Router();
var mongoose = require('mongoose');
var	testCase = mongoose.model('TestCase');
module.exports = router;

router.get('/', function (req, res, next) {
	testCase.find({},function (err, testCases) {
    	if (err) return next(err);
    	res.json(testCases);
    });
});

router.get('/:id', function (req, res, next) {
    testCase.findById(req.params.id, function (err, testCase) {
    	if (err) return next(err);
    	res.json(testCase);
    });
});

router.post('/', function (req, res, next) {


});

router.post('/extension', function (req, res, next) {

	var testCaseObj = {
		URL: req.body.steps[0].value,
		userID: req.body.userID,
		steps: req.body.steps,
		formCompleted: false
	};

	testCase.create(testCaseObj, function (err, newTestCase) {
		if (err) return next(err);
	
		res.json(newTestCase);
	});
});