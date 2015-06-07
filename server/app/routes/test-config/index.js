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
  cronTime: '10 * * * * *',  // runs every hour
  onTick: function() {
    var date = new Date();
    var hour = date.getHours();
    var weekday = date.getDay()
    console.log('interval is running...')

    // searches TestConfig model and retrieve URL objects
    testConfig.findAllURLs(11, 5).then(function(data) {
		data.forEach(function(config) {

			var path = './temp_images/' + config._id + date + '.png'

			nightmare
				.viewport(1024, 768)
				.goto(config.URL)
				.screenshot(path)
				.use(function() {
					console.log('finished taking screenshot')

					var newImage = {
						websiteURL: config.URL,
						viewport: '1024, 768',
						imgURL: path,
						userID: config.user
					}

					imageCapture
						.create(newImage, function(err, newImg) {
							console.log('new image saved')
						})

					imageCapture
						.searchForLastSaved(config.URL, '1024, 768')
						.then(function(lastImg) {
							return lastImg[0].imgURL;
						})
						.then(function(lastImg) {
							compareUrls(newImage.imgURL, lastImg);
						});
				})
		})

		nightmare.run(function() {
			console.log('finished all')
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
    gm.compare(lastImg, newImg, options, function (err, isEqual, equality, raw) {
    
    if (err) throw err;
        console.log('The images are equal: %s', isEqual);
        console.log('Actual equality: %d', equality);
        console.log('Raw output was: %j', raw);
    });
};

intervalJob.start();




		























