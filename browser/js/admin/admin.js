'use strict';

app.config(function ($stateProvider) {
    $stateProvider.state('admin', {
        url: '/admin',
        controller: 'AdminController',
        templateUrl: 'js/admin/admin.html'
    });
});

app.controller('AdminController', function ($scope, $rootScope, AuthService) {
    
    $rootScope.stateClass = 'admin';

    // admin menus
    $scope.adminMenus = [
        {'name': 'Dashboard', 'state': 'admin.dashboard', 'icon': 'fa fa-tachometer'},
        {'name': 'Config Form', 'state': 'admin.config', 'icon': 'fa fa-pencil-square'},
        {'name': 'Team', 'state': 'admin.team', 'icon': 'fa fa-users'},
        {'name': 'Alerts', 'state': 'admin.alert', 'icon': 'fa fa-exclamation-triangle'}

    ];

});