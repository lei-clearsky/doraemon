'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('config', {
        url: '/config',
        templateUrl: 'js/config/config.html',
        controller: 'ConfigCtrl'
    });

});

app.factory('Config', function ($http) {

    return {
        create: function (config) {
            return $http.post('/api/test-config', config).then(function (response) {
                return response.data;
            });
        }
    };

});

app.value('viewportOptions', ['640x360', '1024x768', '1280x800', '1680x1050']);

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
    {label: '12 am', value: 0},
    {label: '1 am', value: 1},
    {label: '2 am', value: 2},
    {label: '3 am', value: 3},
    {label: '4 am', value: 4},
    {label: '5 am', value: 5},
    {label: '6 am', value: 6},
    {label: '7 am', value: 7},
    {label: '8 am', value: 8},
    {label: '9 am', value: 9},
    {label: '10 am', value: 10},
    {label: '11 am', value: 11},
    {label: '12 pm', value: 12},
    {label: '1 pm', value: 13},
    {label: '2 pm', value: 14},
    {label: '3 pm', value: 15},
    {label: '4 pm', value: 16},
    {label: '5 pm', value: 17},
    {label: '6 pm', value: 18},
    {label: '7 pm', value: 19},
    {label: '8 pm', value: 20},
    {label: '9 pm', value: 21},
    {label: '10 pm', value: 22},
    {label: '11 pm', value: 23}
]);

app.controller('ConfigCtrl', function ($scope, Config, viewportOptions, dayFrequencyOptions, hourFrequencyOptions) {

    $scope.name = '';
    $scope.config = [];
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

    $scope.submit = function() {
        if (isValid()) {
            $scope.config.forEach(function(element) {
                element.viewports.forEach(function(viewport) {
                    Config.create({
                        name: $scope.name,
                        URL: element.URL,
                        viewport: viewport,
                        dayFrequency: element.dayFrequency,
                        hourFrequency: element.hourFrequency
                    });
                });                
            });

            $scope.name = '';
            $scope.config = [];
            $scope.showSuccessAlert = true;
        } else {
            $scope.showErrorAlert = true;
        }        
    };

    function isValid() {

        if ($scope.name === '') {
            $scope.errorMessage = "Please enter a UI test name";
            return false;
        }

        if ($scope.config.length === 0) {
            $scope.errorMessage = "You need to test at least one URL";
            return false;
        }

        for (var i = 0; i < $scope.config.length; i++) {
            if ($scope.config[i].URL === '') {
                $scope.errorMessage = "Please fill the URL field";
                return false;
            }

            if ($scope.config[i].viewports.length === 0) {
                $scope.errorMessage = "Please choose a viewport to test this URL";
                return false;
            }

            if ($scope.config[i].dayFrequency.length === 0) {
                $scope.errorMessage = "Please choose which days to test this URL";
                return false;
            }

            if ($scope.config[i].hourFrequency.length === 0) {
                $scope.errorMessage = "Please choose a time to test this URL";
                return false;
            }

            if ($scope.config[i].hourFrequency.length > 4) {
                $scope.errorMessage = "Please limit times to test a URL to 4";
                return false;
            }
        };

        return true;
    };
});