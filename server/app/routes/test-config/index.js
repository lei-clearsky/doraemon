'use strict';
process.env.AWS_ACCESS_KEY_ID='AKIAI3KBBFBL6XN3VMJA';
process.env.AWS_SECRET_ACCESS_KEY='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';



var Nightmare = require('nightmare')
var nightmare = new Nightmare();

var CronJob = require('cron').CronJob;



var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose'),
	TestConfig = mongoose.model('TestConfig');

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
    TestConfig.findById(req.params.id, function (err, user) {
    	if (err) return next(err);
    	res.json(user);
    });
});

router.post('/', function (req, res, next) {
	TestConfig.create(req.body, function (err, user) {
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
  cronTime: '0 0 * * * *',  // runs every 5 seconds
  onTick: function() {
    var date = new Date();
    var hour = date.getHours();
    var weekday = date.getDay()
    console.log('interval is running...', current_hour, weekday)

    // searches TestConfig model and retrieve URL objects
    TestConfig.findAllURLs(hour, weekday).then(function(data) {
		data.forEach(function(config) {

			var path = './temp_images/' + config._id + date + '.png'

			nightmare
				.viewport(1024, 768)
				.goto(config.URL)
				.screenshot(path)
				.use(function() {
					console.log('finished taking screenshot')
				})
		})

		nightmare.run(function() {
			console.log('finished all')
		})
	})
  },
  start: false
});


//intervalJob.start();




		























