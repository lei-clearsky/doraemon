'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('config', {
        url: '/config',
        templateUrl: 'js/config/config.html',
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

app.controller('ConfigCtrl', function ($scope, Config, currentUser, viewportOptions, dayFrequencyOptions, hourFrequencyOptions) {

    $scope.submitAttempted = false;
    $scope.testName = '';
    $scope.config = [{
            URL: '',
            viewports: [],
            dayFrequency: [],
            hourFrequency: []
        }];
    $scope.viewportOptions = viewportOptions;
    $scope.dayFrequencyOptions = dayFrequencyOptions;
    $scope.hourFrequencyOptions = hourFrequencyOptions;
    
    $scope.showSuccessAlert = false;
    $scope.showErrorAlert = false;
    $scope.errorMessage = "Please fill all options";

    $scope.addNewUrl = function() {
        $scope.config.push({
            URL: '',
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

        if ($scope.testName === '') return false;

        for (var i = 0; i < $scope.config.length; i++) {
            if ($scope.config[i].URL === '') return false;

            if ($scope.config[i].viewports.length === 0) return false;

            if ($scope.config[i].dayFrequency.length === 0) return false;

            if ($scope.config[i].hourFrequency.length === 0) return false;
        };

        return true;
    };

    $scope.submit = function() {
        
        $scope.config.forEach(function(element) {
            element.viewports.forEach(function(viewport) {
                Config.create({
                    name: $scope.testName,
                    URL: element.URL,
                    viewport: viewport,
                    dayFrequency: element.dayFrequency,
                    hourFrequency: element.hourFrequency,
                    userID: currentUser._id
                });
            });                
        });

        $scope.testName = '';
        $scope.config = [{
            URL: '',
            viewports: [],
            dayFrequency: [],
            hourFrequency: []
        }];
        $scope.showSuccessAlert = true;
        $scope.submitAttempted = false;

    };
});