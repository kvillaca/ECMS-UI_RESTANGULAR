'use strict';

describe('Service: updateDocumentService', function () {

    var service,
        $httpBackend,
        docId,
        body;

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
        service = $injector.get('updateDocumentService');
        $httpBackend = $injector.get('$httpBackend');
        docId = 'LOUICALOUICA272014100163A31C79DDB5819CD9EE499EF4A21977Newalterationsatpotentiallyreg';
        body = 'Hi there';
    }));


    describe('validate', function () {
        it('should make a successful call to validate resource', function () {
            $httpBackend.expectPOST('/ecms/rest/v1/methods/document/validate').respond(204, {
                status: 204
            });

            var promise = service.validate({'Document': {'DocumentId': docId, 'Body': body}}),
                result;

            promise.then(function (data) {
                result = data;
            }, function (error) {
                result = error;
            });

            $httpBackend.flush();
            expect(result.data).toEqual({status: 204});
        });

        it('should return 400', function () {
            $httpBackend.expectPOST('/ecms/rest/v1/methods/document/validate').respond(400, {
                status: 400
            });

            var promise = service.validate({'Document': {'DocumentId': '123', 'Body': body}}),
                result;

            promise.then(function (data) {
                result = data;
            }, function (error) {
                result = error;
            });

            $httpBackend.flush();
            expect(result.data.status).toEqual(400);
        });

        it('should return 422', function () {
            $httpBackend.expectPOST('/ecms/rest/v1/methods/document/validate').respond(422, {
                status: 422
            });

            var promise = service.validate({'Document': {'DocumentId': '123', 'Body': body}}),
                result;

            promise.then(function (data) {
                result = data;
            }, function (error) {
                result = error;
            });

            $httpBackend.flush();
            expect(result.data.status).toEqual(422);
        });

        it('should return 500', function () {
            $httpBackend.expectPOST('/ecms/rest/v1/methods/document/validate').respond(500, {
                status: 500
            });

            var promise = service.validate({'Document': {'DocumentId': docId, 'Body': null}}),
                result;

            promise.then(function (data) {
                result = data;
            }, function (error) {
                result = error;
            });

            $httpBackend.flush();
            expect(result.data.status).toEqual(500);
        });

    });

    describe('update', function () {
        it('should make a successful call to update resource', function () {

            // mock call for validate
            $httpBackend.expectPOST('/ecms/rest/v1/methods/document/validate', {'Document': {'DocumentId': docId, 'Body': body}}).respond(204, {
                status: 204
            });

            // mock call for update
            $httpBackend.expectPUT('/ecms/rest/v1/documents/' + docId, {'Document': {'DocumentId': docId, 'Body': body}}).respond(200, {
                status: 200
            });

            service.update({'Document': {'DocumentId': docId, 'Body': body}}).then(function (response) {
                expect(response.data).toEqual({status: 200});

            });

            $httpBackend.flush();

        });

        it('should fail due to validate error', function () {

            // mock call for validate
            $httpBackend.expectPOST('/ecms/rest/v1/methods/document/validate', {'Document': {'DocumentId': docId, 'Body': body}}).respond(400, {
                status: 400
            });

            // update method won't even be called when validate fails so no need to construct the mock call

            service.update({'Document': {'DocumentId': docId, 'Body': body}}).then(function (response) {
                expect(response.data).toEqual({status: 400});

            });

            $httpBackend.flush();

        });

    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });*/

});
