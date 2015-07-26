'use strict';
var AWSkeys = require('./AWSkeys'); 
process.env.AWS_ACCESS_KEY_ID = AWSkeys.accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = AWSkeys.secretAccessKey;

var Q = require('q');
var AWS = require('aws-sdk'); 
var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}});
AWS.config.region = AWSkeys.region; 

var router = require('express').Router();
var mongoose = require('mongoose');
var	testConfig = mongoose.model('TestConfig');
var cronJob = require('../cronJob');
module.exports = router;

// cronJob.run();

router.get('/test/:id', function(req,res,next){
	testConfig.getTestNamesForUser(req.params.id)
		.then(function(testNames) {
			var promises = [];			
			testNames.map(function(name){
				promises.push(testConfig.getTestNameRootURL(req.params.id, name)
					.then(function(urls){		
						return {testName: urls.name, rootURL: urls.rootURL}
					})
				);
			});
			return Q.all(promises);
		}).then(function(obj){
			res.json(obj)
		})
})


router.get('/getTests/:id', function (req, res, next) {
	testConfig.getTestNamesForUser(req.params.id)
		.then(function(testNames) {
			var promises = [];			
			testNames.map(function(name){
				promises.push(testConfig.getURLsForTest(req.params.id, name)
					.then(function(urls){						
						return {testName: name, URLs: urls}
					})
				);
			});
			return Q.all(promises);
		}).then(function(testNames) {
			var promises = [];			
			testNames.map(function(test){
				promises.push(testConfig.getTestNameRootURL(req.params.id, test.testName)
					.then(function(config){	
						return {testName: config.name, rootURL: config.rootURL, URLs: test.URLs}
					})
				);
			});
			return Q.all(promises);
	 	}).then(function(tests){	 		
	 		var promises = [];	 		
	 		tests.map(function(test){	 			
	 			var promiseURLs = [];	 			
	 			test.URLs.forEach(function(url){	 					 				
	 				promiseURLs.push(testConfig.getViewportsForURL(req.params.id, test.testName, url)
	 					.then(function(vp) {
	 						return testConfig.getSharedConfigs(req.params.id, test.testName, url)
	 							.then(function(shared){
	 								return { url: url, vp: vp, enabled: shared.enabled, hourFrequency: shared.hourFrequency, dayFrequency: shared.dayFrequency, threshold: shared.threshold}
	 							}) 
	 					})
 					)
	 			})
	 			promises.push(Q.all(promiseURLs)
	 				.then(function(URLs){
						return {testName: test.testName, rootURL: test.rootURL, URLs: URLs}
 					 })
 				)
	 		})	 
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

router.post('/bulkcreate', function (req, res, next) {

	testConfig.crawlURL(req.body).then(function(data) {
		res.json(data);
	}).then(null, function(err) {
		next(err);
	}); 
});
