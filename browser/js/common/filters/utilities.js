app.filter('unique', function() {
   return function(collection, keyname) {
      var output = [], 
          keys = [];

      angular.forEach(collection, function(item) {
          var key = item[keyname];
          if(keys.indexOf(key) === -1) {
              keys.push(key);
              output.push(item);
          }
      });

      return output;
   };
});

app.filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals);
    };
}]);

app.filter('awsImg', function() {
  return function (input) {
    return 'https://s3.amazonaws.com/capstone-doraemon/' + input.slice(2);
  }
})

app.filter('convertDay', function() {
  return function(arr) {
    var day = [];

    for (var i = 0; i < arr.length; i++) {
      switch (arr[i]) {
          case 0:
              day.push("Sunday");
              break;
          case 1:
              day.push("Monday");
              break;
          case 2:
              day.push("Tuesday");
              break;
          case 3:
              day.push("Wednesday");
              break;
          case 4:
              day.push("Thursday");
              break;
          case 5:
              day.push("Friday");
              break;
          case  6:
              day.push("Saturday");
              break;
      };
    };

    return day.toString();
  };
});

app.filter('convertTime', function() {
  return function(arr) {
    var time = [];

    arr.forEach(function(el){
      if (el < 13) {
        time.push(el + ' AM');
      }
      else if (el < 25) {
        time.push((el - 12) + ' PM');
      }
    });

    return time.toString();
  };
});