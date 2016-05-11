// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   ebuild = require('../lib/ebuild'),
   sprintf = require('util').format,
   fs = require('fs');

var preAdapterName = 'pre-force';

var setNpmInstallOpts = function (pkg, p) {

   if ("npmInstallOpts" in p) {
      pkg.overrideNpmInstallOpts = p['npmInstallOpts'];
   }

};

var checkOptionalDependencies = function (ebuilder, pkg) {

   var ans = false;
   var dep = undefined;

   // Check if optionalDependencies contains package
   // that are defined on dependencies. FWIS if package is
   // present on both option is not installed with
   // options: -E --no-optional --production

   if ("optionalDependencies" in pkg.packageJson &&
       Object.keys(pkg.packageJson.optionalDependencies).length > 0 &&
       "dependencies" in pkg.packageJson &&
       Object.keys(pkg.packageJson.dependencies).length > 0) {

      for (dep in pkg.packageJson.dependencies) {

         if (dep in pkg.packageJson.optionalDependencies) {

            logging.Logger.info(sprintf(
               '[%s] For package %s found dependency %s on optionalDependencies. ' +
               'I force npmInstallOpts "-E --production".',
               preAdapterName, pkg.getEbuildPkgName(), dep));

            ebuilder.npmInstallOpts = '-E --production';
            ans = true;
            break;
         }

      } // end for

   } // else nothing to do.

   return ans;
};

/*
 * @return true   for force install of npm modules
 * @return false  if it isn't required install of npm modules.
 */
var doPreliminary = function (ebuilder, pkg, adapters_opts) {

   var ans = false;
   var idx = 0;
   var p = undefined;

   // POST: adapters_opts is with this form:
   //       {
   //         'pkgs': [
   //             {
   //                 'name': 'xxx',
   //                 'version: 'yyy',
   //                 'npmInstallOpts': ''
   //             }
   //         ],
   //         'checkOptionalDeps': false
   //       }

   if (typeof adapters_opts != 'undefined') {

      if ("pkgs" in adapters_opts) {

         // Check if package is on force install mode
         for (idx in adapters_opts.pkgs) {

            p = adapters_opts.pkgs[idx];

            if ("name" in p && p.name == pkg.getEbuildPkgName()) {

               if (("version" in p && p.version == pkg.version) ||
                   (!"version" in p)) {

                      logging
                      ans = true;
                      setNpmInstallOpts(pkg, p);

                      break;

                   }

            }

         } // end for

      } else if (!("checkOptionalDeps" in adapters_opts)) {
         throw 'Invalid options for pre-force adapter';

      }

   } else {
      logging.Logger.warn(
         '[pre-force] No adapter options present. Nothing to do.');
   }

   if ((!ans) && "checkOptionalDeps" in adapters_opts && adapters_opts.checkOptionalDeps) {
      ans = checkOptionalDependencies(ebuilder, pkg);
   }

   logging.Logger.debug(sprintf(
      "[pre-force] on execute doPreliminary for pkg %s return %s.",
      pkg.getEbuildPkgName(), ans));

   return ans;
};


exports.doPreliminary = doPreliminary;


// vim: ts=3 sw=3 expandtab

