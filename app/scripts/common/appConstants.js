'use strict';

angular.module('ecmsEcmsUiApp')
    .constant('DEFAULT_VIEW', 'search')
    .constant('FOOTER_LINKS', [
        {label: 'FAQ', route: 'faq'},       // route: absolute URL (if external) or route name
        {label: 'Contact', route: 'contact'},
        {label: 'Browser Compatibility', route: 'https://proquest.atlassian.net/wiki/display/TKB/Browser+Compatibility'}
    ])
    .constant('RESTAPIversion', 'v1')
    .constant('ERRORS', {
        'emptySearchQuery': 'Please enter a search query.',
        'shortSearchQuery': 'Please enter a search query at least 3 characters long.',
        'invalidSearchQuery': 'Invalid search query.',
        'noResultsFound': 'No search results.',
        'badHeaders': 'Bad headers returned.'
    })
    // Search: usage: /ecms/rest/v1/documents?query=water
    // Fetch: usage: /ecms/rest/v1/documents/{docId}
    .constant('documentsEndpoint', {
        endpoint: '/ecms/rest/v1/documents',
        method: 'GET'
    })
    // Update doc: usage: /ecms/rest/v1/documents/{docId}
    .constant('saveDocumentEndpoint', {
        endpoint: '/ecms/rest/v1/documents',
        method: 'PUT'
    })
    // Authenticate
    .constant('loginEndpoint', {
        endpoint: '/ecms/rest/v1/authenticate',
        method: 'POST'
    })
    // Validate indexing
    .constant('validateEndpoint', {
        endpoint: '/ecms/rest/v1/methods/document/validate',
        method: 'POST'
    })
    .constant('searchQueryMinLength', '3')
    .constant('gridOptions', {
        pageSize: 30,
        pageSizes: [30, 50, 100]
    })
    .constant('indicesMeta', {
        'thesauriTerms' : 'Thesauri Terms',
        'companyTerms' : 'Company Terms',
        'uncontrolledTerms' : 'Uncontrolled Terms',
        'classificationTerms': 'Classification Terms'
    })
    .constant('modalHTML', {
        'navigate': {
            animation: true,
            templateUrl: 'templates/modal.html',
            controller: 'ModalInstanceCtrl',
            size: 'md',
            resolve: {
                options: function () {
                    return {    // modal options
                        title: 'Warning',
                        class: 'danger',
                        buttons: [
                            {label: 'Continue without saving', outcome: 'cancel', class: 'btn-primary'},
                            {label: 'Save changes and continue', outcome: 'ok', class: 'btn-secondary'}
                        ],
                        body: 'You have unsaved changes in your document, which will be lost unless you save. What do you want to do?'
                    };
                }
            }
        },
        'close': {
            animation: true,
            templateUrl: 'templates/modal.html',
            controller: 'ModalInstanceCtrl',
            size: 'md',
            resolve: {
                options: function () {
                    return {    // modal options
                        title: 'Warning',
                        class: 'danger',
                        buttons: [
                            {label: 'Close without saving', outcome: 'cancel', class: 'btn-primary'},
                            {label: 'Save changes and continue', outcome: 'ok', class: 'btn-secondary'}
                        ],
                        body: 'You have unsaved changes in your document, which will be lost unless you save. What do you want to do?'
                    };
                }
            }
        }
    });
