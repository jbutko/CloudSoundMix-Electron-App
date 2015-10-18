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

  playlistService.$inject = ['$indexedDB'];



  //////////////// factory



  function playlistService($indexedDB) {


    var service = {
      addTrack: addTrack,
      removeTrack: removeTrack,
      getAllTracks: getAllTracks,
      getPlaylistTracks: getPlaylistTracks,
      openConnection: openConnection,
      getDb: getDb,
      getAllKeys: getAllKeys,
      getPlaylistNames: getPlaylistNames
    };

    return service;


    //////////////// definitions

    function openConnection(objectStore) {
      objectStore = objectStore || 'playlists';
      return $indexedDB.openStore(objectStore);
    }

    function addTrack(playlistTitle, soundObj, objectStore) {
      objectStore = objectStore || 'playlists';
      return $indexedDB.openStore(objectStore, function(store) {
        console.log(store);
        var now = new Date();
        return store.insert({
          playlistName: playlistTitle
        });
      });
    }

    function removeTrack(id, objectStore) {
      objectStore = objectStore || 'playlists';
      return $indexedDB.openStore(objectStore, function(store) {
        return store.delete(id).then(function(data) {
          return data;
        });
      });
    }

    function getDb(dbName) {
      return $indexedDB.objectStore(dbName);
    }

    function getAllKeys(objectStore) {
      objectStore = objectStore || 'playlists';
      return $indexedDB.openStore(objectStore, function(store) {
        return store.getAllKeys().then(function(data) {
          return data;
        });
      });
    }

    function getAllTracks(objectStore) {
      objectStore = objectStore || 'playlists';
      return $indexedDB.openStore(objectStore, function(store) {
        return store.getAll().then(function(tracks) {
          console.log(tracks);
          return tracks;
        });
      });
    }

    function getPlaylistNames(objectStore) {
      objectStore = objectStore || 'playlists';
      return $indexedDB.openStore(objectStore, function(store) {
        return store.getAll().then(function(tracks) {
          var titles = [];
          tracks.map(function (value) {
            titles.push(value.playlistNameIdx);
          });
          return titles;
        });
      });
    }

    function getPlaylistTracks(playlistName, objectStore) {
      objectStore = objectStore || 'playlists';
      return $indexedDB.openStore(objectStore, function(store) {
        // console.log(store);
        return store.findWhere(store.query().$index('playlistNameIdx').$eq(playlistName)).then(function(tracks) {
          return tracks;
        });
      });
    }

  }


})();
