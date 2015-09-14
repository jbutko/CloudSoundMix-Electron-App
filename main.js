'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
// var globalShortcut = require('global-shortcut');
var configuration = require('./configuration');
var ipc = require('ipc');
var angular = require('./app/bower_components/ng-electron/ng-bridge.js');

// Report crashes to our server.
require('crash-reporter').start();

var mainOauthWindow = null;
var mainAuthorizedWindow = null;
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

  mainOauthWindow = new BrowserWindow({
    frame: true,
    height: 700,
    resizable: true,
    width: 430
  });

  mainOauthWindow.loadUrl('file://' + __dirname + '/app/index.html');

  // Open the devtool
  mainOauthWindow.openDevTools();

  mainOauthWindow.webContents.on('did-get-redirect-request', function(event, oldUrl, newUrl) {
    // close auth window
    mainOauthWindow.close();

    // open new app instance
    mainAuthorizedWindow = new BrowserWindow({
      frame: true,
      height: 700,
      resizable: true,
      width: 430
    });

    var scTokenCode = newUrl.substring(0, newUrl.length - 1).split('code=')[1];

    // store code to get access token
    configuration.saveSettings('scTokenCode', scTokenCode);

    mainAuthorizedWindow.loadUrl('file://' + __dirname + '/app/index.html');

    // Open the devtool
    mainAuthorizedWindow.openDevTools();

    angular.send('Authorized', mainAuthorizedWindow);
  });



  // mainOauthWindow.loadUrl('https://www.deezer.com/');

  //setGlobalShortcuts();
});




// function setGlobalShortcuts() {
//   globalShortcut.unregisterAll();

//   var shortcutKeysSetting = configuration.readSettings('shortcutKeys');
//   var shortcutPrefix = shortcutKeysSetting.length === 0 ? '' : shortcutKeysSetting.join('+') + '+';

//   globalShortcut.register(shortcutPrefix + '1', function() {
//     mainOauthWindow.webContents.send('global-shortcut', 0);
//   });
//   globalShortcut.register(shortcutPrefix + '2', function() {
//     mainOauthWindow.webContents.send('global-shortcut', 1);
//   });
// }

ipc.on('close-main-window', function() {
  app.quit();
});

ipc.on('open-settings-window', function() {
  if (settingsWindow) {
    return;
  }

  settingsWindow = new BrowserWindow({
    frame: false,
    height: 200,
    resizable: false,
    width: 200
  });

  settingsWindow.loadUrl('file://' + __dirname + '/app/settings.html');

  settingsWindow.on('closed', function() {
    settingsWindow = null;
  });
});

ipc.on('close-settings-window', function() {
  if (settingsWindow) {
    settingsWindow.close();
  }
});

// ipc.on('set-global-shortcuts', function() {
//   setGlobalShortcuts();
// });
