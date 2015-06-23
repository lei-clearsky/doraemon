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
    $scope.diffsForUserByTest = null;
    $scope.testsByDate = null;
    
    $scope.dashboard = {
        alertNum: null,
        testsNum: null,
        diffPercent: null,
        alertNumOneTest: null,
        testsNumOneTest: null,
        diffPercentOneTest: null
    };

    $scope.searchParams = {
        user: currentUser._id,
        testName: 'DramaFever1'    
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

    Dashboard.searchDiffsByTest($scope.searchParams)
        .then(function (diffs) {
            $scope.diffImages.byUrl = Dashboard.displayByURL(diffs);
            $scope.diffImages.byViewport = Dashboard.displayByViewport(diffs);
        })
        .catch(function(err) {
            return err;
        });

    // diff image modal
    $scope.openDiffModal = Modal.openModal;

    // display alerts for today
    $scope.dashboard.alertNum = Dashboard.getStatsToday($scope.testsByDate, MathUtils).alertsToday;

    // display diff percent for today
    $scope.dashboard.diffPercent = Dashboard.getStatsToday($scope.testsByDate, MathUtils).diffPercentToday;

    // display tests ran for today
    $scope.dashboard.testsNum = Dashboard.getTestsToday($scope.allDiffsByUser, MathUtils);

    // display by dates
    displayByDate();
});

app.controller('DiffModalCtrl', function ($http, $scope, $modalInstance, viewDiff) {
    
    $scope.diffInfo = viewDiff;
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

























