'use strict';
var mongoose = require('mongoose');
var imageCapture = mongoose.model('ImageCapture');
var imageDiff = mongoose.model('ImageDiff');
var utilities = require('../utilities');
var path = require('path');

var Q = require('q');
var chalk = require('chalk');

var schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
        type: String,
        required: true
    },
    dayFrequency: [{
        type: Number
    }],
    hourFrequency: [{
        type: Number
    }],
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

schema.method.runTestConfig = function(nightmare, date) {
    var deferred = Q.defer();
    var snapshotPath = utilities.createImageDir(this.userID, this.name, this.viewport, 'snapshots', date.getHours(), date.getDay(), date.getTime(), this._id);

    // use nightmare to take a screenshot
    nightmare
        .viewport(this.viewportWidth, this.viewportHeight)
        .goto(this.URL)   
        .wait() 
        .screenshot(snapshotPath)
        .use(processImages);

    return deferred.promise;
};

schema.statics.processImages = function() {
    console.log(chalk.cyan('Starting testConfig job - ' + config._id));

    utilities.saveToAWS(snapshotPath).then(function(output) {
        console.log(chalk.green('Screenshot saved to AWS...'));
        return imageCapture.saveImageCapture(config, snapshotPath);
    }).then(function(imageCaptures) {
        console.log(chalk.green('New imageCapture document saved...'));
        return imageDiff.createDiff(config, imageCaptures, date);
    }).then(function(output) {
        if (output) {
            console.log(chalk.green('Diff Screenshot created...'));
            return imageDiff.saveImageDiff(output);
        } else {
            console.log(chalk.yellow('No previous snapshot found'));
            return null;
        }
    }).then(function(newImageDiff) {
        if (newImageDiff) {
            console.log(chalk.green('New imageDiff document saved...'));
            return utilities.saveToAWS(newImageDiff.diffImgURL).then(function(){
                return utilities.saveToAWS(newImageDiff.diffImgThumbnail);
            }).then(function() {
                utilities.removeImg(newImageDiff.diffImgURL);
                return utilities.removeImg(newImageDiff.diffImgThumbnail);
            });
        }
        
        return null;
    }).then(function(output) {
        if (output) {
            console.log(chalk.green('Diff Screenshot saved to AWS...'));
        }

        console.log(chalk.cyan('Finished testConfig job - ' + config._id));
        return deferred.resolve(output);
    }).then(null, function(err) {
        deferred.reject(err);
    });
}

schema.virtual('viewportWidth').get(function () {
    return parseInt(this.viewport.split('x')[0]);
});

schema.virtual('viewportHeight').get(function () {
    return parseInt(this.viewport.split('x')[1]);
});

mongoose.model('TestConfig', schema);