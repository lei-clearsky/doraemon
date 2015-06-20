app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/sign-up/sign-up.html',
        controller: 'SignUpCtrl'
    });

});

app.controller('SignUpCtrl', function ($scope, AuthService, $state, SignUpFactory) {

    $scope.error = null;
    $scope.signup = {};

    $scope.sendSignup = function (signup) {

        $scope.error = null;

        SignUpFactory.signupNewUser(signup)
	        .then(function(user) {
	        	$state.go('home');	
	        	AuthService.login(signup);
	        	// return AuthService.getLoggedInUser();
	        })
	        .catch(function(err) {
	        	$scope.error = 'Sign up form not completed/filled correctly!';
	        	console.error(err);
	        });
    };

});
