'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    URL: String,
    viewports: [{
        type: String
    }],
    dayFrequency: [{
        type: Number
    }],
    hourFrequency: [{
        type: Number
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    team: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team'
    }
});


// returns an array of all URLs that meet hour + day criteria
schema.statics.findAllURLs = function(hour, day) {
    return this.find({ 
                dayFrequency: {'$in': [day]},
                hourFrequency: {'$in': [hour]}
            }).exec()
};




mongoose.model('TestConfig', schema);