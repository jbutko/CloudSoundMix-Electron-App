'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var globalShortcut = require('global-shortcut');
var configuration = require('./configuration');
var ipc = require('ipc');

var mainWindow = null;
var settingsWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  if (!configuration.readSettings('shortcutKeys')) {
    configuration.saveSettings('shortcutKeys', ['ctrl', 'shift']);
  }

  mainWindow = new BrowserWindow({
    frame: true,
    height: 700,
    resizable: true,
    width: 368
  });

  // jQuery referrence error loading bug fix
  mainWindow.webContents.on('did-start-loading', function() {
    mainWindow.webContents.executeJavaScript("var $ = jQuery = require('jquery'), mainWindow = require('remote').getCurrentWindow();");
  });

  mainWindow.loadUrl('file://' + __dirname + '/app/index.html');

  // Open the devtool
  mainWindow.openDevTools();

  setGlobalShortcuts();
});

function setGlobalShortcuts() {
  globalShortcut.unregisterAll();

  var shortcutKeysSetting = configuration.readSettings('shortcutKeys');
  var shortcutPrefix = shortcutKeysSetting.length === 0 ? '' : shortcutKeysSetting.join('+') + '+';

  globalShortcut.register(shortcutPrefix + '1', function() {
    mainWindow.webContents.send('global-shortcut', 0);
  });
  globalShortcut.register(shortcutPrefix + '2', function() {
    mainWindow.webContents.send('global-shortcut', 1);
  });
}

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

ipc.on('set-global-shortcuts', function() {
  setGlobalShortcuts();
});
