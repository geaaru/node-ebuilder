#!/usr/bin/env node
// -------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
//

const json5 = require('json5'),
   cmdline = require('../lib/cmdline'),
   check = require('../lib/check'),
   logging = require('../lib/logging');

// Add require() hook for .json5 file.
require('json5/lib/require');

var main = function() {
   // Check command line parameters
   var ebuilder = cmdline.parseCmdLine();

   logging.initLogging(ebuilder);

   check.checkEclassValidity(ebuilder);

};

main();

// vim: ts=3 sw=3 expandtab
