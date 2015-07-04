var mongoose = require('mongoose');
var Nightmare = require('nightmare');
var nightmare = new Nightmare();
var CronJob = require('cron').CronJob;
var testConfig = mongoose.model('TestConfig');

var Q = require('q');
var chalk = require('chalk');

var obj = {
    run: function() {
        new CronJob({
            cronTime: '0 */3 * * * *',  // this is the timer, set to every minuite for testing purposes
            onTick: function() {
                // retrieving information about the date to be used later
                
                // currently using Weekday: 6, Hour: 10 as params for testing purposes
                // var date = new Date();
                var date = new Date('June 13, 2015 10:00:00');
                var hour = date.getHours();
                var weekday = date.getDay();

                // searches TestConfig model and retrives URL objects
                testConfig.findAllScheduledTests(hour, weekday).then(function(tests) {

                    console.log(chalk.magenta('Starting ' + tests.length + ' test-config jobs for Weekday: ' + weekday + ', Hour: ' + hour));
                    nightmare.run();
                    return tests.reduce(function (prev, curr) {
                        return prev.then(curr.runTestConfig(nightmare, date));
                    }, Q());
                    
                    // Could not figure out an easy way to run testConfigs sequentially and resolve when all are done
                    // https://github.com/kriskowal/q/issues/606
                }).then(null, function(error) {
                    console.log(error);
                });
            },
                start: true
        });
    }
};

module.exports = obj;