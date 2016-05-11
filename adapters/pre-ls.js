// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   sprintf = require('util').format,
   shell = require('shelljs'),
   fs = require('fs');

var doPreliminary = function (ebuilder, pkg, adapters_opts) {

   var msg = '';
   var idx = 0;

   logging.Logger.debug(sprintf(
      '[pre-ls] processed pkg %s.', pkg.name));

   var lsout = shell.ls('-l', pkg.stagingPkgDir);

   for (idx in lsout) {

      msg += sprintf('%s %s\n',
                     lsout[idx].isDirectory() ? "d" : "f",
                     lsout[idx].name);

   } // end for

   logging.Logger.info(sprintf(
      '[pre-ls] For package %s:\n\n%s',
      pkg.name, msg));

   return false;
};

exports.doPreliminary = doPreliminary;

// vim: ts=3 sw=3 expandtab
