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


// returns an array of all URLs that meet hour + day criteria
schema.statics.findAllScheduledTests = function(hour, day) {
    return this.find({ 
                dayFrequency: day,
                hourFrequency: hour
            }).exec()
};

schema.virtual('viewport.width').get(function () {
    return parseInt(this.viewport.split('x')[0]);
});

schema.virtual('viewport.height').get(function () {
    return parseInt(this.viewport.split('x')[1]);
});

mongoose.model('TestConfig', schema);