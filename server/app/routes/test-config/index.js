 accessKeyId: "AKIAJWQOU4YHMONC2R5Q"
 secretAccessKey: "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"


'use strict';


// var Promise = require("bluebird");
var Nightmare = require('nightmare');
var nightmare = new Nightmare();

var CronJob = require('cron').CronJob;
var Q = require('q');
var chalk = require('chalk');

var AWS = require('aws-sdk'); 
var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}});
AWS.config.region = 'us-standard'; 

var router = require('express').Router();
var mongoose = require('mongoose');
var	testConfig = mongoose.model('TestConfig');
var	imageCapture = mongoose.model('ImageCapture');
var imageDiff = mongoose.model('ImageDiff');
module.exports = router;

router.get('/', function (req, res, next) {
	var params = {Bucket: 'capstone-doraemon', Key: 'myKey'};

	var imgStream = s3.getObject(params).createReadStream();
	imgStream.pipe(res);
});

router.get('/:id', function (req, res, next) {
    testConfig.findById(req.params.id, function (err, testConfigDoc) {
    	if (err) return next(err);
    	res.json(testConfigDoc);
    });
});

router.post('/', function (req, res, next) {
	testConfig.create(req.body, function (err, testConfigDoc) {
		if (err) return next(err);
	
		res.json(testConfigDoc);

	});
});

var intervalJob = new CronJob({
  	cronTime: '0 * * * * *',  // this is the timer, set to every minuite for testing purposes
  	onTick: function() {
		// retrieving information about the date to be used later
		
		// currently using Weekday: 6, Hour: 10 as params for testing purposes
		// var date = new Date();
		var date = new Date('June 13, 2015 10:00:00');
		
		var hour = date.getHours();
		var weekday = date.getDay();

		console.log(chalk.magenta('Starting test-config jobs for Weekday: ' + weekday + ', Hour: ' + hour));
		// searches TestConfig model and retrives URL objects
		testConfig.findAllScheduledTests(hour, weekday).then(function(configs) {
			var promises = [];

			configs.forEach(function(config) {
				promises.push(testConfig.runTestConfig(nightmare, config, date));
			});

			nightmare.run();

			return Q.all(promises);
		}).then(function() {
			console.log(chalk.magenta('Finished with all jobs for Weekday: ' + weekday + ', Hour: ' + hour));
		}).then(null, function(error) {
		   	console.log(error);
		});
  	},
  	start: false
});

intervalJob.start();