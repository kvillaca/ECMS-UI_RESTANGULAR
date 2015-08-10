'use strict';

/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.factory:getDocumentService
 * @description Retrieves raw XML of a document via a web service
 */


//angular.module('ecmsEcmsUiApp')
//    .service('getDocumentService', function ($http, $q, documentsEndpoint, ecmsSession) {
        //this.get = function (id) {
        //
        //    var deferred = $q.defer();
        //    var requestUrl = documentsEndpoint.endpoint + '/' + encodeURIComponent(id);
        //
        //    var config = {
        //        url: requestUrl,
        //        method: documentsEndpoint.method,
        //        headers: { 'X-ECMS-Session': ecmsSession.getSession(), 'Content-Type' : 'application/json, text/plain, */*'}
        //    };
        //
        //    $http(config).
        //        success(function (data) {
        //            deferred.resolve(data);
        //        }).
        //        error(function (error) {
        //            deferred.reject(error);
        //        });
        //    return deferred.promise;
        //
        //};
    //});
