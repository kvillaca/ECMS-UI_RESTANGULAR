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
                                      getSearchResultsService,
                                      searchErrorService,
                                      goTo,
                                      $q,
                                      spinner,
                                      $timeout,
                                      terminate,
                                      Restangular,
                                      paramsToString,
                                      signout,
                                      getIPService) {

        var mainScope = this;   // alias for this controller

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
            $scope.codeMirrorArea = null;
        };


        /**
         * Clears search results from current state- This should be in the search controller
         */
        $scope.clearSearchResults = function () {
            $rootScope.state.searchResults = [];
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


        /**********************************************
         * EVERYTHING from here down should be in a search controller.
         * SEARCH QUERY
         **********************************************/

        /**
         * Submits the search query
         * @param input
         */

        ///**
        // * @TODO - move to Search controller
        // * @param input
        // */
        //$scope.submitQuery = function (input) {
        //
        //    $rootScope.state.errorMessage = '';
        //    $rootScope.state.pageNumber = 1;
        //    $scope.clearDocument();
        //
        //    var paramsValue = {
        //        limit: $rootScope.state.pageSize,
        //        offset: ($rootScope.state.pageNumber - 1) * $rootScope.state.pageSize,
        //        query: $rootScope.state.searchQuery
        //    };
        //
        //    $scope.spinnerOn();
        //
        //    Restangular.setDefaultHeaders({
        //        'X-ECMS-Session': ecmsSession.getSession(),
        //        'Content-Type': 'application/json'
        //    });
        //    Restangular.all('v1/documents?' + makeParams.paramList(paramsValue)).
        //        customGET('DocumentSearch').
        //        then(function (resp) {
        //            $scope.spinnerOff();
        //            $rootScope.state.searchResults = resp.data.DocumentSearch.SearchHit;
        //            $rootScope.state.totalItems = resp.data.DocumentSearch.TotalHits;
        //            if ($rootScope.state.searchResults && $rootScope.state.searchResults.length) {
        //                $rootScope.state.searchResults = mainScope.tailorData($rootScope.state.searchResults);
        //                $rootScope.state.indexRange = [($rootScope.state.pageNumber - 1) * $rootScope.state.pageSize + 1, Math.min($rootScope.state.pageNumber * $rootScope.state.pageSize, $rootScope.state.totalItems)];
        //                //$rootScope.$broadcast('resizeGrid');
        //                goTo.go('search.results');
        //            } else {
        //                $rootScope.state.errorMessage = searchErrorService.getErrorMessage('noResultsFound');
        //                $scope.clearSearchResults();
        //                goTo.go('search.input');       // probably temporary
        //            }
        //            $scope.spinnerOff();
        //        }, function (fail) {
        //            $timeout(function () {
        //                $rootScope.state.errorMessage = searchErrorService.getErrorMessage('badHeaders');
        //                $scope.clearSearchResults();
        //                $scope.goTo('search.input');       // probably temporary
        //                console.log(fail);
        //                $scope.spinnerOff();
        //            });
        //        });
        //    //}
        //};



        /**
         * Grabs a fresh set of search results from the backend
         * This is used when changes are made to a document and the search results view grid needs to be updated with those new changes
         * This is an abridged version of submitQuery method
         */
        /**
         * @TODO - move to service for global use
         * @param input
         */
        $scope.updateSearchResults = function () {

            var deferred = $q.defer();

            function getSearchResultsSuccess(result) {

                $rootScope.state.searchResults = result.data.DocumentSearch.SearchHit;
                $rootScope.state.totalItems = result.data.DocumentSearch.TotalHits;

                if ($rootScope.state.searchResults && $rootScope.state.searchResults.length) {
                    $rootScope.state.searchResults = tailorData.data($rootScope.state.searchResults);
                    $rootScope.state.indexRange = [($rootScope.state.pageNumber - 1) * $rootScope.state.pageSize + 1, Math.min($rootScope.state.pageNumber * $rootScope.state.pageSize, $rootScope.state.totalItems)];
                    deferred.resolve($rootScope.state.searchResults);
                }
                else {
                    $rootScope.state.errorMessage = searchErrorService.getErrorMessage('noResultsFound');
                    $scope.clearSearchResults();
                    deferred.reject('updateSearchResults error');
                }
            }

            function getSearchResultsError(error) {
                // error!
                $rootScope.state.errorMessage = searchErrorService.getErrorMessage('badHeaders');
                $scope.clearSearchResults();
                console.log(error);
                deferred.reject(error);
            }

            getSearchResultsService.getResults($rootScope.state.searchQuery, $rootScope.state.pageNumber, $rootScope.state.pageSize)
                .then(getSearchResultsSuccess, getSearchResultsError);

            return deferred.promise;
        };


        $rootScope.$on('signout', function () {
            toDefaultState.setToDefaultState();
            updateSession.session($rootScope.state);
            signout.out();
        });
    });
