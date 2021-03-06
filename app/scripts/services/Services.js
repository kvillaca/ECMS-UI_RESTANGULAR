'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 * _Please update the description and dependencies._
 *
 * */
var app = angular.module('ecmsEcmsUiApp');


/**
 * Save state to session
 */
app.service('updateSession', function ($sessionStorage) {
    this.session = function (scopeState) {
        $sessionStorage.lastState = scopeState;
    };
});


/**
 * Terminate the app
 */
app.service('terminate', function ($rootScope, $sessionStorage, ecmsSession, updateRestangularHeaders, toDefaultState, updateSession) {
    return function () {

        toDefaultState.setToDefaultState();
        updateSession.session($rootScope.state);
        $rootScope.loginError = false;
        $rootScope.userLoggedIn = false;
        $sessionStorage.userLoggedIn = false;
        $rootScope.credentials = {
            username: null,
            password: null,
            rememberMe: false
        };

        $rootScope.sessionKey = null;
        delete $sessionStorage.session;

        ecmsSession.set(null, false);
        updateRestangularHeaders.removeSessionId();

    };
});


/**
 * Toggle scope variables on view change
 * @param view, scope variable
 * @return scope updated
 */
app.service('toggleFeatures', function ($rootScope, $state, updateSession, toDefaultState) {
    this.toggle = function (view) {
        $rootScope.state.currentView = view;
        // toggle features per the view we're loading
        switch (view) {
            case 'login':
                toDefaultState.setToDefaultState();
                break;
            case 'search.input':
            case 'search.results':
                $rootScope.state.showNavBar = true;
                $rootScope.state.showActionBar = false;
                break;
            case 'doc':
                $rootScope.state.showNavBar = true;
                $rootScope.state.showActionBar = true;
                break;
        }
        updateSession.session($rootScope.state);
    };

});


/**
 * goTo, redirect the URL for $urlRouterProvider
 */
app.service('goTo', function ($rootScope, $state, updateDocumentInfo, $window, toggleFeatures) {
    this.to = function (toState, toParams) {
        switch (toState) {
            case 'login':
            case 'search.results':
            case 'search.input':
            case 'search':
                $state.go(toState);
                break;
            case 'doc':
                var id = toParams ? toParams.id : $rootScope.state.currentDocument.id;
                $state.go(toState, {id: id});
                updateDocumentInfo.update(id);
                angular.element($window).scrollTop(0);
                break;
        }
        toggleFeatures.toggle (toState);
        $rootScope.$broadcast('updateNavbar');
    };
});


/**
 * Update the document information
 */
app.service('updateDocumentInfo', function ($rootScope) {
    this.update = function (id) {
        $rootScope.state.currentDocument.id = id;
        for (var i = 0; i < $rootScope.state.searchResults.length; i++) {
            var row = $rootScope.state.searchResults [i];
            if (row.documentid === id) {
                $rootScope.state.currentDocument.index = row.searchResultIndex;
                $rootScope.$broadcast('updateCurrentDocument');
                break;
            }
        }
    };
});


/**
 * Session from/to $sessionStorage - Get and Set.
 */
app.service('ecmsSession', function ($sessionStorage) {
    this.getSession = function () {
        return $sessionStorage.session;
    };

    this.getUserLoggedIn = function () {
        return $sessionStorage.userLoggedIn;
    };

    this.set = function (sessionToSet) {
        $sessionStorage.session = sessionToSet;
    };

    this.set = function (sessionToSet, userLoggedInToSet) {
        $sessionStorage.session = sessionToSet;
        $sessionStorage.userLoggedIn = userLoggedInToSet;
    };
});


/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.service:isPrivateService
 * @description returns True if the view is private and user is not logged in; False in all other cases
 */
app.service('isPrivateService', function (ecmsSession) {
    return {
        check: function (toState) {
            if (toState.name !== 'login' && !ecmsSession.getSession()) {
                if (toState.module === 'private') {
                    return true;
                }
            }
            return false;
        }
    };
});


/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.service:getIPService
 * @description retrieves data from the search endpoint
 */
app.service('getIPService', function ($http, $q) {
    return {
        getIP: function () {
            var requestUrl = 'http://freegeoip.net/json/';
            var deferred = $q.defer();
            var config = {
                url: requestUrl,
                headers: {'Content-Type': 'application/json'}
            };
            $http(config)
                .then(function (result) {
                    deferred.resolve(result);
                }, function () {
                    deferred.reject('getIPService error');
                });
            return deferred.promise;
        }
    };
});


/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.service:updateRestangularHeaders
 * @description updates headers in Restangular
 */
app.service('updateRestangularHeaders', function (Restangular) {
    return {
        addSessionId: function (sessionKey) {
            return Restangular.withConfig(function(RestangularConfigurer) {
                RestangularConfigurer.setDefaultHeaders({
                    'Content-Type': 'application/json',
                    'X-ECMS-Session': sessionKey
                });
            });
        },
        removeSessionId: function () {
            return Restangular.withConfig(function(RestangularConfigurer) {
                RestangularConfigurer.setDefaultHeaders({
                    'Content-Type': 'application/json'
                });
            });
        }
    };
});


/**
 * Takes data from the server and puts it in this format:
 * [ {fieldName1: value1 , fieldName2: value2, fieldName3: value3, ... }, { ... }, { ... } ]
 * It also "extends" each the returned data row by adding an index property (1-based)
 * The index property is to be used for Prev/Next logic
 * @param dataIn
 */
app.service('tailorData', function ($rootScope) {
    this.data = function (dataIn) {
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


/*****************************************
 * SIGN OUT
 *****************************************/
app.service('signout', function ($rootScope, $sessionStorage, terminate, $state, toggleFeatures, toDefaultState, updateSession, goTo) {
    this.out = function () {
        toDefaultState.setToDefaultState();
        updateSession.session($rootScope.state);
        $rootScope.loginError = false;
        $rootScope.userLoggedIn = false;
        $sessionStorage.userLoggedIn = false;
        $rootScope.credentials = {
            username: null,
            password: null,
            rememberMe: false
        };
        goTo.to('login');
    };

});


/**
 * Reset $rootScope.state
 */
app.service('toDefaultState', function ($rootScope, gridOptions) {
    return {
        setToDefaultState: function () {
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
                dirtyRawXML: false,
                tab: 'fielded'
            };
        }
    };
});


/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.service:updateRestangularHeaders
 * @description updates headers in Restangular
 */
app.service('paramsToString', function () {
    return {
        implode: function (object) {
            var params = '';
            for (var paramName in object) {
                params += paramName + '=' + object[paramName] + '&';
            }
            params = params.substring(0, params.length - 1);    // remove last &
            return params;
        }
    };
});


/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.service:spinner
 * @description toggles the loading spinner on and off
 */
app.service('spinner', function ($rootScope) {
    return {
        on: function () {
            $rootScope.loading = true;
        },
        off: function () {
            $rootScope.loading = false;
        }
    };
});


/**
 * Clears search results from current state- This should be in the search controller
 */
app.service('clearSearchResults', function ($rootScope) {
    this.clear = function () {
        $rootScope.state.searchResults = [];
    };
});


/**
 * Restangular update search
 */
app.service('updateSearchResults', function($rootScope, Restangular, paramsToString, ecmsSession, RESTAPIversion,
                                            goTo, tailorData, clearSearchResults, spinner, searchErrorService, $timeout){
    this.getResults = function() {
        $rootScope.state.errorBox = null;
        spinner.on();
        // Just have added the setDefaultHeaders due after pull the service has stopped to work.
        // Once it bo back to work it's just remove it!
        Restangular.setDefaultHeaders({
            'Content-Type': 'application/json',
            'X-ECMS-Session': ecmsSession.getSession()
        });

        $rootScope.state.errorMessage = '';
        $rootScope.state.currentDocument = {};
        $rootScope.state.rawXML = null;
        $rootScope.state.dirtyRawXML = false;
        $rootScope.codeMirrorArea = null;

        //$rootScope.state.searchQuery = input;

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
        Restangular.all(RESTAPIversion + '/documents?' + paramsToString.implode(paramsValue)).
            customGET('DocumentSearch').
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
                return true;
            }, function (fail) {
                $timeout(function () {
                    $rootScope.state.errorMessage = searchErrorService.getErrorMessage('badHeaders');
                    clearSearchResults.clear();
                    goTo.to('search.input');       // probably temporary
                    console.log(fail);
                    spinner.off();
                    return false;
                });
            });
    };
});
