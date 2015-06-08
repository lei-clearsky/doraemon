'use strict';

var Nightmare = require('nightmare')
var nightmare = new Nightmare();

var CronJob = require('cron').CronJob;
var gm = require('gm');


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
		// s3
		var imgPath = path.join(__dirname, '/test.png');
		        
   //      fs.readFile(imgPath, function (err, data) {
   //          if (err) { return next(err); }
			// var params = {Key: 'test3', Body: data};
			// // console.log('xky', s3.createBucket.toString());
			// s3.createBucket(function(err, data) {
			// 	// console.log('error?: ', err);
			// 	if (err) return next(err);
			//   s3.upload(params, function(err, data) {
			//     if (err) {
			//       console.log("Error uploading data: ", err);
			//       next(err);
			//     } else {
			//       console.log("Successfully uploaded data to myBucket/myKey");
			//       res.json(user);
			//     }
			//   });
			// });
        // });

		// end s3
	
		res.json(user)

	});
});



var intervalJob = new CronJob({
  cronTime: '50 * * * * *',  // this is the timer
  onTick: function() {
    // retrieving information about the date to be used later
    var date = new Date();
    var hour = date.getHours();
    var weekday = date.getDay()

    console.log('process begins...')

    // searches TestConfig model and retrieve URL objects
    // currently useing 11, 5 as params for testing purposes
    testConfig.findAllURLs(1, 6).then(function(configs) {
		configs.forEach(function(config) {
			// define path to save images to
			var path = './temp_images/' + config._id + date + '.png'

			console.log('this is the config object', config)

			// use nightmare to take a screenshot
			nightmare
				.viewport(1024, 768)	// will need to use viewport in config object
				.goto(config.URL)	
				.wait()	
				.screenshot(path)
				.use(function() {
					console.log('screenshot completed...')
					console.log('saving screenshot to database...')

					// creating temporary object to be stored in database
					var newImage = {
						websiteURL: config.URL,
						viewport: '1024, 768',	// will need to use viewport in config object
						imgURL: path,
						userID: config.user
					}

					// creates new image in database
					imageCapture
						.create(newImage, function(err, newImg) {
							if (err) throw err;
							console.log('new image saved...')
						})

					// searches for last screenshot taken
					imageCapture
						.searchForLastSaved(config.URL, '1024, 768')  // will use viewport in config object
						.then(function(lastImg) {
							// diff the images
							console.log('diffing the image...')

						    var options = {
						        highlightColor: 'yellow', // optional. Defaults to red
						        file: './temp_images/diff.png' // required
						    };

							gm.compare(lastImg[0].imgURL, newImage.imgURL, options, function (err, isEqual, equality, raw) {    
							    if (err) throw err;
						        console.log('The images are equal: %s', isEqual);
						        console.log('Actual equality: %d', equality);
						        console.log('Raw output was: %j', raw);    
							        
					          	var output = {
								    percent: equality,
								    file: options.file
								}

								console.log('output...', output)
							    return output;
							});
							// };
						})
						.then(function(output) {
							console.log('saving diff image to database...')

							console.log('this is output', output)
					
							// temp image object to be save to database
							var diffImage = {
								    diffImgURL: output.file,
								    diffPercent: output.percent,
								    websiteUrl: config.URL,
								    viewport: '1024, 768'	// will use viewport in config
							}


							imageDiff
								.create(diffImage, function(err, img) {
									if (err) throw error;
									console.log('diff image saved')
								})
						})
				})
		})

		nightmare.run(function() {
			console.log('finished with all')
		})
	})
  },
  start: false
});

var compareUrls = function(newImg, lastImg) {   
    var options = {
        highlightColor: 'yellow', // optional. Defaults to red
        file: './temp_images/diff.png' // required
    };
    
    var output = {
    	percent: 0,
    	file: options.file
    }


    gm.compare(lastImg, newImg, options, function (err, isEqual, equality, raw) {    
	    if (err) throw err;
        console.log('The images are equal: %s', isEqual);
        console.log('Actual equality: %d', equality);
        console.log('Raw output was: %j', raw);    
        
        output.percent = equality;

        return 'output'
    });
};






intervalJob.start();




		























