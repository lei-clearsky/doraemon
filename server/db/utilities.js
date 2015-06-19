var path = require('path');
var mkdirp = require('mkdirp'); 
var fs = require('fs'); 
var AWS = require('aws-sdk'); 
var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}}); 
AWS.config.region = 'us-standard'; 
var Q = require('q');

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
	saveToAWS: function(filepath, S3Path) {
	    // save file to AWS
	    var deferred = Q.defer();
	    var imgPath = path.join(__dirname, '../../' + filepath);
	    
	    fs.readFile(filepath, function (err, data) {
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
	}
};

module.exports = utilities;