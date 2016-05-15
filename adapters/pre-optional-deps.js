// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   sprintf = require('util').format;

var preAdapterName = 'pre-optional-deps';

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
   //                 'useOptionalDependencies': 'true'
   //                 excluded: [
   //                   'dep1',
   //                 ]
   //             },
   //         ],
   //       }

   if (typeof adapters_opts != 'undefined') {

      if ("pkgs" in adapters_opts) {

         // Check if package is on force install mode
         for (idx in adapters_opts.pkgs) {

            p = adapters_opts.pkgs[idx];

            if ("name" in p && p.name == pkg.getEbuildPkgName()) {

               if (("version" in p && p.version == pkg.version) ||
                   (!("version" in p))) {

                  if ("useOptionalDependencies" in p) {

                     pkg.useOptionalDependencies = p.useOptionalDependencies;

                     logging.Logger.info(sprintf(
                        '[%s] For package %s set useOptionalDependencies to %s.',
                        preAdapterName, pkg.getEbuildPkgName(),
                        pkg.useOptionalDependencies));

                  } else {
                     logging.Logger.warn(sprintf(
                        '[%s] For package %s option useOptionalDependencies is not present.',
                        preAdapterName, pkg.getEbuildPkgName()));
                  }

                  if ("excluded" in p) {

                     pkg.excludeDependencies = p.excluded;

                  }

                  break;

               }

            }

         } // end for

      } else {
         throw sprintf('Invalid options for %s adapter',
                       preAdapterName);
      }

   } else {
      logging.Logger.warn(
         sprintf('[%s] No adapter options present. Nothing to do.',
                 preAdapterName));
   }

   logging.Logger.debug(sprintf(
      "[%s] on execute doPreliminary for package %s return %s.",
      preAdapterName, pkg.getEbuildPkgName(), ans));

   return ans;
};


exports.doPreliminary = doPreliminary;


// vim: ts=3 sw=3 expandtab

