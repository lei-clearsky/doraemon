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


schema.statics.searchForLastSaved = function(url, viewport) {
    return this.findOne({ 
                websiteURL: url,
                // userID: userID,
                viewport: viewport
            }).sort({captureTime: 'desc'}).exec(function(err, docs) {
                if (err) console.log(err);
                console.log('sorting completed', docs)
                return docs;
            })
};





mongoose.model('ImageCapture', schema);





