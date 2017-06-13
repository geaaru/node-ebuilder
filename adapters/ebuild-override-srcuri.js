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
   //                version: 'xxx',
   //                uri : 'http:/xxxx'
   //             },
   //         ]
   //       }

   if (typeof adapters_opts != 'undefined') {

     if ("pkgs" in adapters_opts) {

        // Check if package is on force install mode
        for (idx in adapters_opts.pkgs) {

           p = adapters_opts.pkgs[idx];

           if ("name" in p && p.name == pkg.getEbuildPkgName()) {

              var to_customize = false;

              if ("version" in p && p.version == pkg.version) {
                 to_customize = true;
              } else if ("version" in p) {
                 logging.Logger.debug(sprintf(
                    "[%s] found pkg %s with different version %s.",
                    ebuildAdapterName, pkg.name, p.version));
              } else {
                 to_customize = true;
              }

              if (to_customize) {
                 if ("uri" in p) {

                    pkg.ebuildFile.src_uri_override = true;
                    pkg.ebuildFile.src_uri = p.uri;

                 } else {
                    throw sprintf(
                       'Invalid configuration on ebuild-override-srcuri for package %s! Missing uri option!',
                       pkg.getEbuildPkgName());
                 }
              }

           }

        } // end for

     } else {
       throw 'Invalid options for ebuild-override-srcuri adapter';

     }

   } // end if typeof adapters_opts

   logging.Logger.debug(sprintf(
      "[ebuild-override-srcuri] processed pkg %s.", pkg.name));

};

exports.processEbuild = processEbuild;

// vim: ts=3 sw=3 expandtab
