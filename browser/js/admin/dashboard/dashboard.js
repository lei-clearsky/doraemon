'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('admin.dashboard', {
        url: '/dashboard',
        templateUrl: 'js/admin/dashboard/dashboard.html',
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
    $scope.viewports;
    $scope.urls;
    $scope.dates;
    // Dashboard.allDiffsForUser(currentUser._id)
    //         .then(function(allDiffs) {
    //             $scope.diffsForUser = allDiffs;
    //             console.log('diffs in controller: ', $scope.diffsForUser);

    //             $scope.diffsForUser.forEach(function(diff) {
    //                 diff.diffImgURL = diff.diffImgURL.slice(2);
    //                 diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgURL;
                    
    //             });
                
    //         });

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
        byUrl: [],
        byDate: [],
        byViewport: []
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
    // display by URL
    Dashboard.getTestsByUserID(currentUser._id)
            .then(function (tests) {
                $scope.testsByUser = tests;
                var urls = [];
                var names = [];
                tests.forEach(function(test, index) {
                    var p = {};
                    if (urls.indexOf(test.URL) === -1) {
                        urls.push(test.URL);
                        names.push(test.name);
                    }
                });
                console.log('all urls!!!!! ', urls);
                urls.forEach(function(url, index) {
                    var params = {
                        userID: currentUser._id,
                        url: url,
                        name: names[index]
                    };
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
            });
    

    


    // display by viewport
    Dashboard.getTestsByUserID(currentUser._id)
        .then(function (tests) {
            var viewports = [];
            $scope.testsByUser = tests;
            $scope.testsByUser.forEach(function(test, index) {
                if (viewports.indexOf(test.viewport) < 0) {
                    viewports.push(test.viewport);
                }
            });
            $scope.viewports = viewports;
            // console.log('scope.viewports ', $scope.viewports);

            Dashboard.allDiffsForUser(currentUser._id)
                .then(function(allDiffs) {
                    var byViewport = [];
                    $scope.viewports.forEach(function(viewport) {
                        var v = {
                            viewport: '',
                            images: []
                        };
                        v.viewport = viewport;
                        byViewport.push(v);
                    });


                    Dashboard.allDiffsForUser(currentUser._id)
                        .then(function(allDiffs) {
                                allDiffs.forEach(function(diff) {

                                    $scope.viewports.forEach(function (viewport, index) {
                                        // console.log('viewport ', viewport);
                                        // console.log('diff.viewport ', diff.viewport);

                                        if (diff.viewport === viewport) {
                                            diff.diffImgURL = diff.diffImgURL.slice(2);
                                            diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgURL;
                                            byViewport[index].images.push(diff);
                                        }
                                    });
                                    console.log('byViewport ', byViewport);
                                    $scope.diffImages.byViewport = byViewport;
                                    // };  
                                });
                            
                        });
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

























