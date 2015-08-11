'use strict';

describe('Controller: DocCtrl', function () {

    var rootScope,
        EditorCtrl,
        scope,
        mockId = 'LOUICALOUICA272014100163A31C79DDB5819CD9EE499EF4A21977Newalterationsatpotentiallyreg',
        state,
        getDocumentService,
        updateDocumentService,
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
    beforeEach(module(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise(function () {
            return false;
        });
    }));



});
