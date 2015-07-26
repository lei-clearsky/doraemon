'use strict';
var mongoose = require('mongoose');
var utilities = require('../utilities');

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
    darkenImgURL: {
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

schema.statics.searchForLastSaved = function(url, userID, viewport, testConfigID) {
    return this.findOne({ 
                websiteURL: url,
                userID: userID,
                viewport: viewport,
                testConfigID: testConfigID
            }).sort({captureTime: 'desc'}).exec(function(err, docs) {
                if (err) {
                    return err;
                }

                return docs;
            });
};

schema.statics.saveImageCapture = function(config, snapshotPath) {
    var lastImageCapture;
    // searches for last screenshot taken
    return this.searchForLastSaved(config.URL, config.userID, config.viewport, config._id).then(function(lastImg) {
            lastImageCapture = lastImg;
            return utilities.darkenImg(snapshotPath);
        }).then(function(darkenSnapshotPath) {
            // creating temporary object to be stored in database
            var newImage = {
                websiteURL: config.URL,
                viewport: config.viewport,  
                imgURL: snapshotPath,
                darkenImgURL: darkenSnapshotPath,
                userID: config.userID,
                testConfigID: config._id,
                testName: config.name
            };

            return mongoose.model('ImageCapture').create(newImage);
        }).then(function(newImg) {
            return { newImageCapture: newImg, lastImageCapture: lastImageCapture };
        }).then(null, function(err) {
            return err;
        });
};

mongoose.model('ImageCapture', schema);
