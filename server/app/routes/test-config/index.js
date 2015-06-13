'use strict';

var Nightmare = require('nightmare');
var nightmare = new Nightmare();

var CronJob = require('cron').CronJob;
var Q = require('q');
var Promise = require("bluebird");
var gm = require('gm');
var mkdirp = require('mkdirp');
var fs = require('fs');

var router = require('express').Router();
module.exports = router;

var mongoose = require('mongoose');
var	testConfig = mongoose.model('TestConfig');
var	imageCapture = mongoose.model('ImageCapture');
var imageDiff = mongoose.model('ImageDiff');

var path = require('path');

var	AWS = require('aws-sdk');
// var configPath = path.join(__dirname, '/config.json');

var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}});
    
AWS.config.region = 'us-standard';

// testing purposes
var hour = 10;
var weekday = 6;

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
    console.log('process begins...');
    
    var date = new Date();
    // var hour = date.getHours();
    // var weekday = date.getDay();
    
    // searches TestConfig model and retrives URL objects
    // currently using 1, 6 as params for testing purposes
    testConfig.findAllScheduledTests(10, 6).then(function(configs) {
		configs.forEach(function(config) {
			runTestConfig(config, date);
		});

		nightmare.run(function() {
			console.log('finished with all');
		});
	}).then(null, function(error) {
       	console.log(error);
    });
  },
  start: false
});

// intervalJob.start();

function runTestConfig(config, date) {
	// var hour = date.getHours();
	// var weekday = date.getDay();

	var snapshotPath = createImageDir(config.userID, config.name, config.viewport, 'snapshots', hour, weekday, date.getTime());

	// use nightmare to take a screenshot
	nightmare
		.viewport(config.viewportWidth, config.viewportHeight)
		.goto(config.URL)	
		.wait()	
		.screenshot(snapshotPath)
		.use(function() {
			console.log('screenshot completed...');
			saveImageCapture(config, snapshotPath, date).then(function(ImageCaptures) {
				return createDiff(config, ImageCaptures, date);
			}).then(function(output) {
				return saveDiffImage(output);
			}).then(null, function(err) {
				throw err;
			});
		});
};

function saveImageCapture(config, snapshotPath, date) {
	// var hour = date.getHours();
	// var weekday = date.getDay();

	var snapshotS3Path = snapshotPath.slice(2);
	var diffS3Path, diffImgPath, lastImageCapture;
	// searches for last screenshot taken
	return imageCapture
		.searchForLastSaved(config.URL, config.userID, config.viewport) 
		.then(function(lastImg) {

			// creating temporary object to be stored in database
			var newImage = {
				websiteURL: config.URL,
				viewport: config.viewport,	
				imgURL: snapshotPath,
				userID: config.userID,
				testName: config.name
			}

			lastImageCapture = lastImg;
			// creates new image in database
			return imageCapture.create(newImage);
		}).then(function(newImg) {
			console.log('new imageCapture document saved...');

			// save file to AWS
			var imgPath = path.join(__dirname, '../../../../' + snapshotS3Path);

			saveToAWS(imgPath, snapshotS3Path);

			return { newImageCapture: newImg, lastImageCapture: lastImageCapture };
		});
};


function createDiff(config, ImageCaptures, date) {
	// var hour = date.getHours();
	// var weekday = date.getDay();

	// diff the images
    var diffPath = createImageDir(config.userID, config.name, config.viewport, 'diffs', hour, weekday, date.getTime());
    
    var deferred = Q.defer();

    var options = {
        highlightColor: 'yellow', // optional. Defaults to red
        file: diffPath // required
    };

    if (!ImageCaptures.lastImageCapture) {
    	console.log('No previous snapshot created');
    	deferred.resolve(null);
    }
	
	console.log('diffing the images...');
	gm.compare(ImageCaptures.lastImageCapture.imgURL, ImageCaptures.newImageCapture.imgURL, options, function (err, isEqual, equality, raw) {    
	    if (err) throw err;
        // console.log('The images are equal: %s', isEqual);
        // console.log('Actual equality: %d', equality);
        // console.log('Raw output was: %j', raw);    
	        
      	var output = {
		    percent: equality,
		    file: options.file,
		    config: config
		};

		console.log('diff output...', output);
	    deferred.resolve(output);
	});

	return deferred.promise; 
};

function saveDiffImage(output) {
	if (!output)
		return;

	console.log('saving diff image to database...');

	// temp image object to be save to database
	var diffImage = {
		diffImgURL: output.file,
		diffPercent: output.percent,
		websiteUrl: output.config.URL,
		viewport: output.config.viewport,
		userID: output.config.userID,
		testName: output.config.name
	};

	return imageDiff.create(diffImage).then(function(img) {
		var diffS3Path = output.file.slice(2);
		var diffImgPath = path.join(__dirname, '../../../../' + diffS3Path);
		saveToAWS(diffImgPath, diffS3Path);
		return img;
	});
}

function createImageDir(userID, configName, viewport, imgType, hour, day, time) {
	// temp_images/userID/configName/viewport/imgType/hour_weekday_date.now() + .png
	var path = './temp_images/' + userID + '/' + configName + '/' + viewport + '/' + imgType;

	mkdirp(path, function (err) {
	    if (err) console.error(err);
	});

	path += '/' + hour + '_' + day + '_' + time +'.png';

	return path;
}

function saveToAWS(filepath, S3Path) {
	// save file to AWS
	var imgPath = path.join(__dirname, '../../../../' + filepath);

	// console.log('this is the path', imgPath)

    fs.readFile(filepath, function (err, data) {
        if (err) { return console.log(err); }
		var params = {Key: S3Path, Body: data};
		// console.log('xky', s3.createBucket.toString());
		s3.createBucket(function(err, data) {
			// console.log('error?: ', err);
			if (err) return console.log(err);
		  	s3.upload(params, function(err, data) {
			    if (err) {
			      	console.log("Error uploading data: ", err);
			      	console.log(err);
			    } else {
			      	console.log("Successfully uploaded data to myBucket/myKey");
			    }
		  	});
		});
    });
    // end save file to AWS
}