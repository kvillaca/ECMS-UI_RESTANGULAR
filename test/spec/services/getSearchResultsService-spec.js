'use strict';

describe('Service: getSearchResultsService', function () {

    var factory,
        $httpBackend,
        authService;

    // load the controller's module
    beforeEach(module('ecmsEcmsUiApp'));

    /**
     * 4/09/2015
     * The following block is necessary because currently $urlRouterProvider interferes with
     * $httpBackend unit test. This may become obsolete with future updates
     * @link https://github.com/meanjs/mean/issues/198
     * @link http://stackoverflow.com/questions/23655307/ui-router-interfers-with-httpbackend-unit-test-angular-js/23670198#23670198
     */
    /*beforeEach(module(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise(function () {
            return false;
        });
    }));

    beforeEach(inject(function ($injector) {
        factory = $injector.get('getSearchResultsService');
        $httpBackend = $injector.get('$httpBackend');
        authService = $injector.get('authenticateService');

        //authServiceSpy = spyOn(authService, 'getSessionKey').and.returnValue('123');
    }));

    describe('getData', function () {
        it('should fetch data', function () {

            authService.sessionKey = '123';
            $httpBackend.expectGET('/ecms/rest/v1/documents?limit=10&offset=0&query=water', {
                'X-ECMS-Session':authService.sessionKey, 'Accept': 'application/json, text/plain, *!/!*'
            }).respond(200,
                {
                    limit: 10
                }
            );

            var promise = factory.getResults('water', 1, 10),
                result;

            promise.then(function (data) {
                result = data;
            }, function (error) {
                result = error;
            });

            $httpBackend.flush();
            expect(result instanceof Object).toBeTruthy();

            authService.sessionKey = null;
        });


        it('should error out', function () {

            authService.sessionKey = '123';
            $httpBackend.expectGET('/ecms/rest/v1/documents?limit=10&offset=0&query=water', {
                'X-ECMS-Session':authService.sessionKey, 'Accept': 'application/json, text/plain, *!/!*'
            }).respond(500);
            var promise = factory.getResults('water', 1, 10),
                result = null;

            promise.then(function (data) {
                result = data;
            }, function (error) {
                result = error;
            });
            $httpBackend.flush();
            expect(result).toBe('getSearchResultsService error');

            authService.sessionKey = null;
        });

    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });*/

});
