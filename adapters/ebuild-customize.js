// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   sprintf = require('util').format;

var ebuildAdapterName = "ebuild-customize";

var processEbuild = function (ebuilder, pkg, adapters_opts) {

   var idx = 0;
   var p = undefined;

   // POST: adapters_opts is with this form:
   //       {
   //         'pkgs': [
   //             {
   //                name: 'xxx',
   //                preCustomOptions: [
   //                   'row1',
   //                   'row2',
   //                ],
   //                customOptions: [
   //                   'rowX',
   //                   'rowY',
   //                ]
   //             },
   //         ]
   //       }

   if (typeof adapters_opts != 'undefined') {

     if ("pkgs" in adapters_opts) {

        // Check if package is on force install mode
        for (idx in adapters_opts.pkgs) {

           p = adapters_opts.pkgs[idx];

           if ("name" in p && p.name == pkg.getEbuildPkgName()) {

              if ("preCustomOptions" in p) {
                 pkg.ebuildFile.preCustomOptions = p.preCustomOptions;
              }

              if ("customOptions" in p) {
                 pkg.ebuildFile.customOptions = p.customOptions;
              }

           }

        } // end for

     } else {
       throw sprintf('Invalid options for %s adapter',
                     ebuildAdapterName);

     }

   } // end if typeof adapters_opts

   logging.Logger.debug(sprintf(
      "[%s] processed pkg %s.", ebuildAdapterName, pkg.name));

};

exports.processEbuild = processEbuild;

// vim: ts=3 sw=3 expandtab
