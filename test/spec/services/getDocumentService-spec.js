'use strict';

describe('Service: getDocumentService', function () {

    var service,
        mockId,
        $httpBackend,
        authService = {};

    // load the controller's module
    beforeEach(module('ecmsEcmsUiApp'));

    /**
     * 4/09/2015
     * The following block is necessary because currently $urlRouterProvider interferes with
     * $httpBackend unit test. This may become obsolete with future updates
     * @link https://github.com/meanjs/mean/issues/198
     * @link http://stackoverflow.com/questions/23655307/ui-router-interfers-with-httpbackend-unit-test-angular-js/23670198#23670198
     */
    beforeEach(module(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise(function () {
            return false;
        });
    }));

    /*beforeEach(inject(function ($injector) {

        authService.sessionKey = '123';

        service = $injector.get('getDocumentService');
        $httpBackend = $injector.get('$httpBackend');
        authService = $injector.get('authenticateService');

        mockId = 'CSAELVLIJDP20150101101016jdrugpo201407019';
    }));

    describe('get', function () {
        it('should fetch data', function () {

            $httpBackend.expectGET('/ecms/rest/v1/documents/' + mockId, {
                'X-ECMS-Session':authService.sessionKey, 'Accept': 'application/json, text/plain, *!/!*'
            }).respond(200,
                {
                    limit: 10
                }
            );

            var promise = service.get(mockId),
                result;

            promise.then(function (data) {
                result = data;
            }, function (error) {
                result = error;
            });

            $httpBackend.flush();
            expect(result instanceof Object).toBeTruthy();

        });


        it('should error out', function () {

            $httpBackend.expectGET('/ecms/rest/v1/documents/' + mockId, {
                'X-ECMS-Session':authService.sessionKey, 'Accept': 'application/json, text/plain, *!/!*'
            }).respond(500,
                {
                    error: 'somethng went wrong'
                });
            var promise = service.get(mockId),
                result = null;

            promise.then(function (data) {
                result = data;
            }, function (error) {
                result = error;
            });
            $httpBackend.flush();
            expect(result).toEqual({
                error: 'somethng went wrong'
            });

        });

    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });*/

});
