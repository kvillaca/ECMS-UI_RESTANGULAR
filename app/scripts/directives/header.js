'use strict';

/**
 * @ngdoc function
 * @name ecmsEcmsUiApp.directive:header
 */

angular.module('ecmsEcmsUiApp')
    .directive('header', function ($timeout, $window, $rootScope) {


        function link(scope, element) {

            var collapseAllowed = false;
            var window = angular.element($window);

            function setHeight() {

                var $next = element.next('.container');
                var scroll = window.scrollTop();

                var defaultHeight = parseInt(element.outerHeight());
                if (scroll > parseInt (element.css('margin-bottom')) / 2) {
                    element.addClass ('slide-up');
                    return;
                }
                else {
                    element.removeClass ('slide-up');
                }

                $next[0].style.paddingTop = defaultHeight + 'px';
            }


            $timeout(setHeight, 250);


            $rootScope.$on('updateNavbar', function (event, data) {
                if (data === 'doc') {
                    collapseAllowed = true;
                }
                else {
                    collapseAllowed = false;
                    window.scrollTop (0);
                }
                $timeout(setHeight, 250);
            });

            window.bind('scroll', function() {
                if (collapseAllowed) {
                    setHeight();
                    scope.$apply();
                }
            });

        }

        return {
            restrict: 'E',
            replace: false,
            templateUrl: 'templates/header.html',
            link: link
        };

    });
