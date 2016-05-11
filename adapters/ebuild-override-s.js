// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


var logging = require('../lib/logging'),
   sprintf = require('util').format;

var processEbuild = function (ebuilder, pkg, adapters_opts) {

   var idx = 0,
      idx2 = 0;
   var p = undefined;
   var b = undefined;

   // POST: adapters_opts is with this form:
   //       {
   //         'pkgs': [
   //             {
   //                name: 'xxx',
   //                override: false
   //             },
   //             {
   //                name: 'yyy',
   //                override: true,
   //                s: 'http://xxxx'
   //             }
   //         ]
   //       }

   if (typeof adapters_opts != 'undefined') {

     if ("pkgs" in adapters_opts) {

        // Check if package is on force install mode
        for (idx in adapters_opts.pkgs) {

           p = adapters_opts.pkgs[idx];

           if ("name" in p && p.name == pkg.getEbuildPkgName()) {

              if ("override" in p) {

                 pkg.ebuildFile.override_s = p.override;
                 if (p.override) {
                    pkg.ebuildFile.s = p.s;
                 }

              } else {
                 throw sprintf(
                    'Invalid configuration on ebuild-override-s for package %s! Missing override option!',
                    pkg.getEbuildPkgName());
              }

           }

        } // end for

     } else {
       throw 'Invalid options for ebuild-override-s adapter';

     }

   } // end if typeof adapters_opts

   logging.Logger.debug(sprintf(
      "[ebuild-override-s] processed pkg %s.", pkg.name));

};

exports.processEbuild = processEbuild;

// vim: ts=3 sw=3 expandtab
