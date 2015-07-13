'use strict';
app.directive('statsTest', function () {

    return {
        restrict: 'A',
        templateUrl: 'js/common/directives/stats-test/stats-test.html',
        scope: {
            title: '@',
            stats: '='
        },
        link: function (scope, element, attrs) {
            
        }
    };

});