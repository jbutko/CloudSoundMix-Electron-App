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

        scope.$watch('playerSource', function (value) {
          var trackUrl = value && value.origin ? value.origin.permalink_url : value.permalink_url;
          scope.playSound(value);
        });


        scope.playSound = function(sound) {
          var trackUrl = sound && sound.origin ? sound.origin.permalink_url : sound.permalink_url;

          SC.oEmbed(trackUrl, {
            auto_play: true,
            format: 'json',
            client_id: CONSTANTS.SC.clientID,
            // iframe: true,
            maxheight: 166
          }).then(function(oEmbed){
            elem.html(oEmbed.html);
            SC.stream(trackUrl, function(sound) {
              console.log(sound);
              sound.play();
            });
          });
        };

        scope.playSound(scope.playerSource);

        scope.$on('$destroy', function () {
          elem.html('');
        });

        // repost url
        // https://api.soundcloud.com/e1/me/track_reposts/225111492?client_id=PtMyqifCQMKLqwP0A6YQ&oauth_token=1-3581-86755-357fd3422efa7263187
      }
    };

    return directiveDefinitionObject;
  }


})();
