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

  playlistService.$inject = ['$indexedDB', '$q'];



  //////////////// factory


  // indexedDb initialization
  var IDBStore = require('./node_modules/idb-wrapper/idbstore.min.js');

  // indexedDb definition
  var playlists = new IDBStore({
    dbVersion: 2,
    storeName: 'playlists-index',
    keyPath: 'id',
    autoIncrement: true,
    onStoreReady: function() { console.log('The Store is ready now'); },
    indexes: [
      {name: 'playlistName', keyPath: 'playlistNameIdx', unique: false, multiEntry: false},
      {name: 'createdAt', keyPath: 'createdAtIdx', unique: false, multiEntry: false},
      {name: 'trackData', keyPath: 'trackDataIdx', unique: false, multiEntry: true}
    ]
  });

  function playlistService($indexedDB, $q) {


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

    function addTrack(playlistTitle, soundObj) {
      var deferred = $q.defer();
      var _errorCallback = function(err) {
        console.log(err);
        deferred.reject(err);
      };

      var _successCallback = function(data) {
        console.log(data);
        deferred.resolve(data);
      };

      console.log(storedb);

      playlists.onStoreReady = function() {
          var now = new Date();
          return playlists.put({
            'playlistName': playlistTitle,
            'createdAt': now,
            'trackData': soundObj
          }, _successCallback, _errorCallback);
      };

      return deferred.promise;
    }

    function removeTrack(id) {
      playlists.onStoreReady = function() {
        return playlists.remove(id, _successCallback, _errorCallback);
      };

      return deferred.promise;
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

    function getAllTracks() {
      var deferred = $q.defer();
      var _errorCallback = function(err) {
        console.log(err);
        deferred.reject(err);
      };

      var _successCallback = function(data) {
        console.log(data);
        deferred.resolve(data);
      };

      playlists.onStoreReady = function() {
        return playlists.getAll(_successCallback, _errorCallback);
      };

      return deferred.promise;
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

    function getPlaylistTracks(playlistName) {
      // var onItem = function (item) {
      //   console.log('got item:', item);
      //   // deferred.resolve(item);
      // };
      // var onEnd = function (item) {
      //   console.log('All done.', item);
      // };

      // playlists.onStoreReady = function() {
        // var keyRange = playlists.makeKeyRange({
        //   only: playlistName
        // });

        // return playlists.iterate(onItem, {
        //   index: 'playlistName',
        //   keyRange: keyRange,
        //   onEnd: _successCallback
        // });
      // };

      // return deferred.promise;
    }

  }


})();
