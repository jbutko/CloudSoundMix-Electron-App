;(function() {


  'use strict';


  /**
   * Playlist service
   *
   * @category  factory
   * @author    Jozef Butko
   *
   * @example   Inject playlist as the dependency and then use it this way:
   * playlist.add(trackname, soundObj);
   * playlist.remove(trackId);
   * playlist.getAllTracks();
   * playlist.getPlaylistTracks(playlistName);
   * playlist.getPlaylistNames();
   *
   */
  angular
    .module('boilerplate')
    .factory('playlist', playlistService);

  playlistService.$inject = ['$q'];


  //////////////// factory


  function playlistService($q) {

    /**
     * Storage
     */
    var storedb = window.storedb;

    /**
     * Public functions
     */
    var service = {
      addTrack: addTrack,
      removeTrack: removeTrack,
      getAllTracks: getAllTracks,
      getPlaylistTracks: getPlaylistTracks,
      getPlaylistNames: getPlaylistNames
    };

    return service;


    //////////////// definitions


    /**
     * Add track to playlist
     * @param {string} playlistTitle Playlist name
     * @param {object} soundObj      Promise
     */
    function addTrack(playlistTitle, soundObj) {
      var deferred = $q.defer();

      storedb('playlists').insert({
        'playlistName': playlistTitle,
        'createdAt': Date.now(),
        'trackData': soundObj
      }, function(err, result) {
        if (!err) {
          return deferred.resolve(result);
        } else {
          return deferred.reject(err);
        }
      });

      return deferred.promise;
    }

    /**
     * Remove track from playlist
     * @param  {number} createdAt Date of track creation in epoch date format
     * @return {boolean}          True/false
     */
    function removeTrack(createdAt) {
      return storedb('playlists').remove({
        'createdAt': createdAt
      });
    }

    /**
     * Get all saved tracks
     * @param  {string} dbName DB name
     * @return {array}         Tracks array
     */
    function getAllTracks(dbName) {
      return storedb(dbName).find();
    }

    /**
     * Get playlists name
     * @param  {string} dbName DB name
     * @return {array}         Array with playlists name
     */
    function getPlaylistNames(dbName) {
      var allTracks = storedb(dbName).find();
      var playlistNames = [];

      allTracks.map(function (value) {
        if (playlistNames.indexOf(value.playlistName) === -1) {
          playlistNames.push(value.playlistName);
        }
      });

      return playlistNames.sort();
    }

    /**
     * Get all track of playlist
     * @param  {string} playlistName Playlist name
     * @return {arra}                Array with track of playlist
     */
    function getPlaylistTracks(playlistName) {
      return storedb('playlists').find({
        'playlistName': playlistName
      });
    }

  }


})();
