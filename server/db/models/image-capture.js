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
    return this.find({ 
                websiteURL: url,
                // userID: userID,
                viewport: viewport
            }).sort({captureTime: 'desc'}).limit(1).exec(function(err, docs) {
                if (err) console.log(err);
                console.log('sorting completed', docs[0])
                return docs[0];
            })
};





mongoose.model('ImageCapture', schema);





