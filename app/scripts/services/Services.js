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
app.service('updateSession', function($sessionStorage){
        this.session = function (scopeState) {
            $sessionStorage.lastState = scopeState;
        };
});


/**
 * Terminate
 */
app.service('terminate', function($rootScope, $sessionStorage, ecmsSession, updateRestangularHeaders) {
    return function() {
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
app.service('toggleFeatures', function($rootScope, $state, updateSession, redirect, toDefaultState){
    this.toggle = function (view) {
        $rootScope.state.currentView = view;
        // toggle features per the view we're loading
        switch (view) {
            case 'login':
                toDefaultState.setToDefaultState();
                break;
            case 'search.input':
                $rootScope.state.showNavBar = true;
                $rootScope.state.showActionBar = false;
                redirect.to('updateNavbar', 'input', undefined);
                break;
            case 'search.results':
                $rootScope.state.showNavBar = true;
                $rootScope.state.showActionBar = false;
                redirect.to('resizeGrid', undefined, undefined);
                redirect.to('updateNavbar', 'results', undefined);
                break;
            case 'search.doc':
                $rootScope.state.showNavBar = true;
                $rootScope.state.showActionBar = true;
                redirect.to('updateNavbar', 'doc', undefined);
                break;
        }
        updateSession.session($rootScope.state);
    };

});



/*
 * Redirect, to try avoid $broadcast and $on
 */
app.service('redirect', function($rootScope, goTo, updateDocumentInfo, $window) {
    this.to = function(toState, toParams, fromState) {
        switch (toState.name) {
            case 'search.input':
            case 'search':
                goTo.go(toState.name);
                break;
            case 'search.results':
                if (!fromState.name || fromState.name === 'search.results') {
                    goTo.go('search.input');
                } else {
                    goTo.go(toState.name);
                }
                break;
            case 'search.doc':
                updateDocumentInfo(toParams.id);
                goTo.go(toState.name, {id: toParams.id});
                angular.element($window).scrollTop (0);
                break;
        }
    };
});


app.service('updateDocumentInfo', function($rootScope) {
    this.update = function(id) {
            $rootScope.state.currentDocument.id = id;
            for (var i = 0; i < $rootScope.state.searchResults.length; i++) {
                var row = $rootScope.state.searchResults [i];
                if (row.documentid === id) {
                    $rootScope.state.currentDocument.index = row.searchResultIndex;
                    $rootScope.state.currentDocument.indexOnPage = (i + 1);
                    $rootScope.$broadcast ('updateCurrentDocument');
                    break;
                }
            }
        //return scope;
    };
});



/**
 * Go to new view
 *
 */
app.service('goTo', function($rootScope, $state) {
    this.go = function (newView, options, scopeStateCurrentDocumentId) {
        //toggleFeatures.toggle(newView);
        $rootScope.state.currentView = newView;
        if (options) {
            $state.go(newView, options);
        }
        else {
            if (newView === 'search.doc') {
                $state.go(newView, {id: scopeStateCurrentDocumentId});
            }
            else {
                $state.go(newView);
            }
        }
        $rootScope.$broadcast ('updateNavbar');
    };
});



/**
 * Session - Get and Set.
 */
app.service('ecmsSession', function($sessionStorage) {
   this.getSession = function() {
        return $sessionStorage.session;
    };

   this.getUserLoggedIn  = function() {
       return $sessionStorage.userLoggedIn;
   };

   this.set = function(sessionToSet) {
        $sessionStorage.session = sessionToSet;
    };

   this.set = function(sessionToSet, userLoggedInToSet) {
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
                    headers: { 'Content-Type' : 'application/json' }
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
app.service('updateRestangularHeaders', function (Restangular, ecmsSession) {
    return {
        addSessionId: function () {
            Restangular.setDefaultHeaders({
                'Content-Type': 'application/json',
                'X-ECMS-Session': ecmsSession.getSession()
            });
        },
        removeSessionId: function () {
            Restangular.setDefaultHeaders({
                'Content-Type': 'application/json'
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
app.service('tailorData', function($rootScope) {
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
app.service('signout', function($rootScope, $sessionStorage, terminate, $state, toggleFeatures) {
    this.out =function()  {
        $rootScope.loginError = false;
        $rootScope.userLoggedIn = false;
        $sessionStorage.userLoggedIn = false;
        terminate();
        $rootScope.credentials = {
            username: null,
            password: null,
            rememberMe: false
        };
        //$state.go('login');
        toggleFeatures.toggle('login');
    };

});


///**
// * All to default state
// */
app.service('toDefaultState', function($rootScope, gridOptions) {
    return {
        setToDefaultState: function() {
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



