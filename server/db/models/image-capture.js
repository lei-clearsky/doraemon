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
    websiteURL: {
        type: String
    },
    viewport: {
        type: String
    },
    imgURL: {
        type: String
    },
    testName: {
        type: String
    },
    testConfigID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestConfig'
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }
});

schema.statics.searchForLastSaved = function(url, userID, viewport) {
    return this.findOne({ 
                websiteURL: url,
                userID: userID,
                viewport: viewport
            }).sort({captureTime: 'desc'}).exec(function(err, docs) {
                if (err) {
                    return err;
                }

                return docs;
            });
};

schema.statics.saveImageCapture = function(config, snapshotPath) {
    var snapshotS3Path = snapshotPath.slice(2);
    var diffS3Path, diffImgPath, lastImageCapture, newImageCapture;
    // searches for last screenshot taken
    return this
        .searchForLastSaved(config.URL, config.userID, config.viewport) 
        .then(function(lastImg) {

            // creating temporary object to be stored in database
            var newImage = {
                websiteURL: config.URL,
                viewport: config.viewport,  
                imgURL: snapshotPath,
                userID: config.userID,
                testConfigID: config._id,
                testName: config.name
            };

            lastImageCapture = lastImg;
            // creates new image in database
            return mongoose.model('ImageCapture').create(newImage);
        }).then(function(newImg) {
            newImageCapture = newImg;

            // save file to AWS
            var imgPath = path.join(__dirname, '../../../' + snapshotS3Path);

            return utilities.saveToAWS(imgPath, snapshotS3Path);
        }).then(function() {            
            return { newImageCapture: newImageCapture, lastImageCapture: lastImageCapture };
        }).then(null, function(err) {
            return err;
        });
};



mongoose.model('ImageCapture', schema);