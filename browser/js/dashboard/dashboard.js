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
        }
    });

});

app.factory('Dashboard', function ($http) {

    return {
        getOne: function (id) {
            return $http.get('/api/screenshots/' + id)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });
        },
        getTestsByUserID: function (userID) {
            console.log('get diffs by userID');
            return $http.get('/api/screenshots/' + userID)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });;
        },
        searchDiffs: function (params) {
            return $http({
                url: '/api/screenshots/searchDiffs',
                method: 'GET',
                params: params
            }).then(function(res) {
                return res.data;
            }).catch(function(err) {
                console.log(err);
                return err;
            })
        },
        searchTestsByName: function (params) {
            return $http({
                url: '/api/screenshots/searchTestByName',
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
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });;
        },
        allScreenshotsForUser: function (userID) {
            return $http.get('/api/screenshots/allScreenshots/' + userID)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });;
        },
        getDiffsByUrl: function (params) {
            return $http({
                url: '/api/screenshots/diffsByUrl',
                method: 'GET',
                params: params
            })
            // return $http.get('/api/screenshots/diffsByUrl/' + userID)
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            })
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

    $scope.searchParams = {
        user: currentUser._id,
        testNames: [],
        options: {}
    };

    // byUrl[0].urlName
    // byUrl[0].images - ng-repeat

    $scope.diffImages = {
        'byUrl': [
            // {
            //     urlName: url1,
            //     images: [
            //         image1,
            //         image2,
            //         image3,
            //         image4
            //     ]
            // },
            // {
            //     urlName: url2,
            //     images: [
            //         image1,
            //         image2,
            //         image3,
            //         image4
            //     ]
            // }
        ]
        // ,
        // byDate = {
        //     date1: [
        //         image1,
        //         image2,
        //         image3,
        //         image4
        //     ],
        //     date2: [
        //         image1,
        //         image2,
        //         image3,
        //         image4
        //     ]
        // },
        // byViewport = {
        //     viewport1: [
        //         image1,
        //         image2,
        //         image3,
        //         image4
        //     ],
        //     viewport2: [
        //         image1,
        //         image2,
        //         image3,
        //         image4
        //     ]
        // }
    };

    $scope.testsOptions = {};

    $scope.toggleCheckbox = function(option, optionsArray) {
        var idx = optionsArray.indexOf(option);
        if(idx > -1) // the option is already in the array, so we remove it
            optionsArray.splice(idx, 1);
        else // the option is not in the array, so we add it
            optionsArray.push(option);

        // add more search options based on test name
        // Dashboard.searchTestsByName($scope.searchParams)
        //         .then(function (tests) {
        //             $scope.testsOptions = tests;
        //         })

    };

    $scope.toggleOptionsCheckbox = function(url, viewport, optionsObj) {
        
        if ('url' in optionsObj) {

        }

        var idx = optionsArray.indexOf(option);
        if(idx > -1) // the option is already in the array, so we remove it
            optionsArray.splice(idx, 1);
        else // the option is not in the array, so we add it
            optionsArray.push(option);
    };

    $scope.searchDiffs = function () {
        Dashboard.searchDiffs($scope.searchParams)
            .then(function (returnedDiffImgs) {
                console.log('diff images ', returnedDiffImgs);
                $scope.diffImgs = returnedDiffImgs;
            });
    }

    $scope.searchDiffsByName = function () {
        Dashboard.searchTestsByName($scope.searchParams)
            .then(function (tests) {
                var websiteURLs = [];
                tests.forEach(function(test) {
                    websiteURLs.push(test.URL);
                });
                var diffsParams = {
                    user: currentUser._id,
                    websiteURLs: websiteURLs
                };
                return diffsParams;
                
            })
            .then(function (diffsParams) {
                Dashboard.searchDiffs(diffsParams)
                        .then(function (diffs) {
                            $scope.diffsForUser = diffs;
                            $scope.diffsForUser.forEach(function(diff) {
                                diff.diffImgURL = diff.diffImgURL.slice(2);
                                diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgURL;
                                
                            });
                        })
            })
            .catch(function(err) {
                return err;
            });
    }
    
    Dashboard.getTestsByUserID(currentUser._id)
            .then(function (tests) {
                $scope.testsByUser = tests;
                var urls = [];
                var names = [];
                tests.forEach(function(test, index) {
                    var p = {};
                    if (urls.indexOf(test.URL) === -1) {
                        // p.url = test.URL;
                        // p.name = test.name;
                        urls.push(test.URL);
                        names.push(test.name);
                    }
                });

                urls.forEach(function(url, index) {
                    var params = {
                        userID: currentUser._id,
                        url: url,
                        name: names[index]
                    };
                    console.log(params);
                    Dashboard.getDiffsByUrl(params)
                        .then(function(diffs) {
                            diffs.forEach(function(diff) {
                                diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgURL.slice(2);
                            })
                            var diffsInUrl = {
                                urlName: url,
                                images: diffs
                            };
                            $scope.diffImages.byUrl.push(diffsInUrl);
                        });
                });
            })


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

























