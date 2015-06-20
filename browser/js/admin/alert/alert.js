'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('admin.alert', {
        url: '/alert',
        templateUrl: 'js/admin/alert/alert.html',
        controller: 'AlertCtrl',
        resolve: {
            currentUser: function(AuthService) {
                return AuthService.getLoggedInUser();
            }
        }
    });

});

app.controller('AlertCtrl', function ($scope, Dashboard, $modal, currentUser) {

    $scope.alertsByDate = null;

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    // construct alert obj
    Dashboard.allDiffsForUser(currentUser._id)
        .then(function(allDiffs) {
            var dates = [];
            var days = [];
            var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            allDiffs.forEach(function(diffImg, index) {
                var formattedDate = formatDate(diffImg.captureTime);
                if (dates.indexOf(formattedDate) < 0) {
                    var d = new Date(diffImg.captureTime);
                    var day = dayNames[ d.getDay() ];
                    dates.push(formattedDate);
                    days.push(day);
                }
            });
            // $scope.dates = dates;

            var byDate = [];
            dates.forEach(function(date, index) {
                var d = {
                    date: '',
                    day: '',
                    alerts: []
                };
                d.date = date;
                d.day = days[index];
                byDate.push(d);
            });

            Dashboard.allDiffsForUser(currentUser._id)
                .then(function(allDiffs) {
                    allDiffs.forEach(function(diff) {
                        dates.forEach(function (date, index) {
                            var diffCaptureTime = formatDate(diff.captureTime);
                            if (diffCaptureTime === date) {
                                byDate[index].date = date;
                               
                                if (diff.diffPercent * 100 > diff.threshold) {
                                    byDate[index].alerts.push(diff);
                                }

                            }                            
                        });
                        
                    });

                    $scope.alertsByDate = byDate;
                });
        });

    $scope.animationsEnabled = true;
    $scope.openDiffModal = function (diffImgID, size) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'js/dashboard/diff-modal.html',
            controller: 'DiffModalCtrl',
            size: size,
            resolve: {
                viewDiff: function($http) {
                    return $http.get('/api/screenshots/diff/' + diffImgID)
                        .then(function(response) {
                            return response.data;
                    });
                }
            }
        });
    }   

});

app.controller('DiffModalCtrl', function ($http, $scope, $modalInstance, viewDiff) {
    
    $scope.diffInfo = viewDiff;
    $scope.diffInfo.diffImgURL = 'https://s3.amazonaws.com/capstone-doraemon/' + $scope.diffInfo.diffImgURL.slice(2);
  
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

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

























