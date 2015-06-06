'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    captureTime: { 
        type: Date, 
        default: Date.now
    },
    websiteUrl: {
        type: String
    },
    viewport: {
        type: String
    },
    imgPath: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }
});

mongoose.model('WebpageCapture', schema);



















