// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

const fs = require('fs'),
   path = require('path');

var logging = require('./logging'),
   check = require('./check');


var loadPkgFile = function (dir) {

   var ans = undefined;

   var normalizedDir = check.checkPkgDir(dir);
   var pkgFile = normalizedDir + '/package.json';

   try {
      ans = require(pkgFile);

   } catch (err) {
      logging.Logger.error('Error on package file ' + pkgFile + ': ' + err);
      throw err;
   }

   return ans;
};

exports.loadPkgFile = loadPkgFile;

// vim: ts=3 sw=3 expandtab
