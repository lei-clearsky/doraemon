'use strict';
var mongoose = require('mongoose');

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
    compareFromID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ImageCapture'
    },
    compareToID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ImageCapture'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }
});



mongoose.model('ImageDiff', schema);



















