'use strict';

/**
 * @ngdoc overview
 * @name ecmsEcmsUiApp
 * @description
 * # ecmsEcmsUiApp
 *
 * Main module of the application.
 */
var ecmsApp = angular.module('ecmsEcmsUiApp', [
    'ngAnimate',
    'ui.router',    // replaces ngRoute
    'ngSanitize',
    'ngStorage',
    'ui.grid',       // replaces ngGrid
    'ui.grid.pagination',
    'ui.grid.selection',
    'ui.grid.resizeColumns',
    'ui.grid.autoResize',
    'ui.grid.saveState',
    'ui.codemirror',
    'ui.bootstrap',
    'restangular'
]);

ecmsApp.config(['$stateProvider', '$urlRouterProvider', 'RestangularProvider', '$stateParamsProvider',
    function ($stateProvider, $urlRouterProvider, RestangularProvider) {

        // Restangular initial configs
        RestangularProvider.setBaseUrl('/ecms/rest/');
        RestangularProvider.setFullResponse(true);


        // config for ui-Router
        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'scripts/authenticate/login.html',
                controller: 'LoginController',
                module: 'public',
                resolve: {
                    setPage: function ($rootScope) {
                        $rootScope.page = 'login';
                    }
                }
            })
            .state('search', {
                url: '/search',
                module: 'private',
                views: {
                    '': {
                        templateUrl: 'scripts/search/search.html'
                    },
                    'input@search': {
                        templateUrl: 'scripts/search/search-input.html',
                        controller: 'SearchInputCtrl'
                    },
                    'results@search': {
                        templateUrl: 'scripts/search/search-results.html',
                        controller: 'SearchResultsCtrl'
                    }

                },
                resolve: {
                    setPage: function ($rootScope) {
                        $rootScope.page = 'search';
                    }
                }
            })
            .state('search.input', {url: '/input', module: 'private'})
            .state('search.results', {url: '/results', module: 'private'})
            .state('doc', {
                url: '/doc/:id',
                module: 'private',
                templateUrl: 'scripts/doc/doc.html',
                controller: 'DocCtrl',
                resolve: {
                    setPage: function ($rootScope) {
                        //console.log('Doc $rootScope: ' + $rootScope.page);
                        //$rootScope.page = 'search';
                    }
                }
            })
            .state('faq', {
                url: '/faq',
                templateUrl: 'views/faq.html',
                module: 'private',
                //controller: 'FAQCtrl',
                resolve: {
                    setPage: function ($rootScope) {
                        $rootScope.page = 'faq';
                    }
                }
            })
            .state('contact', {
                url: '/contact',
                templateUrl: 'views/contact.html',
                module: 'private',
                //controller: 'ContactCtrl',
                resolve: {
                    setPage: function ($rootScope) {
                        $rootScope.page = 'contact';
                    }
                }
            });
    }]);

ecmsApp.run(function ($rootScope, $location, $state, isPrivateService, terminate, getIPService,
                      Restangular, signout, $sessionStorage, gridOptions, spinner) {
    // Root variables, mean module public variables.
    var OK_RESPONSE = 200;

    // I couldn't make the LoginCtrl see the parent $scope.
    $rootScope.loginError = false;
    $rootScope.userLoggedIn = false;
    $rootScope.credentials = {
        username: null,
        password: null,
        rememberMe: false
    };
    $rootScope.codeMirrorArea = null;
    $rootScope.errorCode = undefined;
    $rootScope.loginErrorText = undefined;
    $rootScope.state = $sessionStorage.lastState || {
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


    /*
     * Restangular error interceptor, for errors that may impact the application in ways
     * that the user shouldn't be to continue.
     */
    Restangular.setErrorInterceptor(function (response) {
        if (response.status !== OK_RESPONSE) {
            spinner.off();
            switch (response.status) {
                case 500:
                    $rootScope.loginErrorText = response.data;
                    $state.go('login'); //('/SystemError');
                    break;
                case 401:
                    $rootScope.loginErrorText = 'Incorrect login';
                    break;
                case 0:
                    $rootScope.loginErrorText = 'Oops. Something went wrong. Find Will Millman.';
                    break;
                default:
                    $rootScope.loginErrorText = response.status + ': ' + response.statusText;
            }
            return false;
        } else {
            $rootScope.loginErrorText = response.data;
            return true;
        }
    });


    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        // sign user out if they are headed for login view
        if (toState.name === 'login') {
            terminate();
            return;
        }

        // force login if page is private
        if (isPrivateService.check(toState)) {
            event.preventDefault();
            $state.go('login');
        }

        if (toState.name === 'doc') {
            $rootScope.state.currentDocument.id = toParams.id;
        }
    });
});
