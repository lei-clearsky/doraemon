'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    teamName: { 
        type: String, 
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }]
});

mongoose.model('Team', schema);