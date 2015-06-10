'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('dashboard', {
        url: '/dashboard',
        templateUrl: 'js/dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        resolve: {
            currentUser: function(AuthService) {
                return AuthService.getLoggedInUser();
            }
            // ,
            // allDiffs: function(Dashboard, AuthService) {

            //     return AuthService.getLoggedInUser()
            //                 .then(function (user) {
            //                     Dashboard.allDiffsForUser(user._id);
            //                 })
            //                 .catch(function (err) {
            //                     console.log(err);
            //                 });

            //     // var currentUserId = AuthService.getLoggedInUser()._id;
            //     // return Dashboard.allDiffsForUser(currentUserId);
            // },
            // allScreenshots: function(Dashboard, AuthService) {
            //     return AuthService.getLoggedInUser()
            //                 .then(function (user) {
            //                     Dashboard.allScreenshotsForUser(user._id);
            //                 })
            //                 .catch(function (err) {
            //                     console.log(err);
            //                 });
            //     // var currentUserId = AuthService.getLoggedInUser()._id;
            //     // return Dashboard.allScreenshotsForUser(currentUserId);
            // }
        }
    });

});

app.factory('Dashboard', function ($http) {

    return {
        getOne: function (id) {
            return $http.get('/api/screenshots/' + id)
                        .then(function (response) {
                            return response.data;
                        });
        },
        getTestsByUserID: function (userID) {
            console.log('get diffs by userID');
            return $http.get('/api/screenshots/' + userID)
                        .then(function (response) {
                            return response.data;
                        });
        },
        searchDiffs: function (params) {
            return $http({
                url: '/api/screenshots/search',
                method: 'GET',
                params: params
            }).then(function(res) {
                return res.data;
            }).catch(function(err) {
                console.log(err);
                return err;
            })
        },
        allDiffsForUser: function (userID) {
            return $http.get('/api/screenshots/allDiffs/' + userID)
                        .then(function (response) {
                            // console.log('allDiffsForUser in Factory: ', response.data);
                            return response.data;
                        });
        },
        allScreenshotsForUser: function (userID) {
            return $http.get('/api/screenshots/allScreenshots/' + userID)
                        .then(function (response) {
                            // console.log('allScreenshotsForUser in Factory: ', response.data);
                            return response.data;
                        });
        }
    };

});

app.controller('DashboardCtrl', function ($scope, Dashboard, $modal, currentUser) {
    // $scope.keys = ['myKey.jpg', 'test1.png', 'test3.png', 'diff.png'];
    // var path = './temp_images/' + userID + '/' + configID + '/' + viewport + '/' + imgType;

    // $scope.keysElements = {
    //     userId: currentUser._id,
    //     configName: 'configName from factory or something',
    //     viewport: 'viewport name from factory or something',
    //     imgType: 'imgtype from factory or something',
    //     hour: 'hour from factory',
    //     day: 'day from factory',
    //     time: 'time from factory'
    // };

    $scope.diffsForUser = null;
    $scope.screenshotsForUser = null;

    Dashboard.allDiffsForUser(currentUser._id)
            .then(function(allDiffs) {
                $scope.diffsForUser = allDiffs;
                console.log('diffs in controller: ', $scope.diffsForUser);

                $scope.diffsForUser.forEach(function(diff) {
                    diff.diffImgURL = diff.diffImgURL.slice(2);
                    diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgURL;
                    
                });
                
            });

    Dashboard.allScreenshotsForUser(currentUser._id)
            .then(function(allScreenshots) {
                $scope.screenshotsForUser = allScreenshots;
                // console.log('screenshots in controller: ', $scope.screenshotsForUser);
            });


    
    
    


    $scope.diffImgs = [];

    $scope.searchParams = {};

    $scope.searchDiffs = function () {
        Dashboard.searchDiffs($scope.searchParams)
            .then(function (returnedDiffImgs) {
                console.log('diff images ', returnedDiffImgs);
                $scope.diffImgs = returnedDiffImgs;
            });
    }
    
    Dashboard.getTestsByUserID(currentUser._id)
            .then(function (returnedDiffImgs) {
                console.log('tests by this user ', returnedDiffImgs);
                $scope.diffImgsByUser = returnedDiffImgs
            })


    // $scope.keys.forEach(function(key, index) {
    //     $scope.diffImgs.push('https://s3.amazonaws.com/capstone-doraemon/' + key);
    // });

    $scope.animationsEnabled = true;
    $scope.openDiffModal = function (size) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'js/dashboard/diff-modal.html',
            controller: 'DiffModalCtrl',
            size: size
        });
    }   

});

app.controller('DiffModalCtrl', function ($http, $scope, $modalInstance) {
    
    $scope.test = 'test';
    
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

























