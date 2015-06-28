'use strict';
var mongoose = require('mongoose');
var testConfig = mongoose.model('TestConfig');
var utilities = require('../utilities');
var Q = require('q');

var schema = new mongoose.Schema({
    name: {
        type: String
    },
    URL: {
        type: String,
        required: true
    },
    devURL: {
        type: String
    },
    rootURL: {
        type: String
    },
    threshold: {
        type: Number
    },
    viewport: {
        type: String
    },
    dayFrequency: [{
        type: Number
    }],
    hourFrequency: [{
        type: Number
    }],
    testConfigs: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'TestConfig'
    }],
    steps: [{
        type: Object
    }],
    formCompleted: {
        type: Boolean
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    teamID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team'
    }
});

schema.method.runTestCase = function(nightmare, testCase, date) {

};

schema.method.getTestConfigs = function() {
    return testConfig.find({
        '_id': { $in: this.testConfigs }
    }).exec();
};

mongoose.model('TestCase', schema);