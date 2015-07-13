'use strict';
app.directive('circleChart', function () {

    return {
        restrict: 'A',
        templateUrl: 'js/common/directives/circle-chart/circle-chart.html',
        scope: {
            circleTitle: '@',
            statsNum: '=',
            circleCurrent: '=',
            circleMax: '='
        },
        link: function (scope, element, attrs) {
            
        }
    };

});
