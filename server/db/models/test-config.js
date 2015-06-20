'use strict';
var mongoose = require('mongoose');
var imageCapture = mongoose.model('ImageCapture');
var imageDiff = mongoose.model('ImageDiff');
var utilities = require('../utilities');
var Q = require('q');
var chalk = require('chalk');

var schema = new mongoose.Schema({
    name: {
        type: String
    },
    URL: {
        type: String
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
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    teamID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team'
    }
});

schema.methods.getDiffsByDate = function(date, name) {
    var query = {
        captureTime: date,
        userID: this.userID
    };

    if (name !== null) query.testName = name;
    
    return mongoose.model('ImageDiff')
            .find(query)
            .exec();
};

schema.statics.getDiffsByUrl = function(url, name, userID) {
    var query = {
        websiteUrl: url,
        userID: userID
    };

    if (name !== null) query.testName = name;

    console.log(query);

    return mongoose.model('ImageDiff')
            .find(query)
            .exec();
};

schema.methods.getDiffsByViewport = function(viewport, name, userID) {
    var query = {
        viewport: viewport,
        userID: userID
    };

    if (name !== null) query.testName = name;

    return mongoose.model('ImageDiff')
            .find(query)
            .exec();
};

// returns an array of all URLs that meet hour + day criteria
schema.statics.findAllScheduledTests = function(hour, day) {
    return this.find({
                dayFrequency: day,
                hourFrequency: hour
            }).exec();
};

schema.statics.runTestConfig = function(nightmare, config, date) {
    var deferred = Q.defer();
    var snapshotPath = utilities.createImageDir(config.userID, config.name, config.viewport, 'snapshots', date.getHours(), date.getDay(), date.getTime(), config._id);
    
    // use nightmare to take a screenshot
    nightmare
        .viewport(config.viewportWidth, config.viewportHeight)
        .goto(config.URL)   
        .wait() 
        .screenshot(snapshotPath)
        .use(function() {
            console.log(chalk.cyan('Starting testConfig job - ' + config._id));
            console.log(chalk.green('Screenshot created...'));
            imageCapture.saveImageCapture(config, snapshotPath)
            .then(function(imageCaptures) {
                console.log(chalk.green('New imageCapture document saved...'));
                return imageDiff.createDiff(config, imageCaptures, date);
            }).then(function(output) {
                if (output) {
                    return imageDiff.saveImageDiff(output);
                } else {
                    console.log(chalk.yellow('No previous snapshot found'));
                    return null;
                }
            }).then(function(output) {
                if (output)
                    console.log(chalk.green('New imageDiff screenshot and document saved...'));
                console.log(chalk.cyan('Finished testConfig job - ' + config._id));

                return deferred.resolve(output);
            }).then(null, function(err) {
                deferred.reject(err);
            });
        });

    return deferred.promise;
};

schema.virtual('viewportWidth').get(function () {
    return parseInt(this.viewport.split('x')[0]);
});

schema.virtual('viewportHeight').get(function () {
    return parseInt(this.viewport.split('x')[1]);
});

mongoose.model('TestConfig', schema);