// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   ebuild = require('../lib/ebuild'),
   npm = require('../lib/npm'),
   sprintf = require('util').format,
   shell = require('shelljs');

var setLocalFlagOnDep = function (pkg, depname) {

   var idx = 0;
   var p = undefined;

   for (idx in pkg.dependencies) {

      p = pkg.dependencies[idx];

      if (p.name == depname) {
         p.local = true;
      }

   } // end for

};

var processEbuild = function (ebuilder, pkg, adapters_opts) {

   var idx = 0,
      idx2 = 0;
   var p = undefined;
   var lsout = undefined;
   var m = undefined;

   // POST: adapters_opts is with this form:
   //       {
   //         'pkgs': [
   //             {
   //                 'name': 'xxx',
   //                 'localMods' : [
   //                      'mod1', 'mod2',
   //                 ]
   //             }
   //         ]
   //       }

   if (typeof adapters_opts != 'undefined') {

     if ("pkgs" in adapters_opts) {

        // Check if package is on force install mode
        for (idx in adapters_opts.pkgs) {

           p = adapters_opts.pkgs[idx];

           if ("name" in p && p.name == pkg.getEbuildPkgName()) {

              if ("localMods" in p) {

                 pkg.ebuildFile.npm_sys_mods_override = true;
                 pkg.ebuildFile.npm_no_deps = false;

                 // Retrieve list of modules
                 lsout = shell.ls(npm.getNodeModulesPath(pkg.stagingPkgDir));

                 for (idx2 in lsout) {
                    m = lsout[idx2];

                    if (p.localMods.indexOf(m) < 0) {
                       // If module is not present on localMods
                       // it means that it is needed add module
                       // on NPM_SYSTEM_MODULES variable, variable
                       // that contains modules that must be not installed.
                       pkg.ebuildFile.npm_sys_modules.push(lsout[idx2]);
                       pkg.ebuildFile.restrict = "-network-sandbox";
                    } else {
                       setLocalFlagOnDep(pkg, m);
                    }

                 } // end for idx2

              } else {
                 throw sprintf(
                    'Invalid configuration on ebuild-local-mods for package %s! Missing localMods option!',
                    pkg.getEbuildPkgName());
              }

           }

        } // end for

     } else {
       throw 'Invalid options for ebuild-local-mods adapter';

     }


   } // end if typeof adapters_opts

   logging.Logger.debug(sprintf(
      "[ebuild-local-mods] processed pkg %s.", pkg.name));

};

exports.processEbuild = processEbuild;

// vim: ts=3 sw=3 expandtab
