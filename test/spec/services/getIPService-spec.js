'use strict';

describe('Service: getIPService', function () {

    var service,
        $httpBackend;

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
        service = $injector.get('getIPService');
        $httpBackend = $injector.get('$httpBackend');
    }));

    describe('getIP', function () {
        it('should fetch data', function () {
            $httpBackend.expectGET('http://freegeoip.net/json/', {
                'Accept': 'application/json, text/plain, *!/!*'
            }).respond(200,
                {
                    limit: 10
                }
            );

            var promise = service.getIP(),
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
            $httpBackend.expectGET('http://freegeoip.net/json/', {
                'Accept': 'application/json, text/plain, *!/!*'
            }).respond(500);
            var promise = service.getIP(),
                result = null;

            promise.then(function (data) {
                result = data;
            }, function (error) {
                result = error;
            });
            $httpBackend.flush();
            expect(result).toBe('getIPService error');
        });

    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });*/

});
