'use strict';

/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Main controller of the ecmsEcmsUiApp. Takes care of authentication
 */
angular.module('ecmsEcmsUiApp')

    .controller('MainCtrl', function ($scope,
                                      $rootScope,
                                      $state,
                                      tailorData,
                                      $sessionStorage,
                                      toggleFeatures,
                                      ecmsSession,
                                      updateSession,
                                      toDefaultState,
                                      gridOptions,
                                      $q,
                                      $timeout,
                                      terminate,
                                      Restangular,
                                      paramsToString,
                                      spinner,
                                      goTo,
                                      signout,
                                      clearSearchResults,
                                      getIPService) {

        // Scope defaults
        $rootScope.loginError = false;
        $rootScope.userLoggedIn = ecmsSession.getUserLoggedIn() || false;
        $rootScope.credentials = {
            username: null,
            password: null,
            rememberMe: false
        };
        $rootScope.codeMirrorArea = null;


        /*****************************************
         * GET IP ADDRESS
         ****************************************/

        /**
         * Get client's IP address
         * Will be used in authentication
         */

        function ipSuccess(response) {
            $rootScope.IP = response.data.ip;
        }

        function ipError(error) {
            console.log(error);
            $rootScope.IP = 'N/A';
        }

        getIPService.getIP()
            .then(ipSuccess, ipError);


        spinner.off();


        /***********************************************
         * STATE
         ***********************************************/

        /**
         * Clears document from current state- This should be in the doc controller
         */
        $scope.clearDocument = function () {
            $rootScope.state.currentDocument = {};
            $rootScope.state.rawXML = null;
            $rootScope.state.dirtyRawXML = false;
            $rootScope.codeMirrorArea = null;
        };

        $scope.goTo = function(destination) {
            if (destination === 'doc') {
                goTo.to(destination, {id: $rootScope.state.currentDocument.id});
            } else {
                goTo.to(destination);
            }

        };


        /*
         * This method will eventually check with the backend if any part of the document
         * has been changed. For now, it just relies on Angular's $pristine/$dirty for that
         * for this work well it's needed to add the form that is $dirty, e.g.: $scope.<myFormName>.$dirty
         */
        $scope.isDirty = function () {

            /**
             * @todo - REST API call to check whether the document has been touched
             */

            //return $scope.editorForm.$dirty;
            return $rootScope.state.dirtyRawXML;
        };

        /**
         * - This should be in the doc controller
         * Actions performed in the action bar on document view change the state of the application
         * These are executed by DocCtrl (doc.js)
         *
         *
         *
         * This code could go to a Factory file, as it will just produce some call based on an input
         *
         *
         *
         * @param action
         */
        $scope.action = function (action) {

            // prevent action while we're executing another action
            if ($scope.loading) {
                return;
            }

            switch (action) {
                case 'closeDocument':
                    $rootScope.$broadcast('closeDocument');
                    break;
                case 'reloadDocument':
                    $rootScope.$broadcast('reloadDocument');
                    break;
                case 'validateDocument':
                    $rootScope.$broadcast('validateDocument');
                    break;
                case 'updateDocument':
                    $rootScope.$broadcast('updateDocument');
                    break;
                case 'goNext':
                    $rootScope.$broadcast('goNext');
                    break;
                case 'goPrev':
                    $rootScope.$broadcast('goPrev');
                    break;
            }
        };


        $scope.signOut = function () {
            signout.out();
        };

        $rootScope.$on('signout', function () {
            $scope.signOut();
        });
    });
