;(function() {

  'use strict';

  /**
   * Trust URL in iframe src attribute
   *
   * Usage:
   * <iframe ng-src="{{ anUrlFromYourController | trustThisUrl}}"></iframe>
   *
   * @source http://stackoverflow.com/questions/28193993/ng-src-attribute-in-an-iframe-doesnt-accept-expressions-using-angular-js#answer-28194208
   *
   */
  angular.module('boilerplate')
    .filter('trustThisUrl', trustThisUrl);

  trustThisUrl.$inject = ['$sce'];

  function trustThisUrl($sce) {
    return function(val) {
      return $sce.trustAsResourceUrl(val);
    };
  }

})();
