// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

var sprintf = require('util').format,
   logging = require('./logging'),
   ebuild = require('./ebuild');

const path = require('path'),
   fs = require('fs');


var checkEclassValidity = function(ebuilder) {

   if (!ebuild.isPresentNpmEclass(ebuilder.overlaydir)) {

      var errstr = sprintf('Npm Eclass is not present on overlay directory %s.',
                           ebuilder.overlaydir);
      logging.Logger.error(errstr);
      console.log(errstr);

      process.exit(1);
   }

   isValid = ebuild.isValidNpmEclassVersion(ebuilder.overlaydir);

   if (!isValid) {

      var errstr = sprintf('Npm Eclass has an invalid version. Minimal version required is %s.',
                           ebuild.npmEclassMinVer);

      logging.Logger.error(errstr);
      console.log(errstr);

      process.exit(1);

   }

   logging.Logger.debug('checkEclassValidity is OK');
};

var checkPkgDir = function(pkgdir) {

   var odStat = fs.statSync(pkgdir);
   var dir = undefined,
      pkgFile = undefined;

   if (odStat.isDirectory()) {
      dir = (pkgdir.substring(pkgdir.length -1, pkgdir.length)) == '/' ?
             pkgdir.substring(0, pkgdir.length - 1) : pkgdir;
   } else {
      dir = path.dirname(pkgdir);
   }

   if (!path.isAbsolute(dir)) {
      throw 'Dir path must be in ABS Format!';
   }

   pkgFile = dir + '/package.json';

   if (!fs.existsSync(pkgFile)) {
      throw 'No package.json file found on dir ' + dir;
   }

   logging.Logger.debug(sprintf('checkPkgDir for directory %s is OK.', dir));

   return dir;
};


exports.checkEclassValidity = checkEclassValidity;
exports.checkPkgDir = checkPkgDir;

// vim: ts=3 sw=3 expandtab
