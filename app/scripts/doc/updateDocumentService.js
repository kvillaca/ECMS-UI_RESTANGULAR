'use strict';

/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.service:updateDocumentService
 * @description attempts to save document to the backend
 */

angular.module('ecmsEcmsUiApp')
    .service('updateDocumentService', function ($rootScope,
                                                $http,
                                                $q,
                                                saveDocumentEndpoint,
                                                validateEndpoint,
                                                ecmsSession,
                                                Restangular,
                                                paramsToString) {


        function validateErrorBase(error) {

            error.userMessage = [];
            error.statusClass = 'alert-danger alert-dismissible';

            // parse response JSON for errors to show to user
            for (var event in error.data.DocumentValidation) {
                if (event !== 'VocabularyEvent') {
                    for (var e in error.data.DocumentValidation[event]) {
                        error.userMessage.push (error.data.DocumentValidation[event][e].Message);
                    }
                }
                else {
                    var message = null;
                    for (var j in error.data.DocumentValidation[event]) {
                        message = error.data.DocumentValidation[event][j].Message;

                        if (error.data.DocumentValidation[event][j].NonPreferredTerm && error.data.DocumentValidation[event][j].PreferredTerm) {
                            message = message + ' "' + error.data.DocumentValidation[event][j].NonPreferredTerm.Search + '". Preferred term found: "' + error.data.DocumentValidation[event][j].PreferredTerm.Display + '"';
                        }
                        error.userMessage.push (message);
                    }
                }
            }

            return error;
        }



        return {
            // updates existing document. Also validates XML and some other properties not including indexing.
            update: function (request) {

                var deferred = $q.defer();

                function updateSuccess (result) {
                    result.userMessage = new Array ('Document saved.');
                    deferred.resolve(result);
                }

                function updateError (error) {

                    error.statusClass = 'alert-danger alert-dismissible';
                    error.userMessage = new Array ('Server error.');

                    deferred.reject(error);
                }

                function validateSuccess () {

                    // now Update
                    //$http(config).then(updateSuccess, updateError);
                    Restangular.one('documents', request.Document.DocumentId).customPUT(request)
                        .then(updateSuccess, updateError);
                }

                function validateError (error) {

                    deferred.reject(validateErrorBase(error));
                }

                // try to validate indexing first
                // if validation is successful validateSuccess will perform the update call
                this.validate(request)
                    .then(validateSuccess, validateError);

                return deferred.promise;
            },
            // validate whole document
            validate: function (request) {

                var deferred = $q.defer();

                function validateSuccess (result) {

                    result.userMessage = new Array ('Document passed validation.');
                    deferred.resolve(result);
                }

                // on Error, create the error messages that will be shown to the user
                function validateError (error) {

                    deferred.reject(validateErrorBase(error));
                }

                Restangular.post ('methods/document/validate', request)
                    .then(validateSuccess, validateError);

                return deferred.promise;

            },
            // used for Save and Exit
            close: function (request) {

                var deferred = $q.defer();

                function updateSuccess (result) {
                    result.userMessage = new Array ('Document saved.');
                    deferred.resolve(result);
                }

                function updateError (error) {

                    error.statusClass = 'alert-danger alert-dismissible';
                    error.userMessage = new Array ('Server error.');

                    deferred.reject(error);
                }

                function validateSuccess () {

                    // now Update
                    //$http(config).then(updateSuccess, updateError);
                    Restangular.one('documents', request.Document.DocumentId).customPUT(request)
                        .then(updateSuccess, updateError);

                }

                function validateError (error) {
                    deferred.reject(validateErrorBase(error));
                }

                // try to validate indexing first
                // if validation is successful validateSuccess will perform the update call
                this.validate(request)
                    .then(validateSuccess, validateError);

                return deferred.promise;
            }
        };

    });
