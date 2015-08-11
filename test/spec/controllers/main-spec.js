'use strict';

describe('Controller: MainCtrl', function () {

    var rootScope,
        MainCtrl,
        mainCtrlScope,
        gridOptions,
        authenticateService;
        //authenticateServiceSpy;

    // load the controller's module
    beforeEach(module('ecmsEcmsUiApp'));


    /*// Inject the mock providers
    beforeEach(inject(function ($controller,
                                $rootScope,
                                _authenticateService_,
                                _gridOptions_) {
        rootScope = $rootScope;
        mainCtrlScope = $rootScope.$new();
        authenticateService = _authenticateService_;
        gridOptions = _gridOptions_;

        mainCtrlScope.state = {};

        MainCtrl = $controller('MainCtrl', {
            $scope: mainCtrlScope,
            $rootScope: rootScope,
            authenticateService: authenticateService,
            gridOptions: gridOptions
        });

        //authenticateServiceSpy = spyOn(authenticateService, 'terminate');

        mainCtrlScope.state = {
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
            dirtyRawXML: false
        };

    }));

    describe('Initialization', function () {
        it('should initilize state object', function () {
            expect(mainCtrlScope.state).toEqual({
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
                dirtyRawXML: false
            });
        });

    });
*/

});

