// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

var winston = require('winston'),
  moment = require('moment-timezone');
winston.emitErrs = true;


var initLogging = function(ebuilder) {

  // Local variables
  var transports = [];
  var idx = 0;

  if (ebuilder.logFile && ebuilder.logLevel) {
     transports[idx++] = new winston.transports.File({
        level: ebuilder.logLevel,
        filename: ebuilder.logFile,
        handleExceptions: false,
        humanReadableUnhandledException: true,
        json: false,
        maxsize: 5242880, //5MB
        maxFiles: 5,
        colorize: false,
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

  exports.Logger = new winston.Logger({
     transports: transports,
     exitOnError: false
  });
  exports.Logger.stream = {
     write: function(message, encoding){
        logger.info(message);
     }
  };

};

exports.initLogging = initLogging;

// vim: ts=3 sw=3 expandtab
