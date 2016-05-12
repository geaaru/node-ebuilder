// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

var sprintf = require('util').format,
   moment = require('moment-timezone'),
   fs = require('fs');

// For now I avoid manage of logrotating.
var Logger = function(options) {

   this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
   };

   this.debug = false;
   this.level = 'info';
   this.file = undefined;

   if ("filename" in options) {
      this.file = fs.openSync(options.filename, 'a');
   }

   if ("level" in options && options.level in this.levels) {
      this.level = options.level;
   }

   this.timezone = "timezone" in options ? options.timezone : 'UTC';

   this.timestamp = function() {
      return moment.tz(Date.now(), this.timezone).format();
   };

   this.debug = function(message) {
      this.log('debug', message);
   };

   this.info = function(message) {
      this.log('info', message);
   };

   this.warn = function(message) {
      this.log('warn', message);
   }

   this.error = function(message) {
      this.log('error', message);
   }

   this.log = function(level, message) {

      var lcurr = this.levels[this.level];
      var lmsg = this.levels[level];

      if (lmsg >= lcurr) {

         var msg = sprintf('%s %s%s %s\n',
                           this.timestamp(),
                           level,
                           level == 'info' || level == 'warn' ? ' ' : '',
                           message);
         if (this.debug) {
            console.log(msg);
         }

         if (this.file) {
            fs.writeSync(this.file, msg);
         }

      }
   };


   this.close = function() {

      if (this.file) {
         fs.closeSync(this.file);
         this.file = undefined;
      }

   };

   return this;

};

var initLogging = function(ebuilder) {

  var options = {};

  if ("debug" in ebuilder) {
     options.debug = ebuilder.debug;
  }

  if ("logFile" in ebuilder) {
     options.filename = ebuilder.logFile;
  }

  if ("logLevel" in ebuilder) {
     options.level = ebuilder.logLevel;
  }

  if ("timezone" in ebuilder) {
     options.timezone = ebuilder.timezone;
  }

  var logger = exports.Logger = new Logger(options);

  exports.Logger.exitAfterFlush = function(code) {
      logger.close();

     //  Logger.transports.rotate.on('flush', function() {
     //      process.exit(code);
     //  });
   };

   return logger;
};

exports.initLogging = initLogging;

// vim: ts=3 sw=3 expandtab
