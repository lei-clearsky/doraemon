'use strict';
var mongoose = require('mongoose');
var imageCapture = mongoose.model('ImageCapture');
var imageDiff = mongoose.model('ImageDiff');
var utilities = require('../utilities');
var path = require('path');
var roboto = require('roboto');

var Q = require('q');
var chalk = require('chalk');

var schema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        require: true
    },
    URL: {
        type: String,
        index: true,
        require: true
    },
    devURL: {
        type: String
    },
    rootURL: {
        type: String
    },
    threshold: {
        type: Number,
        default: 10
    },
    viewport: {
        type: String,
        index: true,
        require: true
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
        require: true
    },
    teamID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team'
    },
    enabled: {
        type: Boolean,
        default: false
    }
});

schema.index({ userID: 1, name: 1, URL: 1, viewport: 1 }, { unique: true })


schema.statics.getViewportsForURL = function(userID, testName, URL) {
    var query = {
        name: testName,
        userID: userID,
        URL: URL 
    };
    return mongoose.model('TestConfig')
        .find(query)
        .distinct('viewport', function(err, results) {
            return results;
        })
        .exec();
};


schema.statics.getURLsForTest = function(userID, testName) {
    var query = {
        name: testName,
        userID: userID
    };
    return mongoose.model('TestConfig')
        .find(query)
        .distinct('URL', function(err, results) {
            return results;
        })
        .exec();
};

schema.statics.getTestNamesForUser = function(userID) {
    var query = {
        userID: userID
    };
    return mongoose.model('TestConfig')
        .find(query)
        .distinct('name', function(err, results) {
            return results;
        })
        .exec();
};


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

schema.statics.crawlURL = function(config) {
     var crawlObj = {
         startUrls: [config.startURL],
         maxDepth: config.maxDepth,
         constrainToRootDomains: true
     };

     if (config.blacklist) {
         crawlObj.blacklist = [config.blacklist];
     };
     if (config.whitelist) {
         crawlObj.whitelist = [config.whitelist];
     };

     var crawler = new roboto.Crawler(crawlObj);

     crawler.parseField('url', function(response, $){
        return response.url;
     });

     crawler.on('item', function(item) {
        config.viewport.forEach(function(viewport) {
            mongoose.model('TestConfig')
                .create({
                    name: config.testName,
                    URL: item.url,
                    rootURL: config.startURL,
                    threshold: config.threshold,
                    viewport: viewport,
                    dayFrequency: config.dayFrequency,
                    hourFrequency: config.hourFrequency,
                    userID: config.userID
                });
        });      
    });

     crawler.crawl();    
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