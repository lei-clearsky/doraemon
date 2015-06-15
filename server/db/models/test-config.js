'use strict';
var mongoose = require('mongoose');

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
    }

    if (name !== null) query.testName = name;
    
    return mongoose.model('ImageDiff')
            .find(query)
            .exec();
};

schema.statics.getDiffsByUrl = function(url, name, userID) {
    var query = {
        websiteUrl: url,
        userID: userID
    }
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
    }

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
            }).exec()
};

schema.virtual('viewportWidth').get(function () {
    return parseInt(this.viewport.split('x')[0]);;
});

schema.virtual('viewportHeight').get(function () {
    return parseInt(this.viewport.split('x')[1]);
});

mongoose.model('TestConfig', schema);











