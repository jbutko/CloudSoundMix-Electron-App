;(function () {

  'use strict';

  var app = require('app');
  var BrowserWindow = require('browser-window');
  // var globalShortcut = require('global-shortcut');
  var configuration = require('./configuration');
  var ipc = require('ipc');

  console.log(configuration);

  function getUserHome() {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  }

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

  // Specify flash path.
  // On Windows, it might be /path/to/pepflashplayer.dll
  // On Mac, /path/to/PepperFlashPlayer.plugin
  // On Linux, /path/to/libpepflashplayer.so
  app.commandLine.appendSwitch('ppapi-flash-path', '/plugins/pepflashplayer.dll');

  // Specify flash version, for example, v17.0.0.169
  app.commandLine.appendSwitch('ppapi-flash-version', '19.0.0.185');

  app.on('ready', function() {

    // if (!configuration.readSettings('shortcutKeys')) {
    //   configuration.saveSettings('shortcutKeys', ['ctrl', 'shift']);
    // }

    mainWindow = new BrowserWindow({
      frame: true,
      width: 500,
      height: 700,
      resizable: true,
      'node-integration': true,
      'plugin':true,
      'web-preferences': {
        'plugins': true
      }
    });

    mainWindow.loadUrl('file://' + __dirname + '/app/index.html');

    // Open the devtool
    mainWindow.openDevTools();

    mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });

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

      // extract accessToken
      var tokenCode = serviceType === 'sc' ? newUrl.substring(0, newUrl.length - 1).split('code=')[1] : newUrl.substring(0, newUrl.length).split('code=')[1];

      // store code to get access token
      configuration.saveSettings(serviceType + 'TokenCode', tokenCode);

      mainWindow.webContents.send('user-authenticated', {
        type: serviceType,
        token: tokenCode
      });

      console.log('tokenCode ', tokenCode);

      if (typeof tokenCode !== 'undefined') {
        authWindow.close();
        mainWindow.focus();
      };

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