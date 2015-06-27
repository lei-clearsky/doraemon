'use strict';
app.directive('lsBar', function (RandomGreetings) {

    return {
        restrict: 'A',
        templateUrl: 'js/common/directives/bar/bar.html',
        scope: {
            height: '=',
            dif: '='
        },
        link: function (scope, element, attrs) {
        	// console.log(scope.height);
            element.css('height', scope.height * 100 + 'px');
            element.addClass('ls-bar');
            // console.log('.............', scope.dif);
            // element.append('<p>' + scope.dif.websiteUrl + '</p>');
        }
    };

});