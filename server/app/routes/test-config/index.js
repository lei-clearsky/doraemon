'use strict';
process.env.AWS_ACCESS_KEY_ID='AKIAI3KBBFBL6XN3VMJA';
process.env.AWS_SECRET_ACCESS_KEY='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';

var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose'),
	UserModel = mongoose.model('User');
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

	var params = {Bucket: 'capstone-doraemon', Key: 'myKey'};
	var file = fs.createWriteStream(path.join(__dirname,'/../../../../public/file.jpg'));
	s3.getObject(params).createReadStream().pipe(file);

	var imgStream = s3.getObject(params).createReadStream();
	imgStream.pipe(res);

});

router.get('/:id', function (req, res, next) {
    UserModel.findById(req.params.id, function (err, user) {
    	if (err) return next(err);
    	res.json(user);
    });
});

router.post('/', function (req, res, next) {
	UserModel.create(req.body, function (err, user) {
		if (err) return next(err);
		// s3
		var imgPath = path.join(__dirname, '/test.png');
		
        
        fs.readFile(imgPath, function (err, data) {
            if (err) { return next(err); }
			var params = {Key: 'test3', Body: data};
			// console.log('xky', s3.createBucket.toString());
			s3.createBucket(function(err, data) {
				// console.log('error?: ', err);
				if (err) return next(err);
			  s3.upload(params, function(err, data) {
			    if (err) {
			      console.log("Error uploading data: ", err);
			      next(err);
			    } else {
			      console.log("Successfully uploaded data to myBucket/myKey");
			      res.json(user);
			    }
			  });
			});
        });

		// end s3

		
	});
});


















