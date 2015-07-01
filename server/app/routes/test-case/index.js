'use strict';
var AWSkeys = require('../test-config/AWSkeys'); 
process.env.AWS_ACCESS_KEY_ID = AWSkeys.accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = AWSkeys.secretAccessKey;

var Nightmare = require('nightmare');
var nightmare = new Nightmare();

var Q = require('q');
var chalk = require('chalk');

var AWS = require('aws-sdk'); 
var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}});
AWS.config.region = AWSkeys.region; 

var router = require('express').Router();
var mongoose = require('mongoose');
var	TestCase = mongoose.model('TestCase');
var TestConfig = mongoose.model('TestConfig');
module.exports = router;

router.get('/', function (req, res, next) {
	TestCase.find({},function (err, foundTestCases) {
    	if (err) return next(err);
    	res.json(foundTestCases);
    });
});

router.get('/:id', function (req, res, next) {
    TestCase.findById(req.params.id, function (err, foundTestCase) {
    	if (err) return next(err);
    	res.json(foundTestCase);
    });
});

/*
Route that finished testCases are created. TestConfigs are created first, which each hold seperate steps.
The new testCase document will have an array of testConfigIDs 
*/
router.post('/', function (req, res, next) {
    
    var testCaseObj = req.body,
        splittedSteps = TestCase.splitStepsBySnapshot(testCaseObj.steps),
        testConfigIDs = [],
        promises = [];

    splittedSteps.forEach(function(steps) {
        var testConfigObj = {
            name: testCaseObj.name,
            URL: testCaseObj.URL,
            devURL: testCaseObj.devURL,
            threshold: testCaseObj.threshold,
            viewport: testCaseObj.viewport,
            dayFrequency: testCaseObj.dayFrequency,
            hourFrequency: testCaseObj.hourFrequency,
            steps: steps,
            userID: testCaseObj.userID,
            inTestCase: true
        };

        var promise = TestConfig.create(testConfigObj, function (err, newTestConfig) {
            if (err) return next(err);
            return newTestConfig;
        });

        promises.push(promise);
    });

    Q.all(promises).then(function(testConfigs) {
        testCaseObj.testConfigs = [];

        testConfigs.forEach(function(testConfig) {
            testCaseObj.testConfigs.push(testConfig._id);
        });

        TestCase.create(testCaseObj, function (err, newTestCase) {
            if (err) return next(err);
            res.json(newTestCase);
        });
    }); 
});

/* 
    Route used to delete temporary testCase after creating finished testCase in a new document.  
*/ 
router.delete('/:id', function (req, res, next) {
    TestCase.findById(req.params.id).remove(function (err, deletedTestCase) {
        if (err) return next(err);
        res.json(deletedTestCase);
    });
});

/* 
    Route makes temporary testCase with formCompleted set to false.
    TestCase is finished at website by opening a new tab at http://localhost:1337/admin/test-case/:newTestCaseID 
*/ 
router.post('/extension', function (req, res, next) {
	var testCaseObj = {
		URL: req.body.steps[0].value,
		userID: req.body.userID,
		steps: req.body.steps,
		formCompleted: false
	};

	TestCase.create(testCaseObj, function (err, newTestCase) {
		if (err) return next(err);
		res.json(newTestCase);
	});
});