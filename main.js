;(function () {


  'use strict';

  var app = require('app');
  var BrowserWindow = require('browser-window');
  // var globalShortcut = require('global-shortcut');
  var configuration = require('./configuration');
  var ipc = require('ipc');
  var angular = require('./app/bower_components/ng-electron/ng-bridge.js');

  // Report crashes to our server.
  require('crash-reporter').start();

  var mainWindow = null;
  var authWindow = null;
  var settingsWindow = null;


  // Quit when all windows are closed.
  app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('ready', function() {

    // if (!configuration.readSettings('shortcutKeys')) {
    //   configuration.saveSettings('shortcutKeys', ['ctrl', 'shift']);
    // }

    mainWindow = new BrowserWindow({
      frame: true,
      height: 700,
      resizable: true,
      width: 800,
      center: true
    });

    mainWindow.loadUrl('file://' + __dirname + '/app/index.html');

    // Open the devtool
    mainWindow.openDevTools();

  });

  ipc.on('open-authorization-window', function (event, data) {

    authWindow = new BrowserWindow({
      frame: false,
      height: 700,
      resizable: true,
      width: 430,
      x: 150,
      y: 150
    });

    var url = data.scUrl,
        serviceType = url.indexOf('mixcloud') > -1 ? 'mc' : 'sc';

    authWindow.loadUrl(url);

    authWindow.webContents.on('did-get-redirect-request', function(event, oldUrl, newUrl) {

      // extract authToken
      var tokenCode = serviceType === 'sc' ? newUrl.substring(0, newUrl.length - 1).split('code=')[1] : newUrl.substring(0, newUrl.length).split('code=')[1];

      // store code to get access token
      configuration.saveSettings(serviceType + 'TokenCode', tokenCode);

      authWindow.close();
      mainWindow.focus();

    });
  });

  ipc.on('close-main-window', function() {
    app.quit();
  });

  // ipc.on('open-settings-window', function() {
  //   if (settingsWindow) {
  //     return;
  //   }

  //   settingsWindow = new BrowserWindow({
  //     frame: false,
  //     height: 200,
  //     resizable: false,
  //     width: 200
  //   });

  //   settingsWindow.loadUrl('file://' + __dirname + '/app/settings.html');

  //   settingsWindow.on('closed', function() {
  //     settingsWindow = null;
  //   });
  // });

  // ipc.on('close-settings-window', function() {
  //   if (settingsWindow) {
  //     settingsWindow.close();
  //   }
  // });


  // ipc.on('sc-unauthorized', function() {
  //   console.log('sc user unauthorized');
  // });

  // ipc.on('set-global-shortcuts', function() {
  //   setGlobalShortcuts();
  // });

})();