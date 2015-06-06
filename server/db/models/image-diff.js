'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    captureTime: { 
        type: Date, 
        default: Date.now
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
    compareFromID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'WebpageCapture'
    },
    compareToID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'WebpageCapture'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }
});

mongoose.model('ImageDiff', schema);



















