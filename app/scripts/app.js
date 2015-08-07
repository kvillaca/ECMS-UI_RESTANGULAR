'use strict';

/**
 * @ngdoc overview
 * @name ecmsEcmsUiApp
 * @description
 * # ecmsEcmsUiApp
 *
 * Main module of the application.
 */
angular.module('ecmsEcmsUiApp', [
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
])
    .config(['$stateProvider', '$urlRouterProvider', 'RestangularProvider',
        function ($stateProvider, $urlRouterProvider, RestangularProvider, $sessionStorage) {

            // Restangular initial configs
            $sessionStorage.$default({session: null});
            $sessionStorage.session = null;
            RestangularProvider.setBaseUrl('/ecms/rest/');
            RestangularProvider.setFullResponse(true);
            RestangularProvider.setDefaultHeaders({
                'Content-Type': 'application/json',
                'X-ECMS-Session': $sessionStorage.session
            });



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
                        },
                        'doc@search': {
                            templateUrl: 'scripts/doc/doc.html',
                            controller: 'DocCtrl'
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
                .state('search.doc', {url: '/doc/:id', module: 'private'})
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
        }])
    .run(function ($rootScope,$location, $state, isPrivateService, terminate, getIPService, Restangular, signout, $sessionStorage, gridOptions) {
        // Root variables, mean module public variables.
        var OK_RESPONSE = 200;

        // I couldn't make the LoginCtrl see the parent $scope.
        $rootScope.loginError = false;
        $rootScope.userLoggedIn =  false;
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
        Restangular.setErrorInterceptor(function(response) {
            if (response.status !== OK_RESPONSE) {
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


        $rootScope.$on('$stateChangeStart', function (event, toState) {
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
        });
});
