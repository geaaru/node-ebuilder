// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

var winston = require('winston'),
  moment = require('moment-timezone'),
  winston_logrotate = require('winston-logrotate');
winston.emitErrs = true;

var initLogging = function(ebuilder) {

  // Local variables
  var transports = [];
  var idx = 0;

  if (ebuilder.logFile && ebuilder.logLevel) {

      transports[idx++] = new winston_logrotate.Rotate({
        level: ebuilder.logLevel,
        file: ebuilder.logFile,
        handleExceptions: false,
        humanReadableUnhandledException: true,
        json: false,
        max: '10MB', //5MB
        keep: 5,
        colorize: false,
        tailable: true,
        compress: false,
        timestamp: function() {
           return moment.tz(Date.now(), ebuilder.timezone).format();
        },
     });

  }

  if (ebuilder.debug) {
     transports[idx] = new winston.transports.Console({
        level: 'debug',
        handleExceptions: false,
        humanReadableUnhandledException: true,
        json: false,
        colorize: true,
        timezone: true,
        timestamp: function() {
           return moment.tz(Date.now(), ebuilder.timezone).format();
        },
     });
  }

  var Logger = exports.Logger = new winston.Logger({
     transports: transports,
     exitOnError: false
  });

  /*
  exports.Logger.stream = {
     write: function(message, encoding){
        Logger.info(message);
     }
  };
  */

  return Logger;
};

exports.initLogging = initLogging;

// vim: ts=3 sw=3 expandtab
