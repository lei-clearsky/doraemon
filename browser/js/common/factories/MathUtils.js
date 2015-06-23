'use strict';
app.factory('MathUtils', function () {
	return {
		formatDate: function(date) {
	        var d = new Date(date),
	            month = '' + (d.getMonth() + 1),
	            day = '' + d.getDate(),
	            year = d.getFullYear();

	        if (month.length < 2) month = '0' + month;
	        if (day.length < 2) day = '0' + day;

	        return [year, month, day].join('-');
	    },
	    calcAveragePerc: function(percArr) {
	        var sum = 0, 
	            averagePerc;
	        percArr.forEach(function (perc) {
	            if (perc !== undefined)
	                sum += perc;
	        });
	        averagePerc = sum / (percArr.length);
	        return averagePerc;
	    },
	    getHighestPerc: function(percArr) {
	        var highest = 0;
	        percArr.forEach(function(perc) {
	            if (perc !== undefined) {
	                if (perc > highest)
	                    highest = perc;
	            }
	        });
	        return highest;
	    },
	    getLowestPerc: function(percArr) {
	        var lowest = 1;
	        percArr.forEach(function(perc) {
	            if (perc !== undefined || perc !== 0) {
	                if (perc < lowest)
	                    lowest = perc;
	            }
	        });
	        return lowest;
	    }

	};
});



    