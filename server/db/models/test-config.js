'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    config: [{
        url: String,
        viewport: {
            type: String
        },
        frequency: {
            type: String
        }
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

mongoose.model('Test-Config', schema);