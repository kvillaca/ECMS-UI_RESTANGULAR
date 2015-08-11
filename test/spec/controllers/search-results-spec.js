'use strict';

describe('Controller: SearchResultsCtrl', function () {

    var rootScope,
        SearchCtrl,
        scope;

    beforeEach(module('ecmsEcmsUiApp'));

    /*beforeEach(inject(function ($controller,
                                $rootScope) {
        rootScope = $rootScope;
        scope = rootScope.$new();

        // initialize this to be used later
        scope.state = {};

        SearchCtrl = $controller('SearchResultsCtrl', {
            $scope: scope,
            $rootScope: rootScope
        });

        scope.state = {
            pageNumber: 3,
            totalItems: 212,
            searchResults: [{something: 'something'}],
            pageSize: 30,
            pageSizes: [30, 50, 100]
        };

    }));


    describe('updateGridOptions method', function () {
        it('should update some of the grid options', function () {

            scope.state = {
                pageNumber: 3,
                totalItems: 212,
                searchResults: [{something: 'something'}],
                pageSize: 30,
                pageSizes: [30, 50, 100]
            };

            SearchCtrl.updateGridOptions ();
            expect(scope.gridOptions.totalItems).toEqual(212);
            expect(scope.gridOptions.paginationCurrentPage).toEqual(3);
            expect(scope.state.searchResults).toEqual([{something: 'something'}]);
        });
    });*/

});

