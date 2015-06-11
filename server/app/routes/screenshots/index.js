'use strict';

var router = require('express').Router();
module.exports = router;
// var	AWS = require('aws-sdk'),
// 	s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}}),
//     fs = require('fs');
// AWS.config.region = 'us-standard';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var TestConfig = mongoose.model('TestConfig');
var ImageDiff = mongoose.model('ImageDiff');
var ImageCapture = mongoose.model('ImageCapture');

router.get('/searchByTestName', function (req, res, next) {
	console.log('query object ', req.query.testNames);

	var searchQuery;
	console.log('req.query.testNames ', req.query.testNames);

	if (typeof req.query.testNames === 'string') {
		searchQuery = req.query.testNames;
	} else {
		searchQuery = {'$in': req.query.testNames};
	}

	TestConfig.find({
				user: req.query.user,
				name: searchQuery
			})
			.exec()
			.then(function(tests) {
				console.log('found tests!!');
				res.json(tests);
			}, function(err) {
				console.log('err finding tests');
				res.json(err);

			});
});

router.get('/searchDiffs', function (req, res, next) {
	console.log('test');
	console.log('query object ', req.query);

	ImageDiff.find({
				user: req.query.user,
				websiteUrl: {'$in': req.query.websiteURLs}
			})
			.exec()
			.then(function(diffs) {
				console.log('found diffs!!');
				res.json(diffs);
			}, function(err) {
				console.log('err finding diffs');
				res.json(err);

			});
});

router.get('/:userId', function (req, res, next) {

	TestConfig.find({user: req.params.userId})
			.exec()
			.then(function(tests) {
				res.json(tests);
			});

});

router.get('/diff/:id', function (req, res, next) {
	ImageDiff.findById(req.params.id)
			.exec()
			.then(function(diff) {
				console.log('single diff image ', diff);
				res.json(diff);
			})
});


router.get('/allDiffs/:userId', function (req, res, next) {
	ImageDiff.find({user: req.params.userId})
			.exec(function(err, allDiffs) {
				if (err) return next(err);
				res.json(allDiffs);
			});
});

router.get('/allScreenshots/:userId', function (req, res, next) {
	ImageDiff.find({user: req.params.userId})
			.exec(function(err, allScreenshots) {
				if (err) return next(err);
				res.json(allScreenshots);
			});
});

















