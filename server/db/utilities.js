var path = require('path');
var mkdirp = require('mkdirp'); 
var fs = require('fs'); 
var AWS = require('aws-sdk'); 
var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}}); 
AWS.config.region = 'us-standard'; 
var Q = require('q');
var roboto = require('roboto');

var utilities = {
	createImageDir: function(userID, configName, viewport, imgType, hour, day, time, configID) {
	    // tmp/userID/configName/viewport/imgType/hour_weekday_date.now() + .jpg
	    
	    //testing purposes
	    time = Date.now();
	    
	    var path = './tmp/' + userID + '/' + configName + '/' + viewport + '/' + imgType;
	    

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
		if (filepath) {
			fs.unlinkSync(filepath, function (err) {
	        	if (err) {
	        		return console.log(err);
	        	} else {
	        		return console.log('successfully removed file')
	        	}
	        });
		} else {
			console.log('file path does not exist');
		}

		return filepath;
	}
};

module.exports = utilities;