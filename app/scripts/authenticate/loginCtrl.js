'use strict';
/**
 * @ngdoc controller
 * @name login
 *
 * @description
 * _Please update the description and dependencies._
 *
 * @requires $scope
 * */
angular.module('ecmsEcmsUiApp')
    .controller('LoginController', function ($scope,
                                             $rootScope,
                                             $state,
                                             $sessionStorage,
                                             ecmsSession,
                                             goTo,
                                             toggleFeatures,
                                             Restangular,
                                             RESTAPIversion,
                                             updateRestangularHeaders,
                                             $timeout) {


        var $this = this;   // alias for this controller

        // Scope defaults
        $rootScope.loginError = false;
        $rootScope.userLoggedIn = ecmsSession.getUserLoggedIn() || false;

        // This is scoped because once the user is valid
        $scope.credentials = {
            username: 'kvillaca',
            password: 'JavaRules11!',
            rememberMe: false
        };
        $rootScope.codeMirrorArea = null;


        /*
         * Authenticate the user, calling a rest service!
         */
        $scope.authenticateUser = function () {

            // clear out any previous error messages
            $scope.loginError = false;

            // this is what we are passing on to the server for authentication
            var jsonInput = {
                Authentication: {
                    Credentials: {
                        UserPass: {
                            Username: $scope.credentials.username,
                            Password: $scope.credentials.password
                        }
                    },
                    ClientInfo: {
                        RemoteAddress: $rootScope.IP,
                        UserAgent: navigator.userAgent,
                        RefererURL: window.location.pathname
                    }
                }
            };


            // Restangular call for Authenticate user!
            Restangular.one(RESTAPIversion).post('authenticate', angular.toJson(jsonInput, true)).
                then(function (response) {
                    $timeout(function () {
                        $this.sessionKey = response.data.UserLoginEvent.SessionKey;
                        $sessionStorage.$default({session: null});
                        ecmsSession.set($this.sessionKey, true);
                        // update headers for the rest of the app because all rest calls from now on will need auth info
                        updateRestangularHeaders.addSessionId();
                        $rootScope.loginError = false;
                        $rootScope.userLoggedIn = true;
                        $rootScope.credentials = {
                            username: $scope.credentials.username,
                            password: undefined,
                            rememberMe: false
                        };
                        $scope.credentials = {
                            username: undefined,
                            password: undefined,
                            rememberMe: false
                        };
                        goTo.go('search.input');
                    });
                }, function (fail) {
                    $timeout(function () {
                        $rootScope.loginError = true;
                        ecmsSession.set(undefined, false);
                        console.log(fail);
                    });
                });
        };


        // clear form data when user clicks back into login form after an error
        $scope.clear = function () {
            if ($rootScope.loginError) {
                $rootScope.loginError = false;
                $rootScope.credentials = {
                    username: null,
                    password: null,
                    rememberMe: false
                };
            }
        };
    });
