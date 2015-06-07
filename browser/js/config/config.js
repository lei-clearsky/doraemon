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

app.controller('ConfigCtrl', function ($scope, Config) {

    $scope.site = '';

    $scope.config = {
            urls: [{
                id: 'url1'
            }],
            URL: 'http://www.happy.com',
            viewport: null,
            dayFrequency: [5],
            hourFrequency: [11]
    };

    $scope.addNewUrl = function() {
        var newUrl = $scope.config.urls.length + 1;
        $scope.config.urls.push({'id': 'url' + newUrl});
    };

    $scope.showAddUrl = function(url) {
        return url.id === $scope.config.urls[$scope.config.urls.length-1].id;
    };

    $scope.showUrlLabel = function(url) {
        return url.id === $scope.config.urls[0].id;
    };

    $scope.submit = function() {

        // $scope.config.urls.forEach(function (url, index) {
        //     url.url = $scope.site + url.url;
        // });

        Config.create($scope.config);
    };

});

























