'use strict';
app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/about',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html'
    });

});

app.controller('AboutController', function ($scope) {

    $scope.contactInfo = [
        {
            name: 'Norman Chou',
            linkedIn: 'https://www.linkedin.com/in/chounorman',
            github: 'https://github.com/normchou'
        },
        {
            name: 'Lei Zhu',
            linkedIn: 'https://www.linkedin.com/in/leizhu1',
            github: 'https://github.com/lei-clearsky'
        },
        {
            name: 'Sean Kim',
            linkedIn: 'https://www.linkedin.com/pub/sean-kim/29/627/a3a',
            github: 'https://github.com/nogever'
        },
        {
            name: 'Victor Atteh',
            linkedIn: 'https://www.linkedin.com/pub/victor-atteh/71/87/2a6',
            github: 'https://github.com/vatteh'
        }
    ];

});