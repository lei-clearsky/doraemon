'use strict';

var router = require('express').Router();
module.exports = router;

var mongoose = require('mongoose');
var User = mongoose.model('User');
var TestConfig = mongoose.model('TestConfig');
var ImageDiff = mongoose.model('ImageDiff');
var ImageCapture = mongoose.model('ImageCapture');

router.get('/searchTestByName', function (req, res, next) {
	var searchQuery;
	console.log('req.query.testNames ', req.query.testNames);

	if (typeof req.query.testNames === 'string') {
		searchQuery = req.query.testNames;
	} else {
		searchQuery = {'$in': req.query.testNames};
	}

	TestConfig.find({
				userID: req.query.user,
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
	ImageDiff.find({
				userID: req.query.user,
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

router.get('/searchDiffsByTest', function (req, res, next) {
	ImageDiff.find({
				userID: req.query.user,
				testName: req.query.testName
			})
			.exec()
			.then(function(diffs) {
				console.log('found diffs!!');
				res.json(diffs);
			}, function(err) {
				console.log('err finding diffs');
				console.log(err);
				res.json(err);

			});
});

router.get('/diffsByUrl', function (req, res, next) {
	TestConfig.getDiffsByUrl(req.query.url, req.query.name, req.query.userID)
		.then(function(diffs) {
			console.log('diffs ', diffs);
			res.json(diffs);
		})
		.then(null, function(err) {
			console.log(err);
		});
});

router.get('/:userId', function (req, res, next) {

	TestConfig.find({userID: req.params.userId})
			.exec()
			.then(function(tests) {
				res.json(tests);
			});

});

router.get('/diff/:id', function (req, res, next) {
	ImageDiff.findById(req.params.id)
			.exec()
			.then(function(diff) {
				res.json(diff);
			});
});


router.get('/allDiffs/:userId', function (req, res, next) {
	
	ImageDiff.find({userID: req.params.userId})
			.populate('compareFromID')
			.populate('compareToID')
			.exec(function(err, allDiffs) {
				if (err) return next(err);
				res.json(allDiffs);
			});
});

router.get('/allScreenshots/:userId', function (req, res, next) {
	ImageDiff.find({userID: req.params.userId})
			.exec(function(err, allScreenshots) {
				if (err) return next(err);
				res.json(allScreenshots);
			});
});

















