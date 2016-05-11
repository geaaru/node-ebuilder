// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   ebuild = require('../lib/ebuild'),
   sprintf = require('util').format,
   fs = require('fs');

var processEbuild = function (ebuilder, pkg, adapters_opts) {

   if (pkg.ebuildFile.npm_gyp_pkg) {

      // Add build directory
      pkg.ebuildFile.npm_pkg_dirs_override = true;
      pkg.ebuildFile.npm_pkg_dirs.push(
         "build/Release"
      );

   }

   logging.Logger.debug(sprintf(
      "[ebuild-gyp] processed pkg %s.", pkg.name));

};

exports.processEbuild = processEbuild;

// vim: ts=3 sw=3 expandtab
