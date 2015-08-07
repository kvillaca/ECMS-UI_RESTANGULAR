'use strict';

/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.controller:SearchCtrl
 * @description
 * Main Controller of the search logic
 */
angular.module('ecmsEcmsUiApp')
    .controller('SearchCtrl', function ($scope, goTo) { //$scope, $rootScope, $window, goTo, updateDocumentInfo

        // I don't know if it will work for the header yet, it still need to be tested
        $scope.goTo = function(valueForSeach) {
            goTo.go(valueForSeach);
            toggleFeatures.toggle(valueForSeach);
        }

    });
