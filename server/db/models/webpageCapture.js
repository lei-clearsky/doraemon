'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    captureTime: { 
        type: Date, 
        default: new Date()
    },
    websiteUrl: {
        type: String
    },
    screenshots: [{
        viewport: String,
        currentScreenshot: String,
        previousScreenshot: String,
        diffImage: String,
        diffPercentage: String
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }
});

// schema.pre('save', function (next) {

//     if (this.isModified('password')) {
//         this.salt = this.constructor.generateSalt();
//         this.password = this.constructor.encryptPassword(this.password, this.salt);
//     }

//     next();

// });

// schema.method('correctPassword', function (candidatePassword) {
//     return encryptPassword(candidatePassword, this.salt) === this.password;
// });

mongoose.model('WebpageCapture', schema);



















