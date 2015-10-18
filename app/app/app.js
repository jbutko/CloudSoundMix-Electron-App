/**
 *
 * AngularJS Boilerplate
 * @description           Description
 * @author                Jozef Butko // www.jozefbutko.com/resume
 * @url                   www.jozefbutko.com
 * @version               1.1.7
 * @date                  March 2015
 * @license               MIT
 *
 */
;(function() {

  'use strict';


  /**
   * Definition of the main app module and its dependencies
   */
  angular
    .module('boilerplate', [
      'ngRoute',
      'ngElectron',
      'indexedDB'
    ])
    .config(config);

  // safe dependency injection
  // this prevents minification issues
  config.$inject = ['$routeProvider', '$locationProvider', '$httpProvider',
  '$sceDelegateProvider', '$indexedDBProvider'];

  /**
   * App routing
   *
   * You can leave it here in the config section or take it out
   * into separate file
   *
   */
  function config($routeProvider, $locationProvider, $httpProvider,
    $sceDelegateProvider, $indexedDBProvider) {

    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'https://api.soundcloud.com/**'
    ]);

    $locationProvider.html5Mode(false);

    $httpProvider.interceptors.push('httpInterceptor');

    // routes
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .when('/contact', {
        templateUrl: 'views/contact.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .when('/search', {
        templateUrl: 'views/search-results.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .when('/callback', {
        templateUrl: 'views/callback.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });

    $httpProvider.interceptors.push('authInterceptor');

    // $indexedDBProvider
    //   .connection('leaDB')
    //   .upgradeDatabase('1', function(event, db) {
    //     var objStore = db.createObjectStore('playlists', {
    //       keyPath: 'id',
    //       autoIncrement: true,
    //       unique: true
    //     });
    //     objStore.createIndex('playlistNameIdx', 'playlistName', {
    //       unique: false
    //     });
    //     // objStore.createIndex('createdAtIdx', 'created', {
    //     //   unique: false
    //     // });
    //     // objStore.createIndex('trackDataIdx', 'trackData', {
    //     //   unique: false
    //     // });
    //   });

  }


  /**
   * You can intercept any request or response inside authInterceptor
   * or handle what should happend on 40x, 50x errors
   *
   */
  angular
    .module('boilerplate')
    .factory('authInterceptor', authInterceptor);

  authInterceptor.$inject = ['$rootScope', '$q', 'LocalStorage', '$location'];

  function authInterceptor($rootScope, $q, LocalStorage, $location) {

    return {

      // intercept every request
      request: function(config) {
        config.headers = config.headers || {};
        return config;
      },

      // Catch 404 errors
      responseError: function(response) {
        if (response.status === 404) {
          $location.path('/');
          return $q.reject(response);
        } else {
          return $q.reject(response);
        }
      }
    };
  }


  /**
   * Run block
   */
  angular
    .module('boilerplate')
    .run(run);

  run.$inject = ['$rootScope', '$location'];

  function run($rootScope, $location) {

  }


})();