'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    date: {
        type: Date
    },
    time: { 
        type : Date, 
        default: Date.now 
    },
    url: {
        type: String
    },
    screenshot: {
        type: String
    },
    diffImage: {
        id: String
    },
    diffPercentage: {
        id: String
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

mongoose.model('Image', schema);



















