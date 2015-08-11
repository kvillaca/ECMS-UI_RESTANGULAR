'use strict';

describe('Service: isPrivateService', function () {

    var service,
        authService;

    var mockState;

    // load the controller's module
    beforeEach(module('ecmsEcmsUiApp'));

    beforeEach(inject(function ($injector) {
        service = $injector.get('isPrivateService');
        authService = $injector.get('authenticateService');

    }));

    /*describe('check', function () {

        it('should return true when module is private and no login', function () {

            authService.sessionKey = null;
            mockState = {
                name: 'help',
                module: 'private'
            };

            expect(service.check (mockState)).toBeTruthy();
        });

        it('should return false when module is public and no login', function () {

            authService.sessionKey = null;

            mockState = {
                name: 'help',
                module: 'public'
            };

            expect(service.check (mockState)).toBeFalsy();
        });

        it('should return false when module is private and loggedin', function () {

            authService.sessionKey = '123';
            mockState = {
                name: 'help',
                module: 'private'
            };

            expect(service.check (mockState)).toBeFalsy();
            authService.sessionKey = null;
        });

        it('should return false when module is public and loggedin', function () {

            authService.sessionKey = '123';

            mockState = {
                name: 'help',
                module: 'public'
            };

            expect(service.check (mockState)).toBeFalsy();
            authService.sessionKey = null;
        });
    });*/

});
