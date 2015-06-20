'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('admin.dashboard', {
        url: '/dashboard',
        templateUrl: 'js/admin/dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        resolve: {
            currentUser: function(AuthService) {
                return AuthService.getLoggedInUser()
                            .catch(function (err) {
                                console.log(err);
                            });
            },
            allDiffs: ['currentUser', 'Dashboard', function(currentUser, Dashboard) {
                return Dashboard.allDiffsForUser(currentUser._id)
                            .catch(function (err) {
                                console.log(err);
                            });
            }]
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
            return $http.get('/api/screenshots/' + userID)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });
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
            });
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
            });
        },
        allDiffsForUser: function (userID) {

            return $http.get('/api/screenshots/allDiffs/' + userID)
                        .then(function (response) {
                            // console.log('diffs ', response.data);
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });
        },
        allScreenshotsForUser: function (userID) {
            return $http.get('/api/screenshots/allScreenshots/' + userID)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });
        },
        getDiffsByUrl: function (params) {
            return $http({
                url: '/api/screenshots/diffsByUrl',
                method: 'GET',
                params: params
            })
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        }
    };

});

app.controller('DashboardCtrl', function ($scope, Dashboard, $modal, currentUser, allDiffs, $rootScope) {
    $rootScope.stateClass = 'dashboard';
    $scope.allDiffsForUser = allDiffs;
    $scope.diffsForUser = null;
    $scope.screenshotsForUser = null;
    $scope.testsByUser = null;
    $scope.viewports = null;
    $scope.urls = null;
    $scope.dates = null;
    $scope.testsByDate = null;
    
    $scope.dashboard = {
        alertNum: null,
        testsNum: null,
        diffPercent: null
    };

    $scope.diffImgs = [];

    $scope.searchParams = {
        user: currentUser._id,
        testNames: [],
        options: {}
    };

    $scope.diffImages = {
        byUrl: [],
        byDate: [],
        byViewport: []
    };

    Dashboard.allScreenshotsForUser(currentUser._id)
            .then(function(allScreenshots) {
                $scope.screenshotsForUser = allScreenshots;
            });

    $scope.toggleCheckbox = function(option, optionsArray) {
        var idx = optionsArray.indexOf(option);
        if(idx > -1) // the option is already in the array, so we remove it
            optionsArray.splice(idx, 1);
        else // the option is not in the array, so we add it
            optionsArray.push(option);
    };

    $scope.searchDiffs = function () {
        Dashboard.searchDiffs($scope.searchParams)
            .then(function (returnedDiffImgs) {
                $scope.diffImgs = returnedDiffImgs;
            });
    };

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
                                // diff.diffImgURL = diff.diffImgURL.slice(2);
                                diff.diffImgThumbnail = diff.diffImgThumbnail.slice(2);
                                diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgThumbnail;
                                
                            });
                        });
            })
            .catch(function(err) {
                return err;
            });
    };

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    function calcAveragePerc(percArr) {
        var sum = 0, 
            averagePerc;
        percArr.forEach(function (perc) {
            if (perc !== undefined)
                sum += perc;
        });
        averagePerc = sum / (percArr.length);
        return averagePerc;
    }

    function getHighestPerc(percArr) {
        var highest = 0;
        percArr.forEach(function(perc) {
            if (perc !== undefined) {
                if (perc > highest)
                    highest = perc;
            }
        });
        return highest;
    }

    function getLowestPerc(percArr) {
        var lowest = 1;
        percArr.forEach(function(perc) {
            if (perc !== undefined || perc !== 0) {
                if (perc < lowest)
                    lowest = perc;
            }
        });
        return lowest;
    }

    function displayByDate() {
            var dates = [];
            var days = [];
            var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            $scope.allDiffsForUser.forEach(function(diffImg, index) {
                var formattedDate = formatDate(diffImg.captureTime);
                if (dates.indexOf(formattedDate) < 0) {
                    var d = new Date(diffImg.captureTime);
                    var day = dayNames[ d.getDay() ];
                    dates.push(formattedDate);
                    days.push(day);
                }
            });
            $scope.dates = dates;

            var byDate = [];
            $scope.dates.forEach(function(date, index) {
                var d = {
                    date: '',
                    day: '',
                    alerts: [],
                    testsRun: [],
                    perc: [],
                    lowestPerc: '',
                    highestPerc: '',
                    averagePerc: ''
                };
                d.date = date;
                d.day = days[index];
                byDate.push(d);
            });


            $scope.allDiffsForUser.forEach(function(diff) {
                $scope.dates.forEach(function (date, index) {
                    var diffCaptureTime = formatDate(diff.captureTime);
                    if (diffCaptureTime === date) {
                        byDate[index].date = date;
                       
                        if (diff.diffPercent*100 > diff.threshold) {
                            byDate[index].alerts.push(diff);
                        }

                        byDate[index].perc.push(diff.diffPercent);
                    }                            
                });
                
            });

            byDate.forEach(function (el) {
                var percArr = el.perc;
                var averagePerc = calcAveragePerc(percArr);
                var highestPerc = getHighestPerc(percArr);
                var lowestPerc = getLowestPerc(percArr);
                el.lowestPerc = lowestPerc;
                el.highestPerc = highestPerc;
                el.averagePerc = averagePerc;
            });

            $scope.testsByDate = byDate;
            if ($scope.testsByDate.length !== 0) {
                $scope.diffPerc = $scope.testsByDate[0].averagePerc;
            }
        
    }

    displayByDate();

    // display by URL
    Dashboard.getTestsByUserID(currentUser._id)
            .then(function (tests) {
                $scope.testsByUser = tests;
                $scope.dashboard.testsNum = tests.length;
                var urls = [];
                var names = [];
                tests.forEach(function(test, index) {
                    var p = {};
                    if (urls.indexOf(test.URL) === -1) {
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
                    Dashboard.getDiffsByUrl(params)
                        .then(function(diffs) {
                            diffs.forEach(function(diff) {
                                diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgThumbnail.slice(2);
                                // diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgURL.slice(2);
                            });
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
                            $scope.diffsForUser = allDiffs;
                                allDiffs.forEach(function(diff) {

                                    $scope.viewports.forEach(function (viewport, index) {
                                        if (diff.viewport === viewport) {
                                            diff.diffImgThumbnail = diff.diffImgThumbnail.slice(2);
                                            diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgThumbnail;
   
                                            byViewport[index].images.push(diff);
                                        }
                                    });
                                    $scope.diffImages.byViewport = byViewport;
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
    };
});

app.controller('DiffModalCtrl', function ($http, $scope, $modalInstance, viewDiff) {
    
    $scope.diffInfo = viewDiff;
    console.log('modal ', viewDiff);
    // $scope.diffInfo.diffImgURL = 'https://s3.amazonaws.com/capstone-doraemon/' + $scope.diffInfo.diffImgURL.slice(2);
    $scope.diffInfo.diffImgThumbnail = 'https://s3.amazonaws.com/capstone-doraemon/' + $scope.diffInfo.diffImgThumbnail.slice(2);
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

app.filter('percentage', ['$filter', function ($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
}]);
























