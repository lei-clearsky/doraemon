'use strict';
var Nightmare = require('nightmare');
var nightmare = new Nightmare();

var CronJob = require('cron').CronJob;
var gm = require('gm');
var Q = require('q');
var mkdirp = require('mkdirp');

var router = require('express').Router();
module.exports = router;

var mongoose = require('mongoose');
var	testConfig = mongoose.model('TestConfig');
var	imageCapture = mongoose.model('ImageCapture');
var imageDiff = mongoose.model('ImageDiff');

var path = require('path');

var	AWS = require('aws-sdk');
// var configPath = path.join(__dirname, '/config.json');

var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}}),
    fs = require('fs');
AWS.config.region = 'us-standard';

router.get('/', function (req, res, next) {
	// UserModel.find({}, function (err, users) {
	// 	if (err) return next(err);
	// 	res.json(users);
	// });

	// var allKeys = [];
	// function listAllKeys(marker, cb) {
	// 	s3.listObjects({Bucket:'capstone-doraemon', Marker: marker}, function(err, data) {
	// 		allKeys.push(data.Contents);

	// 		if (data.IsTruncated)
	// 			listAllKeys(data.Contents.slice(-1)[0].key, cb);
	// 		else
	// 			cb();
	// 	});
	// }

	// s3.listObjects({Bucket:'capstone-doraemon'}, function(err, data) {
	// 	if (err) 
	// 		console.log(err, err.stack);
	// 	else {
	// 		var allImages = data.Contents;
	// 		async.map(allImages, function(img, done){
	// 			var params = {Bucket: 'capstone-doraemon', Key: img.Key};
	// 			s3.getObject(params, done);
	// 			// var imgStream = s3.getObject(params).createReadStream();
	// 			// imgStream.pipe(res);
	// 		}, function(err, allData) {
	// 			if (err) 
	// 				return console.log(err);
	// 			res.json(allData);
	// 			console.log(allData);
	// 		});
	// 	}
	// });

	var params = {Bucket: 'capstone-doraemon', Key: 'myKey'};
	// var file = fs.createWriteStream(path.join(__dirname,'/../../../../public/file.jpg'));
	// s3.getObject(params).createReadStream().pipe(file);

	var imgStream = s3.getObject(params).createReadStream();
	imgStream.pipe(res);

});

router.get('/:id', function (req, res, next) {
    testConfig.findById(req.params.id, function (err, user) {
    	if (err) return next(err);
    	res.json(user);
    });
});

router.post('/', function (req, res, next) {
	testConfig.create(req.body, function (err, user) {
		if (err) return next(err);
		var imgPath = path.join(__dirname, '/test.png');
	
		res.json(user)

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
    testConfig.findAllURLs(1, 6).then(function(configs) {
		configs.forEach(function(config) {
			takeSnapshotAndCreateDiff(config, config.viewport, date);
		});

		nightmare.run(function() {
			console.log('finished with all');
		});
	}).then(null, function(error) {
       	throw(error);
    });
  },
  start: false
});

intervalJob.start();

function takeSnapshotAndCreateDiff(config, viewport, date) {
	// var hour = date.getHours();
	// var weekday = date.getDay();

	// testing purposes
	var hour = 1;
	var weekday = 6;

	var snapshotPath = createImageDir(config.user, config._id, viewport, 'snapshots', hour, weekday, date.getTime());

	var viewportObj = { 
		width: parseInt(viewport.split('x')[0]),
		height: parseInt(viewport.split('x')[1])
	};

	// use nightmare to take a screenshot
	nightmare
		.viewport(viewportObj.width, viewportObj.height)
		.goto(config.URL)	
		.wait()	
		.screenshot(snapshotPath)
		.use(function() {
			console.log('screenshot completed...');
			console.log('saving screenshot to database...');

			// searches for last screenshot taken
			imageCapture
				.searchForLastSaved(config.URL, viewport) 
				.then(function(lastImg) {

					// creating temporary object to be stored in database
					var newImage = {
						websiteURL: config.URL,
						viewport: viewport,	
						imgURL: snapshotPath,
						userID: config.user
					}

					var deferred = Q.defer();

					// creates new image in database
					imageCapture
						.create(newImage, function(err, newImg) {
							if (err) throw err;
							console.log('new imageCapture document saved...');

							// diff the images
							console.log('diffing the images...');

						    var diffPath = createImageDir(config.user, config._id, viewport, 'diffs', hour, weekday, date.getTime());

						    var options = {
						        highlightColor: 'yellow', // optional. Defaults to red
						        file: diffPath // required
						    };

						    if (lastImg.length > 0) {
				    			gm.compare(lastImg[0].imgURL, newImg.imgURL, options, function (err, isEqual, equality, raw) {    
				    			    if (err) throw err;
				    		        // console.log('The images are equal: %s', isEqual);
				    		        // console.log('Actual equality: %d', equality);
				    		        // console.log('Raw output was: %j', raw);    
				    			        
				    	          	var output = {
				    				    percent: equality,
				    				    file: options.file
				    				};

				    				console.log('diff output...', output);
				    			    deferred.resolve(output);
				    			});
						    } else {
						    	console.log('No previous snapshot created');
						    	deferred.resolve(null);
						    }
							
					});

					return deferred.promise; 
				}).then(function(output) {
					if (!output)
						return;

					console.log('saving diff image to database...')
			
					// temp image object to be save to database
					var diffImage = {
						diffImgURL: output.file,
						diffPercent: output.percent,
						websiteUrl: config.URL,
						viewport: viewport
					}

					imageDiff.create(diffImage, function(err, img) {
						if (err) throw err;
						console.log('imageDiff document saved');
					})

				}).then(null, function(error) {
					throw(error);
				});
		});
};

function createImageDir(userID, configID, viewport, imgType, hour, day, time) {
	// temp_images/userID/configID/viewport/imgType/hour_weekday_date.now() + .png
	var path = './temp_images/' + userID + '/' + configID + '/' + viewport + '/' + imgType;

	mkdirp(path, function (err) {
	    if (err) console.error(err);
	});

	path += '/' + hour + '_' + day + '_' + time +'.png';

	return path;
}