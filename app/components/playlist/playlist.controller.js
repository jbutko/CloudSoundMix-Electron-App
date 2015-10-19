;(function() {

  'use strict';

  /**
   * Playlist controller
   *
   */

  angular
    .module('boilerplate')
    .controller('PlaylistController', PlaylistController);

  PlaylistController.$inject = ['$scope', '$rootScope', '$sce'];


  function PlaylistController($scope, $rootScope, $sce) {

    /**
     * Generate safe URL for iframe's src attribute
     *
     * @param  {object} trackUrl Sound object
     * @return {string}          Safe track URL
     */
    $scope.generateIframeUrl = function (trackUrl, type) {
      var urlMc = trackUrl && trackUrl.cloudcasts ? trackUrl.cloudcasts[0].url : trackUrl.url,
          urlSc = trackUrl && trackUrl.cloudcasts ? trackUrl.cloudcasts[0].url : trackUrl.url,
          mc, sc;

      if (type === 'mc') {
        mc = $sce.trustAsResourceUrl('https://www.mixcloud.com/widget/iframe/?feed=' + encodeURIComponent(urlMc) + '&amp;hide_cover=1&amp;hide_tracklist=1&amp;mini=0&amp;replace=0&amp;autoplay=1');
      } else {
        sc = $sce.trustAsResourceUrl('https://w.soundcloud.com/player/?url=' + trackUrl.origin.permalink_url + '&amp;show_artwork=true&amp;show_playcount=false&amp;liking=false&amp;sharing=true&amp;buying=true&amp;show_bpm=false&amp;show_comments=true');
      }
      return type === 'sc' ? sc : mc;
    };


    /**
     * Play mixcloud/soundcloud track
     */
    $scope.playSound = function (sound, type) {
      console.log(sound);
      $rootScope.playSC = false;
      if (type === 'sc') {
        $rootScope.playSC = true;
        $rootScope.playMC = false;
        $rootScope.playSCurl = sound;
      } else if(type === 'mc') {
        $rootScope.playSC = false;
        $rootScope.playMC = true;
        $rootScope.playMCurl = $scope.generateIframeUrl(sound, type);
      }
    };

  }


})();