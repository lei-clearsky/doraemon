'use strict';

var Nightmare = require('nightmare')
var nightmare = new Nightmare();

var CronJob = require('cron').CronJob;
var gm = require('gm');


var router = require('express').Router();
module.exports = router;

var mongoose = require('mongoose');
var	testConfig = mongoose.model('TestConfig');
var	imageCapture = mongoose.model('ImageCapture');
var imageDiff = mongoose.model('ImageDiff');



var intervalJob = new CronJob({
  cronTime: '00 * * * * *',  // this is the timer
  onTick: function() {
    // retrieving information about the date to be used later
    var date = new Date();
    var hour = date.getHours();
    var weekday = date.getDay()

    console.log('process begins...')

    // searches TestConfig model and retrieve URL objects
    // currently useing 11, 5 as params for testing purposes
    testConfig.findAllURLs(1, 6).then(function(configs) {
		configs.forEach(function(config) {
			// define path to save images to
			var path = './temp_images/' + config._id + date + '.png'

			console.log('this is the config object', config)

			// use nightmare to take a screenshot
			nightmare
				.viewport(1024, 768)	// will need to use viewport in config object
				.goto(config.URL)	
				.wait()	
				.screenshot(path)
				.use(function() {
					console.log('screenshot completed...')
					console.log('saving screenshot to database...')

					// creating temporary object to be stored in database
					var newImage = {
						websiteURL: config.URL,
						viewport: '1024, 768',	// will need to use viewport in config object
						imgURL: path,
						userID: config.user
					}

					// creates new image in database
					imageCapture
						.create(newImage, function(err, newImg) {
							if (err) throw err;
							console.log('new image saved...')
						})

					// searches for last screenshot taken
					imageCapture
						.searchForLastSaved(config.URL, '1024, 768')  // will use viewport in config object
						.then(function(lastImg) {
							// diff the images
							return compareUrls(newImage.imgURL, lastImg[0].imgURL);
						}).
						then(function(output) {
							console.log('saving diff image to database...')

							console.log('this is output', output)
					
							// temp image object to be save to database
							var diffImage = {
								    diffImgURL: output.file,
								    diffPercent: output.percent,
								    websiteUrl: config.URL,
								    viewport: '1024, 768'	// will use viewport in config
							}


							imageDiff
								.create(diffImage, function(err, img) {
									if (err) throw error;
									console.log('diff image saved')
								})
						})
				})
		})

		nightmare.run(function() {
			console.log('finished with all')
		})
	})
  },
  start: false
});

var compareUrls = function(newImg, lastImg) {   
    var options = {
        highlightColor: 'yellow', // optional. Defaults to red
        file: './temp_images/diff.png' // required
    };
    
    var output = {
    	percent: 0,
    	file: options.file
    }


    return gm.compare(lastImg, newImg, options, function (err, isEqual, equality, raw) {    
	    if (err) throw err;
        console.log('The images are equal: %s', isEqual);
        console.log('Actual equality: %d', equality);
        console.log('Raw output was: %j', raw);    
        
        output.percent = equality;

        return output
    });


    
};



intervalJob.start();