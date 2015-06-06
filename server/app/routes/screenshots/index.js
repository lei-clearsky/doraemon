'use strict';
process.env.AWS_ACCESS_KEY_ID='AKIAI3KBBFBL6XN3VMJA';
process.env.AWS_SECRET_ACCESS_KEY='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';

var router = require('express').Router();
module.exports = router;
var	AWS = require('aws-sdk'),
	s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}}),
    fs = require('fs');
AWS.config.region = 'us-standard';

router.get('/:id', function (req, res, next) {

	var params = {Bucket: 'capstone-doraemon', Key: req.params.id};
	var imgStream = s3.getObject(params).createReadStream();
	imgStream.pipe(res);

});


















