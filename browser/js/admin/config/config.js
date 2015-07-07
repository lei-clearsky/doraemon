'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('admin.config', {
        url: '/config',
        templateUrl: 'js/admin/config/config.html',
        controller: 'ConfigCtrl',
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

app.value('maxDepthOptions', [
    {label: 'One', value: 1},
    {label: 'Two', value: 2},
    {label: 'Three', value: 3}
]);

app.controller('ConfigCtrl', function ($scope, Config, currentUser, viewportOptions, dayFrequencyOptions, hourFrequencyOptions, maxDepthOptions, Dashboard, $rootScope, $q, $state) {
    $rootScope.stateClass = 'config';
    $scope.submitAttempted = false;
    $scope.submitAttemptedBulk = false;

    $scope.configTest = {
        name: '',
        rootURL: ''
    };

    $scope.configBulkTest = {
        name: '',
        startURL: '',
        viewports: [],
        dayFrequency: [],
        hourFrequency: []
    };

    $scope.config = [{
        path: '',
        threshold: null,
        viewports: [],
        dayFrequency: [],
        hourFrequency: []
    }];

    $scope.viewportOptions = viewportOptions;
    $scope.dayFrequencyOptions = dayFrequencyOptions;
    $scope.hourFrequencyOptions = hourFrequencyOptions;
    $scope.maxDepthOptions = maxDepthOptions;
    
    $scope.showSuccessAlert = false;
    $scope.testsByUserID = [];

    $scope.addPath = function() {
        $scope.config.push({
            path: '',
            threshold: null,
            viewports: [],
            dayFrequency: [],
            hourFrequency: []
        });
    };

    $scope.removePath = function(index) {
        if ($scope.config.length > 1) {
            $scope.config.splice(index, 1);
        }
    };

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

        if ($scope.configTest.name.length === 0) return false;
        if ($scope.configTest.rootURL.length === 0) return false;

        for (var i = 0; i < $scope.config.length; i++) {
            if (($scope.config[i].viewports.length === 0) ||
                ($scope.config[i].dayFrequency.length === 0) ||
                ($scope.config[i].hourFrequency.length === 0)) {
                return false;
            }
        };
        return true;
    };

    $scope.isValidBulk = function() {
        $scope.submitAttemptedBulk = true;

        if (($scope.configBulkTest.name.length === 0) ||
            ($scope.configBulkTest.startURL.length === 0) ||
            ($scope.configBulkTest.viewports.length === 0) ||
            ($scope.configBulkTest.dayFrequency.length === 0) ||
            ($scope.configBulkTest.hourFrequency.length === 0)) {
            return false;
        };

        return true;
    };

    $scope.submit = function() {
        if (!$scope.isValid())
            return;  

        var promises = [];

        $scope.config.forEach(function(element) {
            element.viewports.forEach(function(viewport) {
                promises.push(Config.create({
                    name: $scope.configTest.name,
                    URL: 'http://' + $scope.configTest.rootURL + element.path,
                    devURL: 'http://' + $scope.configTest.devURL,
                    rootURL: 'http://' + $scope.configTest.rootURL,
                    threshold: element.threshold,
                    viewport: viewport,
                    dayFrequency: element.dayFrequency,
                    hourFrequency: element.hourFrequency,
                    userID: currentUser._id
                }));
            });                
        });

        $q.all(promises).then(function() {
            $scope.showSuccessAlert = true;
            $scope.submitAttempted = false;
            $scope.configTest = {
                name: '',
                rootURL: ''
            };
            $scope.config = [{
                path: '',
                threshold: null,
                viewports: [],
                dayFrequency: [],
                hourFrequency: []
            }];

            window.setTimeout(redirect, 2000);
        }).then(null, function(err) {
            console.log(err);
        });
    };

    $scope.submitBulk = function() { 
        if (!$scope.isValidBulk())
            return; 

        var object = {
            testName: $scope.configBulkTest.name,
            startURL: 'http://www.' + $scope.configBulkTest.startURL, 
            maxDepth: $scope.configBulkTest.depth,
            blacklist: $scope.configBulkTest.blacklist,
            whitelist: $scope.configBulkTest.whitelist,
            threshold: $scope.configBulkTest.threshold,
            viewport: $scope.configBulkTest.viewports,
            dayFrequency: $scope.configBulkTest.dayFrequency,
            hourFrequency: $scope.configBulkTest.hourFrequency,
            userID: currentUser._id
        };

        Config.createBulk(object).then(function() {
            $scope.showSuccessAlert = true;
            $scope.submitAttemptedBulk = false;
            $scope.configBulkTest = {
                name: '',
                startURL: '',
                viewports: [],
                dayFrequency: [],
                hourFrequency: [],
                depth: null,
                blacklist: '',
                whitelist: '',
                threshold: ''
            };

            window.setTimeout(redirect, 2000);
        }).then(null, function(err) {
            console.log(err);
        });
    };

    function redirect() {
        $state.go('admin.dashboard');
    };

    Dashboard.getTestsByUserID(currentUser._id)
        .then(function (tests) {
            tests.forEach(function(test) {

            });
            $scope.testsByUserID = tests;
        })
        .catch(function (err) {
            return err;
        });


    Dashboard.getTests(currentUser._id)
        .then(function (tests) {
            $scope.tests = tests;
        })
        .catch(function (err) {
            return err;
        });

        $scope.oneAtATime = true;

});


