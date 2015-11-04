'use strict';

var nconf = require('nconf').file({file: getUserHome() + '\\settings.json'});
console.log(nconf);

function saveSettings(settingKey, settingValue) {
    nconf.set(settingKey, settingValue);
    nconf.save();
    console.log(settingKey);
    console.log(settingValue);
    console.log(nconf.get(settingKey));
}

function readSettings(settingKey) {
    nconf.load();
    return nconf.get(settingKey);
}

function removeSettings(settingKey) {
    nconf.set(settingKey, undefined);
    nconf.save();
}

function getUserHome() {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = {
    saveSettings: saveSettings,
    readSettings: readSettings,
    removeSettings: removeSettings
};