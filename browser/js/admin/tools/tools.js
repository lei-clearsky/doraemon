'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('admin.tools', {
        url: '/tools',
        templateUrl: 'js/admin/tools/tools.html',
        controller: 'ToolsCtrl'
    });

});

app.controller('ToolsCtrl', function ($scope, $rootScope) {
    $rootScope.stateClass = 'tools';

});


























