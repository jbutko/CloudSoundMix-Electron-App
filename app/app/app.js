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
    ])
    .config(config);

  // safe dependency injection
  // this prevents minification issues
  config.$inject = ['$routeProvider', '$locationProvider', '$httpProvider',
  '$sceDelegateProvider'];

  /**
   * App routing
   *
   * You can leave it here in the config section or take it out
   * into separate file
   *
   */
  function config($routeProvider, $locationProvider, $httpProvider,
    $sceDelegateProvider) {

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
        templateUrl: 'components/playlist/playlist.html',
        controller: 'PlaylistController'
      })
      .when('/callback', {
        templateUrl: 'views/callback.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .when('/playlist', {
        templateUrl: 'components/playlist/playlist.html',
        controller: 'PlaylistController'
      })
      .otherwise({
        redirectTo: '/'
      });
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