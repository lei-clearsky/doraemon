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
        required: true
    },
    URL: {
        type: String,
        index: true,
        required: true
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
        required: true,
        index: true
    },
    teamID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team'
    },
    inTestCase: {
        type: Boolean,
        default: false
    },
    steps: {
        type: Array
    },
    testStepIndex: {
        type: Number,
        index: true,
        default: -1
    },
    enabled: {
        type: Boolean,
        default: false
    }
});

schema.index({userID: 1, name: 1, URL: 1, viewport: 1, testStepIndex: 1 }, { unique: true });

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

schema.statics.getTestNameRootURL = function(userID, testName) {
    var query = {
        userID: userID,
        name: testName
    };
    return mongoose.model('TestConfig')
        .findOne(query)
        .select({name: 1, rootURL: 1})
        .exec();
};

schema.statics.getSharedConfigs = function(userID, testName, URL) {
    var query = {
        name: testName,
        userID: userID,
        URL: URL 
    };
    return mongoose.model('TestConfig')
        .findOne(query)
        .select({threshold: 1, dayFrequency: 1, hourFrequency: 1, enabled: 1, _id: -1})
        .exec();
};

schema.statics.getDiffsByDate = function(date, userID, name) {
    var query = {
        captureTime: date,
        userID: userID
    };

    if (name !== undefined) query.testName = name;
    
    return mongoose.model('ImageDiff')
            .find(query)
            .exec();
};

schema.statics.getDiffsByUrl = function(url, userID, name) {
    var query = {
        websiteUrl: url,
        userID: userID
    };

    if (name !== undefined) query.testName = name;

    return mongoose.model('ImageDiff')
            .find(query)
            .exec();
};

schema.statics.getDiffsByViewport = function(viewport, userID, name) {
    var query = {
        viewport: viewport,
        userID: userID
    };

    if (name !== undefined) query.testName = name;

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
    var deferred = Q.defer();

    var crawlObj = {
        startUrls: [config.startURL],
        maxDepth: config.maxDepth,
        constrainToRootDomains: true,
        logLevel: 'error'
    };

    function parseList(array) {
        return array.split(',').map(function(str) {
            return str.trim();
        });
    };

    if (config.blacklist) {
        crawlObj.blacklist = parseList(config.blacklist);
    };

    if (config.whitelist) {
        crawlObj.whitelist = parseList(config.whitelist);
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

    crawler.once('finish', function(item){
         deferred.resolve(crawler.stats.pagesCrawled);
    });

    crawler.crawl();    
    return deferred.promise;
}; 

schema.methods.runTestConfig = function(nightmare, date) {
    var deferred = Q.defer();
    var snapshotPath;

    if (this.inTestCase) {
        snapshotPath = utilities.createImageDir(this.userID, this.name, this.viewport, 'snapshots', date.getHours(), date.getDay(), date.getTime(), this._id, this.testStepIndex);
    } else {
        snapshotPath = utilities.createImageDir(this.userID, this.name, this.viewport, 'snapshots', date.getHours(), date.getDay(), date.getTime(), this._id);
    }

    var that = this;
    var passStuff = function() {
        that.processImages(snapshotPath, date, deferred);
    };

    // use nightmare to take a screenshot
    if(this.inTestCase) {
        eval(that.parseSteps());
    } else {
        nightmare
            .viewport(that.viewportWidth, that.viewportHeight)
            .goto(that.URL)   
            .wait() 
            .screenshot(snapshotPath)
            .use(passStuff);
    };

    return deferred.promise;
};

schema.methods.parseSteps = function() {
    var result = 'nightmare.viewport(that.viewportWidth, that.viewportHeight).goto(that.URL).wait()';

    for (var i = 0; i < this.steps.length; i++) {
        if (this.steps[i].stepCode === 3) {
            result += '.click("' + this.steps[i].path.join(' > ') + '").wait()';
        } else if (this.steps[i].stepCode === 4) {
            result += '.type("' + this.steps[i].path.join(' > ') + '", "' + this.steps[i].value + '").wait()';
        }

    };

    result += '.screenshot(snapshotPath).use(passStuff);';
    return result;
};

schema.methods.processImages = function(snapshotPath, date, deferred) {
    var that = this;
    console.log(chalk.cyan('Starting testConfig job - ' + that._id));

    utilities.saveToAWS(snapshotPath).then(function(output) {
        console.log(chalk.green('Screenshot saved to AWS...'));
        return imageCapture.saveImageCapture(that, snapshotPath);
    }).then(function(imageCaptures) {
        console.log(chalk.green('New imageCapture document saved...'));
        return imageDiff.createDiff(that, imageCaptures, date);
    }).then(function(output) {
        if (output) {
            var newImageDiff;
            console.log(chalk.green('Diff Screenshot created...'));
            return imageDiff.saveImageDiff(output).then(function(output) {
                newImageDiff = output;
                console.log(chalk.green('New imageDiff document saved...'));
                return utilities.saveToAWS(newImageDiff.diffImgURL);
            }).then(function(output) {
                console.log(chalk.green('Diff Screenshot saved to AWS...'));
                return utilities.saveToAWS(newImageDiff.diffImgThumbnail);
            }).then(function(output) {
                console.log(chalk.green('Diff Thumbnail saved to AWS...'));
                return utilities.removeImg(newImageDiff.diffImgURL);
            }).then(function(output) {
                console.log(chalk.green('Diff Screenshot removed locally...'));
                return utilities.removeImg(newImageDiff.diffImgThumbnail);
            }).then(function(output) {
                console.log(chalk.green('Diff Thumbnail removed locally...'));
                return null;
            });
        } else {
            console.log(chalk.yellow('No previous snapshot found'));
            return null;
        }
    }).then(function(output) {
        console.log(chalk.cyan('Finished testConfig job - ' + that._id));
        return deferred.resolve(output);
    }).then(null, function(err) {
        deferred.reject(err);
    });
};

schema.virtual('viewportWidth').get(function () {
    return parseInt(this.viewport.split('x')[0]);
});

schema.virtual('viewportHeight').get(function () {
    return parseInt(this.viewport.split('x')[1]);
});

mongoose.model('TestConfig', schema);