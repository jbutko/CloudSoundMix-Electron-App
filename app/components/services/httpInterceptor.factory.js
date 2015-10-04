;(function() {

  'use strict';

  angular
    .module('boilerplate')
    .factory('httpInterceptor', [
      '$window', '$rootScope', httpInerceptorService
    ]);

  httpInerceptorService.$inject = ['$q'];


  function httpInerceptorService($q) {

    var service = {
      request: request,
      response: response,
      responseError: responseError
    };
    return service;

    /**
     * Intercept request object
     *
     * @param  {object} config HTTP request object
     * @return {object}        Request object
     */
    function request(config) {
      config.headers = config.headers || {};
      return config;
    }

    /**
     * Intercept response object
     *
     * @param  {object} config HTTP response object
     * @return {object}        Response object
     */
    function response(config) {
      var isSCsearch = config && config.config && config.config.params && config.config.params.q && config.config.url.indexOf('soundcloud') > -1;

      if (isSCsearch) {
        _addProperty(config.data, 'platform', 'sc');
        _changePropertyName(config.data, 'created_at', 'created_time');
      }

      // change SC's created_at to created_time to make it same as mixcloud response
      // if (config && config.data && config.data.collection && config.data.collection[0] && config.data.collection[0].created_at) {
      //   _addProperty(config.data.collection, 'platform', 'sc');
      //   _changePropertyName(config.data.collection, 'created_at', 'created_time', false);
      // }

      // // change SC's created_at to created_time to make it same as mixcloud response
      // // if (config && config.data && config.data.collection && config.data.collection[0] && config.data.collection[0].origin && config.data.collection[0].origin.created_at) {
      // //   _changePropertyName(config.data.collection[0].origin, 'created_at', 'created_time', false);
      // // }

      // // change SC's created_at to created_time to make it same as mixcloud response
      // if (config && config.data && config.data.data && config.data.data[0] && config.data.data[0].cloudcasts) {
      //   _changePropertyName(config.data.data, 'cloudcasts', 'origin', true);
      // }

      config.headers = config.headers || {};
      return config;
    }

    /**
     * Intercept responseError object
     *
     * @param  {object} config HTTP responseError object
     * @return {object}        ResponseError object
     */
    function responseError(response) {
      if (response.status === 401) {
        return $q.reject(response);
      } else {
        return $q.reject(response);
      }
    }

    /**
     * Helper function to rename config property name
     *
     * @param  {object} config HTTP Response
     * @return {object}        Intercepted response
     */
    function _changePropertyName(config, propertyToRename, renameTo, arrayToObject) {
      angular.forEach(config, function(sourceData) {
        if (arrayToObject) {
          sourceData[renameTo] = angular.extend({}, sourceData[propertyToRename][0]);
          delete sourceData[propertyToRename];
        } else {
          sourceData[renameTo] = sourceData[propertyToRename];
          delete sourceData[propertyToRename];
        }

        return sourceData;
      });
    }

    /**
     * Helper function to add property to config
     *
     * @param  {object} config HTTP Response
     * @return {object}        Intercepted response
     */
    function _addProperty(config, key, value) {
      angular.forEach(config, function(sourceData) {
        sourceData[key] = value;
        return sourceData;
      });
    }
  }

})();