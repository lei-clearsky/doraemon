'use strict';
app.factory('Utils', function () {
	return {
		toggleCheckbox: function(option, optionsArray) {
	        var idx = optionsArray.indexOf(option);
	        if(idx > -1) // the option is already in the array, so we remove it
	            optionsArray.splice(idx, 1);
	        else // the option is not in the array, so we add it
	            optionsArray.push(option);
	    }

	};
});



    