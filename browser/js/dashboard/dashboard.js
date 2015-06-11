'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('dashboard', {
        url: '/dashboard',
        templateUrl: 'js/dashboard/dashboard.html',
        controller: 'DashboardCtrl'
    });

});

app.factory('Dashboard', function ($http) {

    return {
        getOne: function (id) {
            return $http.get('/api/screenshots/' + id).then(function (response) {
                return response.data;
            });
        }
    };

});

app.controller('DashboardCtrl', function ($scope, Dashboard) {
    $scope.keys = ['myKey.jpg', 'test1.png', 'test3.png'];

    $scope.screenshots = $scope.keys.map(function(key) {
        return 'https://s3.amazonaws.com/capstone-doraemon/' + key;
    });
    

});

























