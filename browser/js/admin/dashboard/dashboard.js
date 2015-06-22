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
            allDiffsByUser: ['currentUser', 'Dashboard', function(currentUser, Dashboard) {
                return Dashboard.allDiffsByUser(currentUser._id)
                            .catch(function (err) {
                                console.log(err);
                            });
            }],
            allTestsByUser: ['currentUser', 'Dashboard', function(currentUser, Dashboard) {
                return Dashboard.getTestsByUserID(currentUser._id)
                            .catch(function (err) {
                                console.log(err);
                            });
            }]

        }
    });

});

app.controller('DashboardCtrl', function ($scope, MathUtils, Utils, Dashboard, Modal, $modal, currentUser, allDiffsByUser, allTestsByUser, $rootScope) {
    $rootScope.stateClass = 'dashboard';
    $scope.allDiffsByUser = allDiffsByUser;
    $scope.allTestsByUser = allTestsByUser;
    $scope.toggleCheckbox = Utils.toggleCheckbox;
    $scope.diffsForUser = null;
    $scope.screenshotsForUser = null;
    $scope.testsByUser = null;
    $scope.viewports = null;
    $scope.urls = null;
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

    // display by date
    var displayByDate = function () {
        var uniqueDatesObj = Dashboard.getUniqueDates($scope.allDiffsByUser, MathUtils);
        var days = uniqueDatesObj.days;
        var dates = uniqueDatesObj.dates;
        var byDateObj = Dashboard.getByDateBaseObj(dates, days);
        byDateObj = Dashboard.getByDateObj($scope.allDiffsByUser, dates, byDateObj, MathUtils);

        byDateObj.forEach(function (el) {
            var percArr = el.perc;
            el.lowestPerc = MathUtils.getLowestPerc(percArr);
            el.highestPerc = MathUtils.getHighestPerc(percArr);
            el.averagePerc = MathUtils.calcAveragePerc(percArr);
        });

        $scope.testsByDate = byDateObj;
        if ($scope.testsByDate.length !== 0) {
            $scope.diffPerc = $scope.testsByDate[0].averagePerc;
        }      
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
                                diff.diffImgThumbnail = diff.diffImgThumbnail.slice(2);
                                diff.url = 'https://s3.amazonaws.com/capstone-doraemon/' + diff.diffImgThumbnail;
                                
                            });
                        });
            })
            .catch(function(err) {
                return err;
            });
    };

    // display by URL
    Dashboard.getTestsByUserID(currentUser._id)
            .then(function (tests) {
                $scope.testsByUser = tests;
                // $scope.dashboard.testsNum = tests.length;
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

            Dashboard.allDiffsByUser(currentUser._id)
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


                    Dashboard.allDiffsByUser(currentUser._id)
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

    $scope.openDiffModal = Modal.openModal;
    displayByDate();

    // display alerts for today
    $scope.dashboard.alertNum = Dashboard.getStatsToday($scope.testsByDate, MathUtils).alertsToday;

    // display diff percent for today
    $scope.dashboard.diffPercent = Dashboard.getStatsToday($scope.testsByDate, MathUtils).diffPercentToday;

    // display tests ran for today
    $scope.dashboard.testsNum = Dashboard.getTestsToday($scope.allDiffsByUser, MathUtils);
});

app.controller('DiffModalCtrl', function ($http, $scope, $modalInstance, viewDiff) {
    
    $scope.diffInfo = viewDiff;
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

























