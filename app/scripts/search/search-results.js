'use strict';

/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.controller:SearchCtrl
 * @description
 * Controller of the ecmsEcmsUiApp search page
 */
angular.module('ecmsEcmsUiApp')
    .controller('SearchResultsCtrl', function ($scope,
                                               $rootScope,
                                               $timeout,
                                               spinner) {

        // Declaring all variables
        // alias for this controller
        var $this = this;
        // template for grid cell with popover tooltip and anchor
        var templateWithTooltip = 'templates/cellWithTooltip.html';
        // template for grid cell with popover tooltip, no anchor
        var templateJournalTitleWithTooltip = 'templates/templateJournalTitleWithTooltip.html';
        // template for plain cell content (no popover, no anchor)
        var templatePlain = 'templates/cell.html';


        $scope.searchQueryInput;
        $scope.searchResults = undefined;
        $scope.pageSize = undefined;
        $scope.pageSizes = undefined;
        $scope.totalItems = undefined;
        $scope.pageNumber = undefined;

        $scope.paginationOptions = {
            pageNumber: undefined,
            pageSize: undefined,
            pageSizes: undefined
        };
        $scope.gridApi = undefined;

        /*if ($rootScope.state.pageNumber) {
            $this.paginationOptions = {
                pageNumber: $rootScope.state.pageNumber,
                pageSize: $rootScope.state.pageSize,
                pageSizes: $rootScope.state.pageSizes
            };
        }*/


        $scope.gridOptions = {
            data: $rootScope.state.searchResults,
            paginationPageSizes: $rootScope.state.pageSizes,
            paginationPageSize: $rootScope.state.pageSize,
            paginationCurrentPage: $rootScope.state.pageNumber,
            useExternalPagination: true,
            saveSelection: true,
            //showGridFooter: true,
            primaryKey: 'documentId',
            rowHeight: 30,
            columnDefs: [
                {field: 'dtype', displayName: 'Doc Type', cellTemplate: templateJournalTitleWithTooltip, maxWidth: 150, enableColumnMenu: false, enableSorting: false},   // enableSorting: false, enableHiding: false, enableColumnMenu: false, suppressRemoveSort: true, sort: { direction: uiGridConstants.ASC }
                {field: 'ti', displayName: 'Document Title', cellTemplate: templateWithTooltip, minWidth: 300, enableColumnMenu: false, enableSorting: false},
                {field: 'pub', displayName: 'Journal Title', cellTemplate: templateJournalTitleWithTooltip, minWidth: 150, enableColumnMenu: false, enableSorting: false},
                {field: 'vol', displayName: 'Vol', maxWidth: 70, cellTemplate: templatePlain, enableColumnMenu: false, enableSorting: false},
                {field: 'iss', displayName: 'Iss', maxWidth: 70, cellTemplate: templatePlain, enableColumnMenu: false, enableSorting: false},
                {field: 'pd', displayName: 'Pub Date (numeric)', cellTemplate: templateJournalTitleWithTooltip, enableColumnMenu: false, enableSorting: false},
                {field: 'id', displayName: 'Pub Date (alpha)', cellTemplate: templateJournalTitleWithTooltip, enableColumnMenu: false, enableSorting: false},
                {field: 'id', displayName: 'Import Date', cellTemplate: templateJournalTitleWithTooltip, enableColumnMenu: false, enableSorting: false}
            ],
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            totalItems: $rootScope.state.totalItems,
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;

                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    if ($rootScope.state.currentView === 'search.results') {
                        spinner.on();
                        $rootScope.state.pageNumber = newPage;
                        $rootScope.state.pageSize = pageSize;
                        $scope.updateSearchResults().then(function () {
                            $scope.updateGridOptions();
                            spinner.off();
                        });
                    }
                });
            }
        };



        $scope.initView = function() {
            $scope.updateGridOptions();
            //console.log('$rootScope.state.searchResults ' + $rootScope.state.searchResults);
            if ($rootScope.state.searchResults) {
                $scope.updateGridOptions();
            }
        }



        /**
         * Blurs a button after click
         * @param e - event object containing target
         */
        var blur = function (e) {
            if (e.target) {
                e.target.blur();
            }
        };


        // selects all rows in grid
        $scope.selectAll = function(e) {
            if (e) {
                // blur the button we just clicked
                blur(e);
            }
            $scope.gridApi.selection.selectAllRows();
        };


        // un-selects all rows in grid
        $scope.clearAll = function(e) {
            if($scope.gridApi) {

                if (e) {
                    // blur the button we just clicked
                    blur(e);
                }
                $scope.gridApi.selection.clearSelectedRows();
            }
        };


        /**
         * Calculates the last document number for pagination purposes
         */
        $scope.lastIndex = function () {
            return Math.min ($rootScope.state.totalItems, $rootScope.state.pageNumber * $rootScope.state.pageSize);
        };


        /**
         * Utility function for resizing the grid when user changes page size for example
         * @param rows
         */
        var resize = function (rows) {
            // wait a second for the data to load before re-sizing
            $timeout (function () {
                var rowHeight = $scope.gridOptions.rowHeight;
                var newHeight = ((rows + 2) * rowHeight) + 30;   // +30 for headers; +2 for extra padding
                angular.element(document.getElementsByClassName('gridStyle')[0]).css('height', newHeight + 'px');
            }, 20);
        };

        /**
         * Updates the grid with the passed-in control values
         * @param dataIn
         * @param pageNumber
         * @param totalHits
         * @param pageSize
         */
        $scope.updateGridOptions = function () {
            $scope.searchQueryInput = $rootScope.state.searchQuery;
            $scope.searchResults = $rootScope.state.searchResults;
            $scope.pageSize = $rootScope.state.pageSize;
            $scope.pageSizes = $rootScope.state.pageSizes;
            $scope.totalItems = $rootScope.state.totalItems;
            $scope.pageNumber = $rootScope.state.pageNumber;

            $scope.paginationOptions = {
                pageNumber: $rootScope.state.pageNumber,
                pageSize: $rootScope.state.pageSize,
                pageSizes: $rootScope.state.pageSizes
            };

            $scope.gridOptions.data = $rootScope.state.searchResults;
            $scope.gridOptions.paginationPageSizes = $rootScope.state.pageSizes;
            $scope.gridOptions.paginationPageSize = $rootScope.state.pageSize;
            $scope.gridOptions.paginationCurrentPage = $rootScope.state.pageNumber;
            $scope.gridOptions.totalItems = $rootScope.state.totalItems;

            //console.log("GridOptions");
            //console.log($scope.gridOptions);

            // select again any rows that were selected before
            if ($scope.gridApi) {

                /**
                 * @link https://github.com/angular-ui/ng-grid/issues/2267
                 * $timeout needed here to accommodate data latency
                 */
                /*$timeout ( function () {
                    angular.forEach($scope.searchResults, function(row){
                        if (savedDocumentsService.list.indexOf(row.documentid) > -1) {
                            $scope.gridApi.selection.selectRow(row);
                        }
                    });
                    $scope.totalSelected = savedDocumentsService.list.length;
                }, 100);*/
            }

            resize(Math.min($rootScope.state.totalItems, $rootScope.state.pageSize, $rootScope.state.searchResults.length));
            //console.log("state.searchResults.length = " + $scope.state.searchResults.length)
        };


        $rootScope.$on('resizeGrid', function () {
            if ($rootScope.state.searchResults) {
                //$scope.updateGridOptions();
                $scope.initView();
            }
        });

        //if ($rootScope.state.searchResults) {
        //    $scope.updateGridOptions();
        //}

    });
