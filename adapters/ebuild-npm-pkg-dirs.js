// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   sprintf = require('util').format;

var ebuildAdapterName = 'ebuild-npm-pkg-dirs';

var processEbuild = function (ebuilder, pkg, adapters_opts) {

   var idx = 0,
      idx2 = 0;
   var p = undefined;
   var b = undefined;

   // POST: adapters_opts is with this form:
   //       {
   //         'pkgs': [
   //             {
   //                 'name': 'xxx',
   //                 'dirs' : [
   //                      'dir1', 'file',
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

              if ("dirs" in p) {

                 pkg.ebuildFile.npm_pkg_dirs_override = true;

                 for (idx2 in p.dirs) {
                    pkg.ebuildFile.npm_pkg_dirs.push(p.dirs[idx2]);
                 } // end for

              } else {
                 throw sprintf(
                    'Invalid configuration on %s for package %s! Missing dirs option!',
                    ebuildAdapterName, pkg.getEbuildPkgName());
              }

           }

        } // end for

     } else {
       throw sprintf('Invalid options for %s adapter', ebuildAdapterName);

     }

   } // end if typeof adapters_opts

   logging.Logger.debug(sprintf(
      "[%s] processed pkg %s.", ebuildAdapterName, pkg.name));

};

exports.processEbuild = processEbuild;

// vim: ts=3 sw=3 expandtab
