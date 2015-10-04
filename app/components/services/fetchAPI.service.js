;(function() {


  'use strict';


  /**
   * SoundCloud service to call API endpoints
   *
   * @category  factory
   * @author    Jozef Butko
   * @example   Inject fetchAPI as the dependency and then use it this way:
   *
   * fetchAPI.query('GET', 'users/user/', {get: query}, {post: params})
      .then(function(data) {
        console.log(data);
      }, function(error) {
        console.log(error);
      });
   *
   * @param     {String} method HTTP method, eg. 'PUT', 'GET'...
   * @param     {String} url API endpoint, eg. 'users/user' or 'system-properties'
   * @param     {Object} params Map of strings or objects which will be turned
   *                     to `?key1=value1&key2=value2` after the url. If the value
   *                     is not a string, it will be
   *                     JSONified
   * @return    {Object} data Data to be sent as the request message data
   * @version   1.1
   *
   */


  angular
    .module('boilerplate')
    .factory('fetchAPI', [
      '$http', '$q', 'CONSTANTS', fetchAPI
    ]);



  //////////////// factory



  function fetchAPI($http, $q, CONSTANTS) {


    var service = {
      query: query,
      searchTracks: searchTracks
    };

    return service;


    //////////////// definition


    /**
     * Service for generic API calls
     *
     * @param  {string} method  HTTP method
     * @param  {srring} url     API endpoint URL
     * @param  {object} params  GET params
     * @param  {object} data    POST params
     * @param  {object} headers HTTP headers
     * @return {object}         Promise
     */
    function query(method, url, params, data, headers) {

      var deferred = $q.defer();

      $http({
        method: method,
        url: url,
        params: params,
        data: data,
        headers: headers
      }).then(function(data) {
        if (!data.config) {
          console.log('Server error occured.');
        }
        deferred.resolve(data);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }



    function searchTracks(keyword, searchType, platform, params, duration) {
      var searchKeyword = keyword.replace(' ', '+'),
          scSearchType = searchType || 'tracks',
          mcSearchType = searchType || 'cloudcast',
          scSearchParams = angular.extend({q: searchKeyword, client_id: CONSTANTS.SC.clientID, limit: 10}, params),
          mcSearchParams = angular.extend({q: searchKeyword, type: mcSearchType, limit: 10}, params),
          promises;

      // search both soundcloud and mixcloud
      if (typeof type === 'undefined' && typeof duration === 'undefined') {
        promises = {
          scSearch: query('GET', CONSTANTS.SC.APIurl + scSearchType + '/', scSearchParams, {}),
          mcSearch: query('GET', CONSTANTS.MC.APIurl + 'search/', mcSearchParams, {})
        };

        return $q.all(promises).then(function(data) {
          return data;
        });
      } else if (typeof duration !== 'undefined') {
        promises = {
          scSearch: query('GET', CONSTANTS.SC.APIurl + scSearchType + '/', angular.extend(scSearchParams, {'duration[from]': duration*60*1000})),
          mcSearch: query('GET', CONSTANTS.MC.APIurl + 'search/', mcSearchParams, {})
        };

        return $q.all(promises).then(function(data) {
          return data;
        });
      }
    }

  }


})();
