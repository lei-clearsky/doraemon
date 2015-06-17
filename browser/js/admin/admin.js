'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('admin', {
        url: '/admin',
        controller: 'AdminController',
        templateUrl: 'js/admin/admin.html'
    });
});

app.controller('AdminController', function ($scope, AuthService) {

    // admin menus
    $scope.adminMenus = [
        {'name': 'Dashboard', 'state': 'admin.dashboard'},
        {'name': 'Projects', 'state': 'admin.project'},
        {'name': 'Alerts', 'state': 'admin.alerts'}
    ];

});