'use strict';
var mongoose = require('mongoose');
var utilities = require('../utilities');
var Q = require('q');
var gm = require('gm');
var path = require('path');
var fs = require('fs');

var schema = new mongoose.Schema({
    captureTime: { 
        type: Date, 
        default: Date.now
    },
    diffImgURL: {
        type: String
    },
    diffPercent: {
        type: Number
    },
    diffImgThumbnail: {
        type: String
    },
    threshold: {
        type: Number
    },
    websiteUrl: {
        type: String
    },
    viewport: {
        type: String
    },
    testName: {
        type: String
    },
    testConfigID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestConfig'
    },
    compareFromID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ImageCapture'
    },
    compareToID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ImageCapture'
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }
});

schema.statics.createDiff = function(config, imageCaptures, date) {
    if (imageCaptures.lastImageCapture === null) {
        return null;
    }

    var diffPath, diffThumbnailPath;

    if (config.inTestCase) {
        diffPath = utilities.createImageDir(config.userID, config.name, config.viewport, 'diffs', date.getHours(), date.getDay(), date.getTime(), config._id, config.testStepIndex);
        diffThumbnailPath = utilities.createImageDir(config.userID, config.name, config.viewport, 'diffsThumbnails', date.getHours(), date.getDay(), date.getTime(), config._id, config.testStepIndex);
    } else {
        diffPath = utilities.createImageDir(config.userID, config.name, config.viewport, 'diffs', date.getHours(), date.getDay(), date.getTime(), config._id);
        diffThumbnailPath = utilities.createImageDir(config.userID, config.name, config.viewport, 'diffsThumbnails', date.getHours(), date.getDay(), date.getTime(), config._id);
    }

    var output = {
        diffImgURL: diffPath,
        diffImgThumbnailURL: diffThumbnailPath,
        config: config,
        newImgID: imageCaptures.newImageCapture._id,
        lastImgID: imageCaptures.lastImageCapture._id
    };

    return mongoose.model('ImageDiff').useGMCompare(imageCaptures, diffPath).then(function(imageData) {
        output.percent = imageData.equality;
        return mongoose.model('ImageDiff').createThumbnail(diffPath, diffThumbnailPath);
    }).then(function() {
        return utilities.removeImg(imageCaptures.lastImageCapture.imgURL);
    }).then(function() {
        return output;
    }).then(null, function(err) {
        console.log(err);
        return err;
    }); 
};

schema.statics.useGMCompare = function(imageCaptures, diffPath) {
    var deferred = Q.defer();

    var options = {
        highlightColor: 'yellow', // optional. Defaults to red
        file: diffPath // required
    };


    if (imageCaptures.lastImageCapture === null) {
        return deferred.resolve(null);
    }

    gm.compare(imageCaptures.lastImageCapture.darkenImgURL, imageCaptures.newImageCapture.darkenImgURL, options, function (err, isEqual, equality, raw) {    

        if (err) {
            deferred.reject(err);
        }
         
        var imageData = {
            isEqual: isEqual,
            equality: equality,
            raw: raw
        }; 

        deferred.resolve(imageData);

    });

    return deferred.promise;
};

schema.statics.createThumbnail = function(diffPath, diffThumbnailPath) {
    var deferred = Q.defer();

    gm(diffPath)
        .resize(300)
        .write(diffThumbnailPath, function(err) {
            if(err) 
                deferred.reject(err);
            deferred.resolve();
        });

    return deferred.promise; 
};


schema.statics.saveImageDiff = function(output) {
    if (output === null)
        return;

    // temp image object to be save to database
    var diffImage = {
        diffImgURL: output.diffImgURL,
        diffImgThumbnail: output.diffImgThumbnailURL,
        diffPercent: output.percent,
        websiteUrl: output.config.URL,
        viewport: output.config.viewport,
        userID: output.config.userID,
        testName: output.config.name,
        testConfigID: output.config._id,
        compareFromID: output.lastImgID,
        compareToID: output.newImgID,
        threshold: output.config.threshold
    };

    return this.create(diffImage);
};



mongoose.model('ImageDiff', schema);