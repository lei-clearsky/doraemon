'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('admin.alert', {
        url: '/alert',
        templateUrl: 'js/admin/alert/alert.html',
        controller: 'AlertCtrl',
        resolve: {
            currentUser: function(AuthService) {
                return AuthService.getLoggedInUser()
                            .catch(function (err) {
                                console.log(err);
                            });
            },
            allDiffsByUser: ['currentUser', 'Dashboard', function(currentUser, Dashboard) {
                return Dashboard.allDiffsByUser(currentUser._id)
                            .catch(function (err) {
                                console.log(err);
                            });
            }]
        }
    });

});

app.controller('AlertCtrl', function ($scope, MathUtils, Modal, Dashboard, allDiffsByUser, $modal, currentUser, $rootScope) {
    $rootScope.stateClass = 'alerts';
    $scope.alertsByDate = Dashboard.displayByDate(allDiffsByUser, MathUtils);
    $scope.allDiffsByUser = allDiffsByUser;
    $scope.openAlertModal = Modal.openModal;
});

app.controller('AlertModalCtrl', function ($http, $scope, $modalInstance, viewDiff) {
    
    $scope.diffInfo = viewDiff;
    // $scope.imgCaptureInfo = viewImgCapture;
  
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


























