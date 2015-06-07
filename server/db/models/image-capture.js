'use strict';
var mongoose = require('mongoose');

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
    userID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }
});


schema.statics.searchForPrevious = function(url, userID, viewport) {
    return this.find({ 
                websiteURL: url,
                userID: userID,
                viewport: viewport
            }).sort({captureTime: 'desc'}).exec(function(err, docs) {
                if (err) console.log(err);
                return docs[0]
            })
};





mongoose.model('ImageCapture', schema);





