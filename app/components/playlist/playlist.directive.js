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
    .directive('playlist', playlistDirective);

  playlistDirective.$inject = ['playlist'];


  function playlistDirective(playlist) {

    // Definition of directive
    var directiveDefinitionObject = {
      restrict: 'E',
      templateUrl: 'components/playlist/playlist-template.html',
      controller: 'PlaylistController',
      scope: {
        playlistSource: '=',
        trackSearched: '='
      },
      link: function(scope, elem, attrs) {

        var tracks = scope.playlistSource,
            playlistNames = scope.getPlaylistTracks;

        if (!tracks) {
          scope.playlistSource = playlist.getPlaylistTracks(playlistNames[0] || null);
          scope.playlist = true;
        }
      }
    };

    return directiveDefinitionObject;
  }


})();
