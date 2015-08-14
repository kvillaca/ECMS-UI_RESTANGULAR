'use strict';

/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.controller:SearchCtrl
 * @description
 * Controller of the ecmsEcmsUiApp search page
 */
angular.module('ecmsEcmsUiApp')
    .controller('SearchInputCtrl', function ($scope,
                                             $rootScope,
                                             toggleFeatures,
                                             ecmsSession,
                                             updateSession,
                                             searchErrorService,
                                             goTo,
                                             paramsToString,
                                             tailorData,
                                             $timeout,
                                             Restangular,
                                             clearSearchResults,
                                             RESTAPIversion,
                                             spinner) {

        /**
         *
         * All clear forms could go to Factory or Service files and then be called from within the controller.
         *
         * Clears login form of any input
         * This is called on click inside an input box, like after an error
         */
        $scope.clearForm = function () {
            $rootScope.state.searchQuery = '';
            $rootScope.state.errorMessage = '';
            $rootScope.state.errorBox = null;
            $scope.clearDocument();
            if ($rootScope.state.currentView === 'search.input') {
                clearSearchResults.clear();
            }
            $rootScope.$broadcast('updateSearchInputHeight');
        };


        /**
         * When hitting enter/return in search field, submit form.
         * @param $event
         * @param search query
         */
        $scope.submitOnEnterKey = function ($event, searchQueryInput) {
            if ($event.keyCode === 13) {    // on Enter key
                $event.preventDefault();
                $scope.submitQuery(searchQueryInput);
            }
        };


        /**
         * @TODO - move to Search controller
         * @param input
         */
        $scope.submitQuery = function (input) {

            $rootScope.state.errorMessage = '';
            $rootScope.state.pageNumber = 1;
            $scope.clearDocument();

            $rootScope.state.searchQuery = input;

            var paramsValue = {
                limit: $rootScope.state.pageSize,
                offset: ($rootScope.state.pageNumber - 1) * $rootScope.state.pageSize,
                query: $rootScope.state.searchQuery
            };

            spinner.on();

            // Just have added the setDefaultHeaders due after pull the service has stopped to work.
            // Once it bo back to work it's just remove it!
            Restangular.setDefaultHeaders({
                'Content-Type': 'application/json',
                'X-ECMS-Session': ecmsSession.getSession()
            });

            //paramsToString.implode(paramsValue)
            Restangular.all(RESTAPIversion + '/documents').post(angular.toJson(paramsValue)).
                then(function (resp) {
                    $rootScope.state.searchResults = resp.data.DocumentSearch.SearchHit;
                    $rootScope.state.totalItems = resp.data.DocumentSearch.TotalHits;
                    if ($rootScope.state.searchResults && $rootScope.state.searchResults.length) {
                        $rootScope.state.searchResults = tailorData.data($rootScope.state.searchResults);
                        $rootScope.state.indexRange = [($rootScope.state.pageNumber - 1) * $rootScope.state.pageSize + 1, Math.min($rootScope.state.pageNumber * $rootScope.state.pageSize, $rootScope.state.totalItems)];
                        $rootScope.$broadcast('resizeGrid');
                        goTo.to('search.results');
                    } else {
                        $rootScope.state.errorMessage = searchErrorService.getErrorMessage('noResultsFound');
                        clearSearchResults.clear();
                        goTo.to('search.input');       // probably temporary
                    }
                    spinner.off();
                }, function (fail) {
                    $timeout(function () {
                        $rootScope.state.errorMessage = searchErrorService.getErrorMessage('badHeaders');
                        clearSearchResults.clear();
                        goTo.to('search.input');       // probably temporary
                        console.log(fail);
                        spinner.off();
                    });
                });
        };


    });
