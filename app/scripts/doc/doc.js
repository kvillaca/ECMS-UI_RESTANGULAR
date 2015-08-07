'use strict';

/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.controller:DocCtrl
 * @description
 * # EditorCtrl
 * Controller of the document view
 */
angular.module('ecmsEcmsUiApp')
    .controller('DocCtrl', function ($scope,
                                     $modal,
                                     modalHTML,
                                     getDocumentService,
                                     $rootScope,
                                     $window,
                                     $timeout,
                                     goTo,
                                     spinner,
                                     updateDocumentService) {

        var $this = this;   // alias for this controller

        $scope.editorOptions = {  // CodeMirror options
            lineWrapping: true,
            lineNumbers: true,
            mode: 'xml',
            viewportMargin: 999999   // big integer ~infinity to make sure the whole document is always rendered
            /**
             * @link https://codemirror.net/doc/manual.html#option_viewportMargin
             */
        };


        //$this.goTo = function(valueForSeach) {
        //    console.log('doc.js - $this');
        //    goTo.go(valueForSeach);
        //}


        $scope.goTo = function(valueForSeach) {
            console.log('doc.js - $scope');
            goTo.go(valueForSeach);
        };


        $scope.codemirrorLoaded = function (_editor) {
            $scope.codeMirrorArea = _editor;
            // Events
            //_editor.on("beforeChange", function(){ ... });
            _editor.on('change', function () {
                $rootScope.state.rawXML = _editor.getValue();
                $rootScope.state.dirtyRawXML = true;
            });
        };

        $scope.statusAlert = {};
        $rootScope.state.errorBox = null;


        /**
         * Helper for updateCurrentDocument
         * @param result
         */
        function getDocumentSuccess(result) {
            $scope.document = result;
            $rootScope.state.rawXML = result.Document.Body.value;
            $scope.lastModifiedDate = formatDate(result.Document.Metadata.LAST_UPDATE_DATE);
            $scope.lastModifiedUserId = result.Document.Metadata.LAST_UPDATE_USER_NAME;
            $timeout(function () {
                $scope.codeMirrorArea.setValue($rootScope.state.rawXML);
                $scope.codeMirrorArea.setOption('readOnly', false);
                $rootScope.state.dirtyRawXML = false;
            });
        }

        /**
         * Updates current document properties in app state
         */
        $scope.updateCurrentDocument = function () {

            function getDocumentError(error) {
                $scope.codeMirrorArea.setValue('Error fetching raw XML.');
                $timeout(function () {
                    $scope.codeMirrorArea.setOption('readOnly', 'nocursor');
                    $rootScope.state.dirtyRawXML = false;
                });
                console.log(error);
            }

            // remove the error box if it was there
            $rootScope.state.errorBox = null;

            getDocumentService.get($rootScope.state.currentDocument.id)
                .then(getDocumentSuccess, getDocumentError);
        };

        $rootScope.$on('updateCurrentDocument', function () {
            $scope.updateCurrentDocument();
        });


        /**
         * Returns date in a nice format: 04/05/2015 9:35:12 am
         * @param dateIn - date in raw JS format: 2015-06-11T10:22:49.068-05:00
         */
        function formatDate(dateIn) {
            var rawDate = new Date(dateIn);

            var month = rawDate.getMonth() + 1;
            if (month < 10) {
                month = '0' + month;
            }

            var day = rawDate.getDate();
            if (day < 10) {
                day = '0' + day;
            }

            var hour = rawDate.getHours();
            var min = rawDate.getMinutes();
            if (min < 10) {
                min = '0' + min;
            }
            var sec = rawDate.getSeconds();
            if (sec < 10) {
                sec = '0' + sec;
            }
            var ampm = hour >= 12 ? 'pm' : 'am';
            hour = hour % 12;       // set it to 12-hour format
            hour = hour ? hour : 12;    // the hour '0' should be '12'


            return month + '/' + day + '/' + rawDate.getFullYear() + ' ' + hour + ':' + min + ':' + sec + ' ' + ampm;
        }


        /**********************************************
         * PREV and NEXT
         **********************************************/

        // NEXT

        $scope.goNext = function () {

            // we're at the end of search results, bail
            if ($rootScope.state.currentDocument.index === $rootScope.state.totalItems) {
                return;
            }

            if ($scope.isDirty()) {
                // we have unsaved changes so grab them and load modal

                $rootScope.state.rawXML = $scope.codeMirrorArea.getValue();
                $scope.document.Document.Body.value = $rootScope.state.rawXML;

                $scope.modal('next');
                return;
            }

            $this.proceedToDocument('next');
            $timeout(function () {
                angular.element($window).scrollTop(0);
            }, 100);
        };

        // subscription event listening for a click on the action bar in header
        $rootScope.$on('goNext', function () {
            $scope.goNext();
        });

        // PREV

        $scope.goPrev = function () {

            // we're at the very beginning of search results, bail
            if ($rootScope.state.currentDocument.index === 1) {
                return;
            }

            if ($scope.isDirty()) {
                // we have unsaved changes so grab them and load modal

                $rootScope.state.rawXML = $scope.codeMirrorArea.getValue();
                $scope.document.Document.Body.value = $rootScope.state.rawXML;

                $scope.modal('prev');
                return;
            }

            $this.proceedToDocument('prev');
            $timeout(function () {
                angular.element($window).scrollTop(0);
            }, 100);
        };


        // subscription event listening for a click on the action bar in header
        $rootScope.$on('goPrev', function () {
            $scope.goPrev();
        });

        // Helpers for Prev and Next

        // this is the callback function after navigating away from a document
        // it finds the doc id of the succeeding document id and goes to it
        this.proceedToDocument = function (direction) {

            var indexToFind;

            indexToFind = direction === 'next' ? $rootScope.state.currentDocument.index + 1 : $rootScope.state.currentDocument.index - 1;

            // in transition
            spinner.on();

            // page over for next
            if (indexToFind > $rootScope.state.indexRange [1]) {
                $rootScope.state.pageNumber = $rootScope.state.pageNumber + 1;
                $scope.updateSearchResults().then(function () {
                    $this.getIdAndGo(indexToFind);
                });
            }
            // page over for previous
            else if (indexToFind < $rootScope.state.indexRange [0]) {
                $rootScope.state.pageNumber = $rootScope.state.pageNumber - 1;
                $scope.updateSearchResults().then(function () {
                    $this.getIdAndGo(indexToFind);
                });
            }
            // no paging over needed, just get document
            else {
                $this.getIdAndGo(indexToFind);
            }

        };

        // Sets the state with the new doc id and goes for it
        $this.getIdAndGo = function (indexToFind) {
            $scope.goToId = $this.getAndGoLoop(indexToFind);
            if ($scope.goToId) {
                $rootScope.state.currentDocument.id = $scope.goToId;
                goTo.go('search.doc', {id: $rootScope.state.currentDocument.id});
            }

            // transition complete
            spinner.off();
        };

        // Finds the doc id that we're trying to go to
        $this.getAndGoLoop = function (indexToFind) {
            var row;

            for (var i = 0; i < $rootScope.state.searchResults.length; i++) {
                row = $rootScope.state.searchResults[i];
                if (indexToFind !== parseInt(row.searchResultIndex)) {
                    continue;
                }
                break;
            }
            return row.documentid;
        };




        /******************************************
         * UPDATE (save document)
         *****************************************/


        function updateDocumentSuccess(response) {

            // clear out box at top for error feedback
            $rootScope.state.errorBox = null;

            // flag for user feedback message
            $scope.statusAlert.statusClass = 'alert-success';
            $scope.statusAlert.status = 'Success';
            $scope.statusAlert.alerts = response.userMessage;

            // transition complete
            spinner.off();

            $scope.document = response.data;
            $rootScope.state.rawXML = $scope.document.Document.Body.value;
            $scope.lastModifiedDate = formatDate($scope.document.Document.Metadata.LAST_UPDATE_DATE);
            $scope.lastModifiedUserId = $scope.document.Document.Metadata.LAST_UPDATE_USER_NAME;

            $timeout(function () {
                $scope.dismissAlert();
            }, 2000);

            // update search results grid
            $scope.updateSearchResults ();

            // clean up the form so Save button is inactive again
            $rootScope.state.dirtyRawXML = false;

        }

        function updateDocumentError(error) {

            if (error.status === 401) {

                // clear out box at top for error feedback
                $rootScope.state.errorBox = null;

                // unauthorized
                $scope.signOut();
            }

            // flag for user feedback message
            $scope.statusAlert.statusClass = 'alert-danger alert-dismissible';
            $scope.statusAlert.alerts = error.userMessage;
            $scope.statusAlert.status = 'Error';

            // transition complete
            spinner.off();

            console.log(error);
        }

        $scope.updateDocument = function () {

            // if we have nothing to save, just bail
            if (!$scope.isDirty()) {
                return;
            }

            if ($scope.isDirty()) {
                $rootScope.state.rawXML = $scope.codeMirrorArea.getValue();
                $scope.document.Document.Body.value = $rootScope.state.rawXML;
            }

            updateDocumentService.update($scope.document)
                .then(updateDocumentSuccess, updateDocumentError);
        };

        // subscription event listening for a click on the action bar in header
        $rootScope.$on('updateDocument', function () {
            spinner.on();
            $scope.updateDocument();
        });


        /********************************************
         * VALIDATE
         ********************************************/

        function validateSuccess(response) {

            // transition complete
            spinner.off();

            // flag for user feedback message
            $scope.statusAlert.statusClass = 'alert-success';
            $scope.statusAlert.status = 'Success';
            $scope.statusAlert.alerts = response.userMessage;

            $timeout(function () {
                $scope.dismissAlert();
            }, 2000);
        }

        function validateError(error) {
            console.log(error);

            // transition complete
            spinner.off();

            $scope.statusAlert.statusClass = 'alert-danger alert-dismissible';
            $scope.statusAlert.alerts = error.userMessage;
            $scope.statusAlert.status = 'Error';

            return error;
        }

        $scope.validateDocument = function () {

            // clear out box at top for error feedback
            $rootScope.state.errorBox = null;

            if ($scope.isDirty()) {
                $rootScope.state.rawXML = $scope.codeMirrorArea.getValue();
                $scope.document.Document.Body.value = $rootScope.state.rawXML;
            }

            updateDocumentService.validate($scope.document)
                .then(validateSuccess, validateError);
        };

        // subscription event listening for a click on the action bar in header
        $rootScope.$on('validateDocument', function () {
            spinner.on();
            $scope.validateDocument();
        });


        /******************************************
         * RELOAD
         ******************************************/

        function reloadDocumentSuccess(result) {
            getDocumentSuccess(result);

            // transition complete
            spinner.off();

            // flag for user feedback message
            $scope.statusAlert.statusClass = 'alert-success';
            $scope.statusAlert.status = 'Success';
            $scope.statusAlert.alerts = ['Document was reloaded successfully.'];

            $timeout(function () {
                $scope.dismissAlert();
            }, 2000);
        }

        function reloadDocumentError(error) {

            // transition complete
            spinner.off();

            $scope.statusAlert.statusClass = 'alert-danger alert-dismissible';
            $scope.statusAlert.alerts = ['There was an error in reloading your file. Please try again or contact system administrator if you can\'t reload the file'];
            $scope.statusAlert.status = 'Error';
            return error;
        }

        // executes when Reload button is clicked
        // on reloading a document, this checks if the editor has been touched
        // if yes, the modal alert is triggered
        $scope.reloadDocument = function () {

            // clear out box at top for error feedback
            $rootScope.state.errorBox = null;

            getDocumentService.get($rootScope.state.currentDocument.id)
                .then(reloadDocumentSuccess, reloadDocumentError);
        };

        // subscription event listening for a click on the action bar in header
        $rootScope.$on('reloadDocument', function () {
            spinner.on();
            $scope.reloadDocument();
        });


        /*************************************
         * CLOSE
         *************************************/

        function closeDocumentSuccess(response) {

            $scope.statusAlert.statusClass = 'alert-success';
            $scope.statusAlert.status = 'Success';
            $scope.statusAlert.alerts = response.userMessage;

            // transition complete
            spinner.on();

            // update search results grid
            $scope.updateSearchResults ();

            $timeout(function () {  // wait for Save to finish; could be done via a promise
                goTo.go('search.results');
                $scope.dismissAlert();
            }, 2400);

        }

        function closeDocumentError(error) {

            // flag for user feedback message
            $scope.statusAlert.statusClass = 'alert-danger alert-dismissible';
            $scope.statusAlert.alerts = error.userMessage;
            $scope.statusAlert.status = 'Error';

            // transition complete
            spinner.on();
        }

        // on closing a document, this checks if the editor has been touched
        // if yes, the modal alert is triggered
        $scope.closeDocument = function () {

            if (!$scope.isDirty()) {
                goTo.go('search.results');
                return;
            }

            if ($scope.isDirty()) {
                $rootScope.state.rawXML = $scope.codeMirrorArea.getValue();
                $scope.document.Document.Body.value = $rootScope.state.rawXML;
            }

            // we have unsaved changes so trigger the modal alert for close
            $scope.modal('close');
        };

        // subscription event listening for a click on the action bar in header
        $rootScope.$on('closeDocument', function () {
            $scope.closeDocument();
        });




        /*********************************************
         * Modal
         *********************************************/

        // triggers the modal alert
        // and handles response from user
        $scope.modal = function (callbackLabel) {

            var modalInstance = $modal.open($this.determineModalHTML(callbackLabel));

            modalInstance.result.then(function () {
                // Modal OK

                // in transition
                spinner.on();

                if (callbackLabel === 'close') {
                    updateDocumentService.update($scope.document)
                        .then(closeDocumentSuccess, closeDocumentError);
                }

                if (callbackLabel === 'next' || callbackLabel === 'prev') {
                    $scope.successDirection = callbackLabel;
                    updateDocumentService.update($scope.document)
                        .then(goToDocumentSuccess, goToDocumentError);
                }

            }, function (reason) {
                // Modal Cancel
                if (reason === 'cancel') {
                    $rootScope.state.dirtyRawXML = false;

                    if (callbackLabel === 'close') {
                        goTo.go('search.results');
                    }

                    if (callbackLabel === 'next' || callbackLabel === 'prev') {
                        $this.proceedToDocument(callbackLabel);
                        $timeout(function () {
                            angular.element($window).scrollTop(0);
                        }, 100);
                    }
                }
            });
        };

        this.determineModalHTML = function (callbackLabel) {
            if (callbackLabel === 'prev' || callbackLabel === 'next') {
                return modalHTML.navigate;
            }

            return modalHTML[callbackLabel];
        };

        function goToDocumentSuccess(response) {

            $scope.statusAlert.statusClass = 'alert-success';
            $scope.statusAlert.status = 'Success';
            $scope.statusAlert.alerts = response.userMessage;

            // transition complete
            spinner.off();

            // update search results grid
            $scope.updateSearchResults ();

            $timeout(function () {
                $scope.dismissAlert();
                $this.proceedToDocument($scope.successDirection);
                angular.element($window).scrollTop(0);
            }, 2400);
        }

        function goToDocumentError(error) {

            // flag for user feedback message
            $scope.statusAlert.statusClass = 'alert-danger alert-dismissible';
            $scope.statusAlert.alerts = error.userMessage;
            $scope.statusAlert.status = 'Error';

            // transition complete
            spinner.off();
        }


        /*
         * Clears out the user alert box
         */
        $scope.dismissAlert = function () {

            // see if there's an error to show to user after they click out of the alert
            if ($scope.statusAlert.status === 'Error') {
                angular.element($window).scrollTop(0);
                $rootScope.state.errorBox = $scope.statusAlert;
            }

            // clear our alert
            $scope.statusAlert = {};
        };

    });
