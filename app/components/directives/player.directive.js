;(function() {


  'use strict';

  /**
   * Soundcloud player
   *
   * Usage:
   * <player player-source="soundObj"></player>
   *
   */
  angular.module('boilerplate')
    .directive('player', player);

  player.$inject = ['CONSTANTS'];


  function player(CONSTANTS) {

    // Definition of directive
    var directiveDefinitionObject = {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        playerSource: '='
      },
      link: function(scope, elem) {

        var trackUrl = scope.playerSource && scope.playerSource.origin ? scope.playerSource.origin.permalink_url : scope.playerSource.permalink_url;

        SC.oEmbed(trackUrl, {
          auto_play: false,
          maxheight: 166
        }).then(function(oEmbed){
          // var playerContainer = document.querySelector('.player');
          // playerContainer.innerHTML = oEmbed.html;
          elem.html(oEmbed.html);
        });

        // repost url
        // https://api.soundcloud.com/e1/me/track_reposts/225111492?client_id=PtMyqifCQMKLqwP0A6YQ&oauth_token=1-3581-86755-357fd3422efa7263187
      }
    };

    return directiveDefinitionObject;
  }


})();
