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
                var requestUrl = saveDocumentEndpoint.endpoint + '/' + encodeURIComponent(request.Document.DocumentId);
                var deferred = $q.defer();

                var config = {
                    url: requestUrl,
                    method: saveDocumentEndpoint.method,
                    headers: { 'X-ECMS-Session': ecmsSession.getSession(), 'Content-Type' : 'application/json'},
                    data: request
                };

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
                    $http(config).then(updateSuccess, updateError);
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

                var requestUrl = validateEndpoint.endpoint;
                var deferred = $q.defer();

                var config = {
                    url: requestUrl,
                    method: validateEndpoint.method,
                    headers: { 'X-ECMS-Session': ecmsSession.getSession(), 'Content-Type' : 'application/json'},
                    data: request
                };

                function validateSuccess (result) {

                    result.userMessage = new Array ('Document passed validation.');
                    deferred.resolve(result);
                }

                // on Error, create the error messages that will be shown to the user
                function validateError (error) {

                    deferred.reject(validateErrorBase(error));
                }

                $http(config)
                    .then(validateSuccess, validateError);

                return deferred.promise;
            },
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

                    var requestUrl = saveDocumentEndpoint.endpoint + '/' + encodeURIComponent(request.Document.DocumentId);

                    var config = {
                        url: requestUrl,
                        method: saveDocumentEndpoint.method,
                        headers: { 'X-ECMS-Session': ecmsSession.getSession(), 'Content-Type' : 'application/json'},
                        data: request
                    };

                    // now Update
                    $http(config).then(updateSuccess, updateError);
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
