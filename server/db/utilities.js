var path = require('path');
var mkdirp = require('mkdirp'); 
var fs = require('fs'); 
var AWS = require('aws-sdk'); 
var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}}); 
AWS.config.region = 'us-standard'; 
var Q = require('q');
var roboto = require('roboto');
var Jimp = require('jimp');
var gm = require('gm');

var utilities = {
	createImageDir: function(userID, configName, viewport, imgType, hour, day, time, configID, testStepIndex) {
	    // regular testConfig - tmp/userID/configName/viewport/imgType/hour_weekday_date.now + .jpg
	    // testConfig in TestCase - tmp/userID/configName/viewport/imgType/testStepIndex_#/hour_weekday_date.now + .jpg

	    //testing purposes
	    time = Date.now();
	    
	    var path = './tmp/' + userID + '/' + configName.split(' ').join('_') + '/' + viewport + '/' + imgType;
	    
	    if (testStepIndex !== undefined) {
	    	path += '/testStepIndex_' + testStepIndex;
	    } 


	    mkdirp(path, function (err) {
	        if (err) {
	            return err;
	        }
	    });

	    path += '/' + configID + '_' + hour + '_' + day + '_' + time + '.jpg';
	    return path;
	},
	saveToAWS: function(snapshotPath) {
	    // save file to AWS
	    var deferred = Q.defer();
	    var S3Path = snapshotPath.slice(2);
	    
	    fs.readFile(snapshotPath, function (err, data) {
	        if (err) { 
	            return deferred.reject(err); 
	        }

	        var params = {
	            Key: S3Path, 
	            Body: data
	        };

	        s3.createBucket(function(err, data) {
	            if (err) {
	                return deferred.reject(err);
	            }

	            s3.upload(params, function(err, data) {
	                if (err) {
	                    return deferred.reject(err);
	                } else {
	                    return deferred.resolve(data);
	                } 
	            });
	        });
	    });

	    return deferred.promise; 
	},
	removeImg: function(filepath) {
		var deferred = Q.defer();

		if (filepath) {
			fs.unlink(filepath, function (err) {
	        	if (err) {
	        		deferred.reject(err);
	        	} else {
	        		deferred.resolve(filepath);

	        	}
	        });
		} else {
			deferred.reject('file path does not exist');
		}
		return filepath;
	},
	darkenImg: function(imgPath) {
        var deferred = Q.defer();

		var darkenImg = new Jimp(imgPath, function(err, image) {
			if (err) return deferred.reject(err);	
			this.brightness(-0.5)
				.write(imgPath);
			
			return deferred.resolve(imgPath);
		});

		return deferred.promise;
	}
	// createThumbnail: function(output) {
	// 	var deferred = Q.defer();

 //        gm(output.file)
 //            .resize(300)
 //            .write(output.thumbnail, function(err) {
 //                if(err) deferred.reject(err);
 //                return deferred.resolve(output);
 //            });

 //        return deferred.promise;    
	// }
};

module.exports = utilities;