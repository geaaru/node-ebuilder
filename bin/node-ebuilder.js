#!/usr/bin/env node
// -------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
//

const json5 = require('json5'),
   sprintf = require('util').format,
   cmdline = require('../lib/cmdline'),
   check = require('../lib/check'),
   proc = require('../lib/process'),
   logging = require('../lib/logging');

// Add require() hook for .json5 file.
require('json5/lib/require');

var main = function() {
   // Check command line parameters
   var ebuilder = cmdline.parseCmdLine();
   var pkg = undefined;
   var idx = 0;

   logging.initLogging(ebuilder);

   check.checkEclassValidity(ebuilder);

   // Processing packages
   while (ebuilder.packages.length > 0) {

      pkg = ebuilder.packages.pop();

      try {

         proc.processPackageData(ebuilder, pkg);

      } catch (err) {

         logging.Logger.error(
            sprintf("Error on elaborate package %s:\n%s",
                    pkg.getEbuildPkgName(), err));
         pkg.inError = true;
         pkg.errorException = err;

         ebuilder.addPackageInError(pkg);
      }

   } // end while

   // Check for package in Error:
   summary = ebuilder.summaryErrors();
   if (summary.length > 0) {

      logging.Logger.info('Summary of errors in elaboration:\n');

      for (idx in summary) {
         logging.Logger.info(summary[idx]);
      } // end for
   }

   process.exit(0);
};

main();

// vim: ts=3 sw=3 expandtab
