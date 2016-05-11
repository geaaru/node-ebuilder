// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   ebuild = require('../lib/ebuild'),
   npm = require('../lib/npm'),
   path = require('path'),
   shell = require('shelljs'),
   sprintf = require('util').format;

var ebuildAdapterName = 'ebuild-show-dropped';

// return true if present on adapter
// return false if not present as custom file/dir on adapter.
var check4CustomDirs = function (ebuilder, pkg, f) {

   var ans = false;
   var idx = 0;
   var p = undefined;

   var adapter = ebuilder.getEbuildAdapterByName('ebuild-npm-pkg-dirs');

   if (adapter) {

      for (idx in adapter.adapters_opts.pkgs) {

         p = adapter.adapters_opts.pkgs[idx];
         if (p.name == pkg.getEbuildPkgName()) {
            if (p.dirs.indexOf(path.basename(f.name)) > -1) {
               ans = true;
               break;
            }
         }

      } // end for

   }

   return ans;
};

var droppedMessage = function (dropped, pkg) {

   var ans = '';
   var idx = 0;

   if (dropped.length == 0) {

      ans = sprintf('[%s] For package %s no files dropped.',
                    ebuildAdapterName, pkg.name);

   } else {

      ans = sprintf('[%s] For package %s dropped files:\n\n',
                    ebuildAdapterName, pkg.name);

      for (idx in dropped) {

         ans += sprintf('%s %s\n',
                        dropped[idx].isDirectory() ? "d" : "f",
                        path.basename(dropped[idx].name));

      } // end for

   }

   return ans;
};

var processEbuild = function (ebuilder, pkg, adapters_opts) {

   var dropped = [];
   var idx = 0;
   var s = undefined;
   var name = undefined,
      ext = undefined;

   logging.Logger.debug(sprintf(
      "[%s] processed pkg %s.", ebuildAdapterName, pkg.name));

   var lsout = shell.ls('-l', pkg.stagingPkgDir);

   for (idx in lsout) {

      s = lsout[idx];
      name = path.basename(s.name);
      ext = path.extname(name);

      if (name == npm.getModulesDirName() || name == 'package.json') {
         continue;
      }

      if (ext == '.js') {
         continue;
      }

      if (name == 'build' && pkg.ebuildFile.npm_pkg_dirs_override) {
         continue;
      }

      if (ebuild.ebuildDefaults.getEclassDocFiles().indexOf(name) > -1) {
         continue;
      }

      if (ebuild.ebuildDefaults.getEclassDirs().indexOf(name) > -1) {
         continue;
      }

      if (ebuild.ebuildDefaults.getEclassBinDirs().indexOf(name) > -1) {
         continue;
      }

      // Check for custom files/dir from ebuild-npm-pkg-dirs adapter
      // for current pkg.
      if (check4CustomDirs(ebuilder, pkg, name)) {
         continue;
      }

      dropped.push(s);

   } // end for

   logging.Logger.info(droppedMessage(dropped, pkg));

};

exports.processEbuild = processEbuild;

// vim: ts=3 sw=3 expandtab
