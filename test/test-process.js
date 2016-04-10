// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------

var init = require('./init'),
   core = require('../lib/core'),
   proc = require('../lib/process');
var path = require('path');

var test_load_pkg = function() {

   ebuilder = init.initBuilder();

   pkg = new core.PackageData();
   pkg.stagingPkgDir = '/home/geaaru/dev/Log.io';

   proc.processPackageData(ebuilder, pkg, true);

}

console.log("BEGIN " + path.basename(__filename, '.js'));

test_load_pkg();

console.log("END " + path.basename(__filename, '.js'));

// vim: ts=3 sw=3 expandtab
