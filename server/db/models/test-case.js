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
        type: String
    },
    devURL: {
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
        stepCode: Number,
        eventText: String,
        path: Array,
        value: String
    }],
    formCompleted: {
        type: Boolean
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    teamID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team'
    }
});

schema.methods.runTestCase = function(nightmare, testCase, date) {

};

schema.methods.getTestConfigs = function() {
    return testConfig.find({
        '_id': { $in: this.testConfigs }
    }).exec();
};

/* 
Splits the list of steps captured by the recorder into seperate lists that end with a snapshot.
StepCode for Snapshot = 2
If allSteps = [{stepCode: 1}, {stepCode: 2}, {stepCode: 3}, {stepCode: 3}, {stepCode: 2}, {stepCode: 4}, {stepCode: 2}, {stepCode: 4}]
Then splittedSteps = [
    [{stepCode: 1}],
    [{stepCode: 1}, {stepCode: 3}, {stepCode: 3}],
    [{stepCode: 1}, {stepCode: 3}, {stepCode: 3}, {stepCode: 4}]
];
*/
schema.statics.splitStepsBySnapshot = function(allSteps) {
    
    var splittedSteps = [];
    var steps = [];

    for (var i = 0; i < allSteps.length; i++) {
        if (allSteps[i].stepCode === 2) {
            if (splittedSteps.length > 0) {
                steps = splittedSteps[splittedSteps.length - 1].concat(steps);
            }

            splittedSteps.push(steps);
            steps = new Array();
        } else {
            steps.push(allSteps[i]);
        }
    }

    return splittedSteps;
};

schema.virtual('viewportWidth').get(function () {
    return parseInt(this.viewport.split('x')[0]);
});

schema.virtual('viewportHeight').get(function () {
    return parseInt(this.viewport.split('x')[1]);
});

mongoose.model('TestCase', schema);