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
            return $http.post('/api/diffing', config).then(function (response) {
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
        }]
    };

    $scope.addNewUrl = function() {
        var newUrl = $scope.urls.length + 1;
        $scope.urls.push({'id': 'url' + newUrl});
    };

    $scope.showAddUrl = function(url) {
        return url.id === $scope.urls[$scope.urls.length-1].id;
    };

    $scope.showUrlLabel = function(url) {
        return url.id === $scope.urls[0].id;
    };

    $scope.submit = function() {

        $scope.config.urls.forEach(function (url, index) {
            url = $scope.site + url;
        });

        Config.create($scope.config);
    }

});

























