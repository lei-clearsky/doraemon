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
    $scope.alertsByDate = null;
    $scope.allDiffsByUser = allDiffsByUser;

    // display alert details by date
    var displayAlertsByDate = function () {
        var uniqueDatesObj = Dashboard.getUniqueDates($scope.allDiffsByUser, MathUtils);
        var days = uniqueDatesObj.days;
        var dates = uniqueDatesObj.dates;
        var byDateObj = Dashboard.getByDateBaseObj(dates, days);
        byDateObj = Dashboard.getByDateObj($scope.allDiffsByUser, dates, byDateObj, MathUtils);

        $scope.alertsByDate = byDateObj;   
    };
    $scope.openAlertModal = Modal.openModal;
    displayAlertsByDate();
});

app.controller('AlertModalCtrl', function ($http, $scope, $modalInstance, viewDiff) {
    
    $scope.diffInfo = viewDiff;
    // $scope.imgCaptureInfo = viewImgCapture;
  
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


























