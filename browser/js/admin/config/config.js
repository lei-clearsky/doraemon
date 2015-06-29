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

app.controller('ConfigCtrl', function ($scope, Config, currentUser, viewportOptions, dayFrequencyOptions, hourFrequencyOptions, maxDepthOptions, Dashboard, $rootScope) {
    $rootScope.stateClass = 'config';
    $scope.submitAttempted = false;
    $scope.configTest = {};
    $scope.configBulkTest = {};
    $scope.config = [{
            path: '',
            threshold: null,
            viewports: [],
            dayFrequency: [],
            hourFrequency: [],
            depth: []
        }];
    $scope.viewportOptions = viewportOptions;
    $scope.dayFrequencyOptions = dayFrequencyOptions;
    $scope.hourFrequencyOptions = hourFrequencyOptions;
    $scope.maxDepthOptions = maxDepthOptions;
    
    $scope.showSuccessAlert = false;
    $scope.showErrorAlert = false;
    $scope.errorMessage = "Please fill all options";
    $scope.testsByUserID = [];

    $scope.addNewUrl = function() {
        $scope.config.push({
            path: '',
            threshold: null,
            viewports: [],
            dayFrequency: [],
            hourFrequency: []
        });
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

        // if ($scope.testName === '') return false;

        // for (var i = 0; i < $scope.config.length; i++) {
        //     if (($scope.config[i].URL === '') || 
        //         ($scope.config[i].viewports.length === 0) ||
        //         ($scope.config[i].dayFrequency.length === 0) ||
        //         ($scope.config[i].hourFrequency.length === 0) ||
        //         ($scope.config[i].path === '') ||
        //         ($scope.config[i].threshold <= 0)) {
        //         return false;
        //     }
        // };
        return true;
    };

    $scope.submit = function() {
        $scope.config.forEach(function(element) {
            element.viewports.forEach(function(viewport) {
                console.log('foreach: ', viewport);
                Config.create({
                    name: $scope.configTest.name.split(' ').join('_'),
                    URL: 'http://' + $scope.configTest.rootURL + element.path,
                    devURL: 'http://' + $scope.configTest.devURL,
                    rootURL: 'http://' + $scope.configTest.rootURL,
                    threshold: element.threshold,
                    viewport: viewport,
                    dayFrequency: element.dayFrequency,
                    hourFrequency: element.hourFrequency,
                    userID: currentUser._id
                });
            });                
        });

        $scope.configTest = {};
        $scope.config = [{
            path: '',
            threshold: null,
            viewports: [],
            dayFrequency: [],
            hourFrequency: []
        }];
        $scope.showSuccessAlert = true;
        $scope.submitAttempted = false;

    };

    $scope.submitBulk = function() { 
        var object = {
            testName: $scope.configBulkTest.name.split(' ').join('_'),
            startURL: 'http://www.' + $scope.configBulkTest.startURL, 
            maxDepth: $scope.config[0].depth[0],
            blacklist: $scope.configBulkTest.blacklist,
            whitelist: $scope.configBulkTest.whitelist,
            threshold: $scope.configBulkTest.threshold,
            viewport: $scope.config[0].viewports,
            dayFrequency: $scope.config[0].dayFrequency,
            hourFrequency: $scope.config[0].hourFrequency,
            userID: currentUser._id
        };
        Config.createBulk(object);

        $scope.showSuccessAlert = true;
        $scope.submitAttempted = false;
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
            console.log('tests', tests)
            $scope.tests = tests
        })
        .catch(function (err) {
            return err;
        });



});






















