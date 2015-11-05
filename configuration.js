;(function() {

  'use strict';

  var Configstore = require('configstore');
  var pkg = require('./package.json');

  // Init a Configstore instance with an unique ID e.g.
  // package name and optionally some default values
  var conf = new Configstore(pkg.name);

  function saveSettings(settingKey, settingValue) {
      conf.set(settingKey, settingValue);
  }

  function readSettings(settingKey) {
      return conf.get(settingKey);
  }

  function removeSettings(settingKey) {
      conf.del(settingKey);
  }

  function getUserHome() {
      return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  module.exports = {
      saveSettings: saveSettings,
      readSettings: readSettings,
      removeSettings: removeSettings
  };

})();