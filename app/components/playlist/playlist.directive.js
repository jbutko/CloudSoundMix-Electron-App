;(function() {


  'use strict';

  /**
   * Playlist component
   *
   * Usage:
   * <playlist playlist-source="mainFeed"></playlist>
   *
   */
  angular.module('boilerplate')
    .directive('playlist', playlist);

  playlist.$inject = [];


  function playlist() {

    // Definition of directive
    var directiveDefinitionObject = {
      restrict: 'E',
      templateUrl: 'components/playlist/playlist.html',
      controller: 'PlaylistController',
      scope: {
        playlistSource: '=',
        trackSearched: '='
      },
      link: function() {
      }
    };

    return directiveDefinitionObject;
  }


})();
