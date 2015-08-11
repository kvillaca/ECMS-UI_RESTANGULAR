'use strict';

describe('Controller: FooterCtrl', function () {

    var rootScope,
        FooterCtrl,
        scope,
        state,
        footerLinksConstant;

    // load the controller's module
    beforeEach(module('ecmsEcmsUiApp'));

/*
    // Inject the mock providers
    beforeEach(inject(function ($controller,
                                $rootScope,
                                $state,
                                _FOOTER_LINKS_) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        footerLinksConstant = _FOOTER_LINKS_;
        state = $state;
        FooterCtrl = $controller('FooterCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
            footerLinksConstant: _FOOTER_LINKS_
        });

    }));

    describe('Footer Ctrl initialization', function () {
        it('should instantiate links to the constant footer links', function () {
            expect(scope.links).toEqual(footerLinksConstant);
        });
    });

    describe('isExternal', function () {
        it('should return false', function () {
            expect(scope.isExternal('http://www.google.com')).toBeTruthy();
        });

        it('should return false', function () {
            expect(scope.isExternal('/editor')).toBeFalsy();
        });
    });*/


});

