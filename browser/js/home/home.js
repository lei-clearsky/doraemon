'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html',
        controller: 'HomeController'
    });
});

app.controller('HomeController', function($scope, $rootScope) {

	$rootScope.stateClass = 'home';
	$scope.contactInfo = [
        {
            name: 'Norman Chou',
            linkedIn: 'https://www.linkedin.com/in/chounorman',
            github: 'https://github.com/normchou',
            imgSrc: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/7/005/034/10c/340ebe1.jpg'
        },
        {
            name: 'Lei Zhu',
            linkedIn: 'https://www.linkedin.com/in/leizhu1',
            github: 'https://github.com/lei-clearsky',
            imgSrc: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/7/005/015/1ab/30ac588.jpg'
        },
        {
            name: 'Sean Kim',
            linkedIn: 'https://www.linkedin.com/pub/sean-kim/29/627/a3a',
            github: 'https://github.com/nogever',
            imgSrc: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/5/005/081/106/07d9a32.jpg'
        },
        {
            name: 'Victor Atteh',
            linkedIn: 'https://www.linkedin.com/pub/victor-atteh/71/87/2a6',
            github: 'https://github.com/vatteh',
            imgSrc: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/5/000/25b/013/1516d12.jpg'
        }
    ];

});