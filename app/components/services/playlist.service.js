;(function() {


  'use strict';


  /**
   * Playlist service
   *
   * @category  factory
   * @author    Jozef Butko
   * @example   Inject playlist as the dependency and then use it this way:
   *
   * playlist.add(soundObj);
   *
   */


  angular
    .module('boilerplate')
    .factory('playlist', playlistService);

  playlistService.$inject = [];



  //////////////// factory



  function playlistService() {


    var service = {
      addTrack: addTrack,
      removeTrack: removeTrack,
      listTracks: listTracks,
      listPlaylists: listPlaylists
    };

    return service;


    //////////////// definitions


    function addTrack(soundObj) {

    }


    function removeTrack(soundObj) {

    }


    function listTracks(playlistName) {

    }


    function listPlaylists() {

    }

  }


})();
