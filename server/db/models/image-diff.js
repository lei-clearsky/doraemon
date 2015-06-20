'use strict';
var mongoose = require('mongoose');
var utilities = require('../utilities');
var Q = require('q');
var gm = require('gm');
var path = require('path');

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
    var diffPath = utilities.createImageDir(config.userID, config.name, config.viewport, 'diffs', date.getHours(), date.getDay(), date.getTime(), config._id);
    
    var deferred = Q.defer();

    var options = {
        highlightColor: 'yellow', // optional. Defaults to red
        file: diffPath // required
    };

    if (imageCaptures.lastImageCapture === null) {
        return deferred.resolve(null);
    }
    
    gm.compare(imageCaptures.lastImageCapture.imgURL, imageCaptures.newImageCapture.imgURL, options, function (err, isEqual, equality, raw) {    
        if (err) {
            return deferred.reject(err);
        }
        // console.log('The images are equal: %s', isEqual);
        // console.log('Actual equality: %d', equality);
        // console.log('Raw output was: %j', raw);    
            
        var output = {
            percent: equality,
            file: options.file,
            config: config,
            newImg: imageCaptures.newImageCapture._id,
            lastImg: imageCaptures.lastImageCapture._id
        };
        
        return deferred.resolve(output);
    });

    return deferred.promise; 
};

schema.statics.saveImageDiff = function(output) {
    if (output === null)
        return;

    // temp image object to be save to database
    var diffImage = {
        diffImgURL: output.file,
        diffPercent: output.percent,
        websiteUrl: output.config.URL,
        viewport: output.config.viewport,
        userID: output.config.userID,
        testName: output.config.name,
        testConfigID: output.config._id,
        compareFromID: output.lastImg,
        compareToID: output.newImg
    };

    return this.create(diffImage);
};

mongoose.model('ImageDiff', schema);