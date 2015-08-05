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
                                      $sessionStorage,
                                      toggleFeatures,
                                      ecmsSession,
                                      updateSession,
                                      gridOptions,
                                      getSearchResultsService,
                                      searchErrorService,
                                      goTo,
                                      $q,
                                      $timeout,
                                      terminate,
                                      Restangular,
                                      getIPService) {

        var $this = this;   // alias for this controller

        // Scope defaults
        $scope.loginError = false;
        $scope.userLoggedIn = ecmsSession.getUserLoggedIn() || false;
        $scope.credentials = {
            username: null,
            password: null,
            rememberMe: false
        };
        $scope.codeMirrorArea = null;


        /**
         * All to default state
         */
        $scope.toDefaultState = function () {
            $rootScope.state = {
                showActionBar: false,
                showNavBar: false,
                currentView: 'login',
                currentDocument: {},
                errorBox: null,
                errorMessage: null,
                searchQuery: null,
                searchResults: [],
                pageNumber: 1,
                pageSize: gridOptions.pageSize,
                pageSizes: gridOptions.pageSizes,
                totalItems: null,
                rawXML: null,
                dirtyRawXML: false
            };
        };



        /**
         * Toggle scope variables on view change -
         *
         * leaving this one here just to keep everything else working
         *
         * @param view
         */
        //$scope.toggleFeatures = function (view) {
        //    $rootScope.state.currentView = view;
        //
        //    // toggle features per the view we're loading
        //    switch (view) {
        //        case 'login':
        //            $scope.toDefaultState();
        //            break;
        //        case 'search.input':
        //            $rootScope.state.showNavBar = true;
        //            $rootScope.state.showActionBar = false;
        //            $rootScope.$broadcast('updateNavbar', 'input');
        //            break;
        //        case 'search.results':
        //            $rootScope.state.showNavBar = true;
        //            $rootScope.state.showActionBar = false;
        //            $rootScope.$broadcast('resizeGrid');
        //            $rootScope.$broadcast('updateNavbar', 'results');
        //            break;
        //        case 'search.doc':
        //            $rootScope.state.showNavBar = true;
        //            $rootScope.state.showActionBar = true;
        //            $rootScope.$broadcast('updateNavbar', 'doc');
        //            break;
        //    }
        //    updateSession.session($rootScope.state);
        //};


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


        /****************************************
         * TRANSITION SPINNER
         ***************************************/

            // hide spinner initially
        $scope.loading = false;

        $scope.spinnerOn = function () {
            $scope.loading = true;
        };

        $scope.spinnerOff = function () {
            $scope.loading = false;
        };


        /***********************************************
         * STATE
         ***********************************************/

            // App state defaults
        //$rootScope.state = $sessionStorage.lastState || {
        //        showActionBar: false,
        //        showNavBar: false,
        //        currentView: 'login',
        //        currentDocument: {},
        //        errorBox: null,
        //        errorMessage: null,
        //        searchQuery: null,
        //        searchResults: [],
        //        pageNumber: 1,
        //        pageSize: gridOptions.pageSize,
        //        pageSizes: gridOptions.pageSizes,
        //        totalItems: null,
        //        rawXML: null,
        //        dirtyRawXML: false
        //    };


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

        ///**
        // * Goes to new view
        // */
        $scope.goTo = function (newView, options) {

            toggleFeatures.toggle(newView);

            if (options) {
                $state.go(newView, options);
            }
            else {
                if (newView === 'search.doc') {
                    $state.go(newView, {id: $rootScope.state.currentDocument.id});
                }
                else {
                    $state.go(newView);
                }
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



        /**********************************************
         * EVERYTHING from here down should be in a search controller.
         * SEARCH QUERY
         **********************************************/

        /**
         * Submits the search query
         * @param input
         */
        $scope.submitQuery = function (input) {

            $rootScope.state.errorMessage = '';
            $rootScope.state.pageNumber = 1;
            $scope.clearDocument();

            var paramsValue = {
                limit: $rootScope.state.pageSize,
                offset: ($rootScope.state.pageNumber - 1) * $rootScope.state.pageSize,
                query: $rootScope.state.searchQuery
            };

            // check if input is at least 3 characters - This validation must happen in the UI
            // We can remove this checking as we can guarantee that it wil have at least 3 chars
            // with the new validation in the UI, that's the reason I'm commenting the code.
            //var inputValidator = $this.isValidInput(input);
            //if (inputValidator.error) {
            //    $rootScope.state.errorMessage = inputValidator.error;
            //}
            //else {  // input is ok, proceed with getting search results
                $rootScope.state.searchQuery = input.trim();
                $scope.spinnerOn();

                Restangular.setDefaultHeaders({
                  'X-ECMS-Session': ecmsSession.getSession(),
                    'Content-Type': 'application/json'
                });
                //Restangular.all('v1/documents?' + $.param(paramsValue)).
                Restangular.all('v1/documents?' + $this.makeParams(paramsValue)).
                    customGET('DocumentSearch').
                    then(function (resp) {
                            $scope.spinnerOff();
                            $rootScope.state.searchResults = resp.data.DocumentSearch.SearchHit;
                            $rootScope.state.totalItems = resp.data.DocumentSearch.TotalHits;
                            if ($rootScope.state.searchResults && $rootScope.state.searchResults.length) {
                                $rootScope.state.searchResults = $this.tailorData($rootScope.state.searchResults);
                                $rootScope.state.indexRange = [($rootScope.state.pageNumber - 1) * $rootScope.state.pageSize + 1, Math.min($rootScope.state.pageNumber * $rootScope.state.pageSize, $rootScope.state.totalItems)];
                                $rootScope.$broadcast('resizeGrid');
                                $scope.goTo('search.results');
                            } else {
                                $rootScope.state.errorMessage = searchErrorService.getErrorMessage('noResultsFound');
                                $scope.clearSearchResults();
                                $scope.goTo('search.input');       // probably temporary
                            }
                            $scope.spinnerOff();
                }, function (fail) {
                    $timeout(function () {
                        $rootScope.state.errorMessage = searchErrorService.getErrorMessage('badHeaders');
                        $scope.clearSearchResults();
                        $scope.goTo('search.input');       // probably temporary
                        console.log(fail);
                        $scope.spinnerOff();
                    });
                });
            //}
        };

        $this.makeParams = function (paramsValue) {
            var params = '';
            for (var i in paramsValue) {
                params += i + '=' + paramsValue[i] + '&';
            }
            params = params.substring(0, params.length - 1);    // remove last &
            return params;
        };

        /**
         * Grabs a fresh set of search results from the backend
         * This is used when changes are made to a document and the search results view grid needs to be updated with those new changes
         * This is an abridged version of submitQuery method
         */
        $scope.updateSearchResults = function () {

            var deferred = $q.defer();

            function getSearchResultsSuccess(result) {

                $rootScope.state.searchResults = result.data.DocumentSearch.SearchHit;
                $rootScope.state.totalItems = result.data.DocumentSearch.TotalHits;

                if ($rootScope.state.searchResults && $rootScope.state.searchResults.length) {
                    $rootScope.state.searchResults = $this.tailorData($rootScope.state.searchResults);
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

        /**
         * Checks if the user typed valid input
         * This is where a REST API will be plugged in to make any checks.
         * For now, just check if input is not an empty string and at least 3 chars long
         * @param input
         * @returns {*}
         *
         * Plase check the search-input.html fragment to see how to validate min and max length and siplay messages!
         *
         */
        $this.isValidInput = function (input) {

            if (!input || input.trim().length < 3) {
                return {error: searchErrorService.getErrorMessage('shortSearchQuery')};
            }
            else {
                /**
                 * Here we need real API validation
                 */
                return true;
            }
        };


        /*****************************************
         * SIGN OUT
         *****************************************/
        $scope.signOut = function () {
            $scope.loginError = false;
            $scope.userLoggedIn = false;
            $sessionStorage.userLoggedIn = false;
            terminate();
            $scope.credentials = {
                username: null,
                password: null,
                rememberMe: false
            };
            $state.go('login');
            toggleFeatures.toggle('login');
        };

        $rootScope.$on('signout', function () {
            $scope.toDefaultState();
            updateSession.session($rootScope.state);
        });



        /**
         * Takes data from the server and puts it in this format:
         * [ {fieldName1: value1 , fieldName2: value2, fieldName3: value3, ... }, { ... }, { ... } ]
         * It also "extends" each the returned data row by adding an index property (1-based)
         * The index property is to be used for Prev/Next logic
         * @param dataIn
         */
        $this.tailorData = function (dataIn) {

            var returnObject = [];

            for (var i in dataIn) {
                var row = dataIn [i];

                var fields = row.HitField;
                var thisRow = {};

                for (var j in fields) {
                    var field = fields[j];

                    var name = field.FieldName;
                    var value = field.Text[0];

                    thisRow[name] = value;
                }

                // extend properties to include search order index
                thisRow.searchResultIndex = (($rootScope.state.pageNumber - 1) * $rootScope.state.pageSize) + parseInt(i) + 1; // weee!

                // row is ready to pass to the grid
                returnObject.push(thisRow);
            }
            return returnObject;
        };
    });
