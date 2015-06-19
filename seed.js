/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

Refer to the q documentation for why and how q.invoke is used.

*/

var mongoose = require('mongoose');
var connectToDb = require('./server/db');
var q = require('q');
var chalk = require('chalk');

var User = mongoose.model('User');
var TestConfig = mongoose.model('TestConfig');
var Team = mongoose.model('Team');
var ImageDiff = mongoose.model('ImageDiff');
var ImageCapture = mongoose.model('ImageCapture');

var seedUsers = function () {

    var users = [
        {
            email: 'test@fsa.com',
            password: 'test'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    return q.invoke(User, 'create', users);

};

var wipeDB = function () {

    var models = [User, Team, TestConfig, ImageDiff, ImageCapture];

    models.forEach(function (model) {
        model.find({}).remove(function () {});
    });

    return q.resolve();
};

var seed = function () {

    seedUsers().then(function (users) {
        console.log(chalk.magenta('Seeded Users!'));
        process.kill(0);
    }).catch(function (err) {
        console.error(err);
        process.kill(1);
    });

};

mongoose.connection.once('open', function () {
    wipeDB().then(seed);
});