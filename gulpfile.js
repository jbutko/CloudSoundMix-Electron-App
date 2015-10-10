'use strict';

var gulp = require('gulp');
var electron = require('electron-connect').server.create();

gulp.task('serve', function () {

  // Start browser process
  electron.start('');

  // // // Add an argument
  // electron.start('.');

  // // Add list of arguments
  // electron.start(['--ppapi-flash-path=plugins\pepflashplayer.dll', '--ppapi-flash-version=19.0.0.185']);

  // // Callback
  // electron.start(function () {
  //   console.log('started');
  // });

  // Restart browser process
  gulp.watch('main.js', electron.restart);

  // Reload renderer process
  gulp.watch(['app/js/**/*.js','app/components/**/*.js', 'app/views/**/*.html', 'app/*.html', 'app/css/**/*.css'], electron.reload);
});

gulp.task('reload:browser', function () {
  // Restart main process
  electron.restart();
});

gulp.task('reload:renderer', function () {
  // Reload renderer process
  electron.reload();
});

gulp.task('default', ['serve']);