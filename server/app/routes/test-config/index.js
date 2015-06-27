'use strict';
var AWSkeys = require('./AWSkeys'); 
process.env.AWS_ACCESS_KEY_ID = AWSkeys.accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = AWSkeys.secretAccessKey;

// var Promise = require("bluebird");
var Nightmare = require('nightmare');
var nightmare = new Nightmare();

var roboto = require('roboto');


var CronJob = require('cron').CronJob;
var Q = require('q');
var chalk = require('chalk');

var AWS = require('aws-sdk'); 
var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}});
AWS.config.region = AWSkeys.region; 

var router = require('express').Router();
var mongoose = require('mongoose');
var	testConfig = mongoose.model('TestConfig');
var	imageCapture = mongoose.model('ImageCapture');
var imageDiff = mongoose.model('ImageDiff');
module.exports = router;


// router.get('/', function (req, res, next) {
// 	testConfig.findById(req.params.id, function (err, testConfigDoc) {
//     	if (err) return next(err);
//     	res.json(testConfigDoc);
//     });
// });

// router.get('/:id', function (req, res, next) {
// 	console.log(req.params)
//     testConfig.findById(req.params.id, function (err, testConfigDoc) {
//     	if (err) return next(err);
//     	res.json(testConfigDoc);
//     });
// });

router.get('/byURLs/:id', function (req, res, next) {

	testConfig.getTestNamesForUser(req.params.id)
		.then(function(testNames) {
			var promises = []			

			testNames.map(function(el){
				promises.push(testConfig.getURLsForTest(req.params.id, el)
					.then(function(urls){
						return {testName: el, URLs: urls}
					})
				);
			});

		return Q.all(promises);

	 	}).then(function(temp){
	 		res.json(temp);
	 	}).then(null, function(error) {
		   	console.log(error);
		});
});




router.post('/', function (req, res, next) {
	testConfig.create(req.body, function (err, testConfigDoc) {
		if (err) return next(err);
	
		res.json(testConfigDoc);

	});
});

router.post('/bulk', function (req, res, next) {
	getURLs(req.body)
});




var getURLs = function(obj) {
	
	var crawlObj = {
		startUrls: [obj.startURL],
		maxDepth: 1,
		constrainToRootDomains: true,
		statsDumpInverval: 50
	};

	if (obj.blacklist) {
		crawlObj.blacklist = [obj.blacklist];
	};
	if (obj.whitelist) {
		crawlObj.whitelist = [obj.whitelist];
	};

	var crawler = new roboto.Crawler(crawlObj);

	crawler.parseField('url', function(response, $){
	return response.url;
	});

	crawler.on('item', function(item) {
        obj.viewport.forEach(function(viewport) {
            testConfig.create({
                name: obj.testName,
                URL: item.url,
                rootURL: obj.startURL,
                threshold: obj.threshold,
                viewport: viewport,
                dayFrequency: obj.dayFrequency,
                hourFrequency: obj.hourFrequency,
                userID: obj.userID
            });
		});      
    });

	crawler.crawl();	
}; 




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
		testConfig.findAllScheduledTests(10, 6).then(function(configs) {
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

// intervalJob.start();



















