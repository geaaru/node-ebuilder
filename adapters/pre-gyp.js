// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   ebuild = require('../lib/ebuild'),
   sprintf = require('util').format,
   fs = require('fs');

/*
 * @return true   for force install of npm modules
 * @return false  if it isn't required install of npm modules.
 */
var doPreliminary = function (ebuilder, pkg, adapters_opts) {

   var ans = false;
   var gypfile = pkg.stagingPkgDir + '/binding.gyp';

   ans = fs.existsSync(gypfile);

   logging.Logger.debug(sprintf(
      "[pre-gyp] on execute doPreliminary for package %s return %s.",
      pkg.getEbuildPkgName(), ans));

   // Set gyp mode on ebuild file
   if (ans) {
      pkg.ebuildFile.npm_gyp_pkg = true;
   }

   return ans;
};


exports.doPreliminary = doPreliminary;


// vim: ts=3 sw=3 expandtab
