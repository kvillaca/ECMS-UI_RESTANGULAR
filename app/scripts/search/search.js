'use strict';

/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.controller:SearchCtrl
 * @description
 * Main Controller of the search logic
 */
angular.module('ecmsEcmsUiApp')
    .controller('SearchCtrl', function () { //$scope, $rootScope, $window, goTo, updateDocumentInfo

        //var $this = this;   // alias for this controller

        //$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState) {
        //    switch (toState.name) {
        //        case 'search.input':
        //        case 'search':
        //            goTo.go('search.input');
        //            break;
        //        case 'search.results':
        //            if (!fromState.name || fromState.name === 'search.results') {
        //                goTo.go('search.input');
        //            }
        //            else {
        //                goTo.go('search.results');
        //            }
        //            break;
        //        case 'search.doc':
        //            $scope = updateDocumentInfo.update(toParams.id);
        //            goTo.go('search.doc', {id: toParams.id});
        //            angular.element($window).scrollTop (0);
        //            break;
        //    }
        //});
    });
