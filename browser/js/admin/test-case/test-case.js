'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('admin.test-case', {
        url: '/test-case/:testCaseID',
        templateUrl: 'js/admin/test-case/test-case.html',
        controller: 'TestCaseCtrl',
        resolve: {
            currentUser: function(AuthService) {
                return AuthService.getLoggedInUser();
            }
        },
        data: {
            authenticate: true
        }
    });

});

// Test Step object
// { 
//  stepCode: 
//  eventText: 
//  path: (optional)
//  value: (optional)
// }

app.factory('TestCaseFactory', function ($http) {

    return {
        createTestCase: function (testCaseObj) {
            return $http.post('/api/test-case', testCaseObj).then(function (response) {
                return response.data;
            });
        },
        findTestCase: function (testCaseID) {
            return $http.get('/api/test-case/' + testCaseID).then(function (response) {
                return response.data;
            });
        },
        deleteTestCase: function (testCaseID) {
            return $http.delete('/api/test-case/' + testCaseID).then(function (response) {
                return response.data;
            });
        }
    };

});

app.value('viewportOptions', [
    {label: 'Samsung Galaxy S5', value: '360x640'},
    {label: 'Apple iPhone 6', value: '375x667'},
    {label: 'Google Nexus 7', value: '603x966'},
    {label: 'Apple iPad', value: '768x1024'}, 
    {label: '12\" Notebook', value: '1024x768'},
    {label: '19\" Desktop', value: '1440x900'},
    {label: '24\" Desktop', value: '1920x1200'}
]);

app.value('dayFrequencyOptions', [
    {label: 'Sun', value: 0},
    {label: 'Mon', value: 1},
    {label: 'Tue', value: 2},
    {label: 'Wed', value: 3},
    {label: 'Thurs', value: 4},
    {label: 'Fri', value: 5},
    {label: 'Sat', value:6}
]);

app.value('hourFrequencyOptions', [
    {label: '10 am', value: 10},
    {label: '2 pm', value: 14},
    {label: '6 pm', value: 18},
    {label: '10 pm', value: 22}
]);

app.controller('TestCaseCtrl', function ($scope, TestCaseFactory, currentUser, viewportOptions, dayFrequencyOptions, hourFrequencyOptions, $rootScope, $stateParams, $state, $q) {
    $rootScope.stateClass = 'test-case';
    $scope.config = {
        name: '',
        devURL: null,
        threshold: null,
        dayFrequency: [],
        hourFrequency: [],
        viewports: []
    };
    
    $scope.submitAttempted = false;
    $scope.viewportOptions = viewportOptions;
    $scope.dayFrequencyOptions = dayFrequencyOptions;
    $scope.hourFrequencyOptions = hourFrequencyOptions;
    
    $scope.showSuccessAlert = false;

    TestCaseFactory.findTestCase($stateParams.testCaseID).then(function(testCase) {
        $scope.config.URL = testCase.URL;
        $scope.config.userID = testCase.userID;
        $scope.config.steps = testCase.steps;
    }).then(null, function(err) {
        console.log(err);
        redirect();
    });

    $scope.toggleCheckbox = function(option, optionsArray) {
        var idx = optionsArray.indexOf(option);
        if(idx > -1) // the option is already in the array, so we remove it
            optionsArray.splice(idx, 1);
        else // the option is not in the array, so we add it
            optionsArray.push(option);
    };

    // Still cannot find a better way to validate config form
    $scope.isValid = function() {
        $scope.submitAttempted = true;

        if (($scope.config.name === '') ||
            ($scope.config.viewports.length === 0) ||
            ($scope.config.dayFrequency.length === 0) ||
            ($scope.config.hourFrequency.length === 0) ||
            ($scope.config.threshold < 0)) {
            return false;
        }

        return true;
    };

    $scope.submit = function() {
        if (!$scope.isValid())
            return;  

        var promises = [];

        $scope.config.viewports.forEach(function(viewport) {
            var newTestCaseObj = {
                name: $scope.config.name,
                devURL: $scope.config.devURL,
                threshold: $scope.config.threshold,
                dayFrequency: $scope.config.dayFrequency,
                hourFrequency: $scope.config.hourFrequency,
                URL: $scope.config.URL,
                userID: $scope.config.userID,
                steps: $scope.config.steps,
                viewport: viewport,
                formCompleted: true
            };

            promises.push(TestCaseFactory.createTestCase(newTestCaseObj));
        });

        $q.all(promises).then(function() {
            return TestCaseFactory.deleteTestCase($stateParams.testCaseID);
        }).then(function() {
            $scope.showSuccessAlert = true;
            window.setTimeout(redirect, 2000);
        }).then(null, function(err) {
            console.log(err);
        });
    };

    function redirect() {
        $state.go('admin.dashboard');
    };
});