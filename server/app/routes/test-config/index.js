'use strict';
process.env.AWS_ACCESS_KEY_ID='AKIAJWQOU4YHMONC2R5Q';
process.env.AWS_SECRET_ACCESS_KEY='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';

// var Promise = require("bluebird");
var Nightmare = require('nightmare');
var nightmare = new Nightmare();

var CronJob = require('cron').CronJob;
var Q = require('q');
var gm = require('gm');
var mkdirp = require('mkdirp');
var fs = require('fs');
var chalk = require('chalk');

var router = require('express').Router();
var mongoose = require('mongoose');
var	testConfig = mongoose.model('TestConfig');
var	imageCapture = mongoose.model('ImageCapture');
var imageDiff = mongoose.model('ImageDiff');
module.exports = router;

var path = require('path');
var	AWS = require('aws-sdk');
var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}});
AWS.config.region = 'us-standard';

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
		var date = new Date();
		// var hour = date.getHours();
		// var weekday = date.getDay();

		// testing purposes
		var hour = 10;
		var weekday = 6;

		console.log(chalk.magenta('Starting test-config jobs for Weekday: ' + weekday + ', Hour: ' + hour));
		// searches TestConfig model and retrives URL objects
		// currently using 10, 6 as params for testing purposes
		testConfig.findAllScheduledTests(hour, weekday).then(function(configs) {
			var promises = [];

			configs.forEach(function(config) {
				promises.push(runTestConfig(config, date));
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

function runTestConfig(config, date) {
	// var hour = date.getHours();
	// var weekday = date.getDay();

	// testing purposes
	var hour = 10;
	var weekday = 6;

	var deferred = Q.defer();
	var snapshotPath = createImageDir(config.userID, config.name, config.viewport, 'snapshots', hour, weekday, date.getTime(), config._id);
	
	// use nightmare to take a screenshot
	nightmare
		.viewport(config.viewportWidth, config.viewportHeight)
		.goto(config.URL)	
		.wait()	
		.screenshot(snapshotPath)
		.use(function() {
			console.log(chalk.cyan('Starting testConfig job - ' + config._id));
			console.log(chalk.green('Screenshot created...'));
			saveImageCapture(config, snapshotPath, date)
			.then(function(ImageCaptures) {
				console.log(chalk.green('New imageCapture document saved...'));
				return createDiff(config, ImageCaptures, date);
			}).then(function(output) {
				if (output) {
					console.log(chalk.green('New imageDiff document saved...'));
					return saveDiffImage(output);
				} else {
					console.log(chalk.yellow('No previous snapshot found'));
					return null;
				}
			}).then(function(output) {
				if (output)
					console.log(chalk.green('Saved diff image...'));
				console.log(chalk.cyan('Finished testConfig job - ' + config._id));

				return deferred.resolve(output);
			}).then(null, function(err) {
				deferred.reject(err);
			});
		});

	return deferred.promise;
};

function saveImageCapture(config, snapshotPath) {
	var snapshotS3Path = snapshotPath.slice(2);
	var diffS3Path, diffImgPath, lastImageCapture, newImageCapture;
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
			newImageCapture = newImg;

			// save file to AWS
			var imgPath = path.join(__dirname, '../../../../' + snapshotS3Path);

			return saveToAWS(imgPath, snapshotS3Path);
		}).then(function() {
			return { newImageCapture: newImageCapture, lastImageCapture: lastImageCapture };
		}).then(null, function(err) {
			return err;
		});
};

function createDiff(config, ImageCaptures, date) {
	// var hour = date.getHours();
	// var weekday = date.getDay();
	// console.log(ImageCaptures);

	// testing purposes
	var hour = 10;
	var weekday = 6;

	// diff the images
    var diffPath = createImageDir(config.userID, config.name, config.viewport, 'diffs', hour, weekday, date.getTime(), config._id);
    
    var deferred = Q.defer();

    var options = {
        highlightColor: 'yellow', // optional. Defaults to red
        file: diffPath // required
    };

    if (ImageCaptures.lastImageCapture === null) {
    	return deferred.resolve(null);
    }
	
	gm.compare(ImageCaptures.lastImageCapture.imgURL, ImageCaptures.newImageCapture.imgURL, options, function (err, isEqual, equality, raw) {    
	    if (err) {
	    	return deferred.reject(err);
	    }
        // console.log('The images are equal: %s', isEqual);
        // console.log('Actual equality: %d', equality);
        // console.log('Raw output was: %j', raw);    
	        
      	var output = {
		    percent: equality,
		    file: options.file,
		    config: config,
		    newImg: ImageCaptures.newImageCapture._id,
		    lastImg: ImageCaptures.lastImageCapture._id
		};
	    
	    return deferred.resolve(output);
	});

	return deferred.promise; 
};

function saveDiffImage(output) {
	if (output === null)
		return;

	// temp image object to be save to database
	var diffImage = {
		diffImgURL: output.file,
		diffPercent: output.percent,
		websiteUrl: output.config.URL,
		viewport: output.config.viewport,
		userID: output.config.userID,
		testName: output.config.name,
		compareFromID: output.lastImg,
		compareToID: output.newImg
	};

	return imageDiff.create(diffImage).then(function(img) {
		var diffS3Path = output.file.slice(2);
		var diffImgPath = path.join(__dirname, '../../../../' + diffS3Path);
		return saveToAWS(diffImgPath, diffS3Path);
	});
}

function createImageDir(userID, configName, viewport, imgType, hour, day, time, configID) {
	// tmp/userID/configName/viewport/imgType/hour_weekday_date.now() + .png
	var path = './tmp/' + userID + '/' + configName + '/' + viewport + '/' + imgType;

	mkdirp(path, function (err) {
	    if (err) console.error(err);
	});

	path += '/' + configID + '_' + hour + '_' + day + '_' + time +'.jpg';

	return path;
}

function saveToAWS(filepath, S3Path) {
	// save file to AWS
	var deferred = Q.defer();
	var imgPath = path.join(__dirname, '../../../../' + filepath);
    fs.readFile(filepath, function (err, data) {
        if (err) { 
        	return deferred.reject(err); 
        }

		var params = {
			Key: S3Path, 
			Body: data
		};

		s3.createBucket(function(err, data) {
			if (err) {
				return deferred.reject(err);
			}

		  	s3.upload(params, function(err, data) {
			    if (err) {
			      	return deferred.reject(err);
			    } else {
			    	return deferred.resolve(data);
			    } 
		  	});
		});
    });

    return deferred.promise; 
}