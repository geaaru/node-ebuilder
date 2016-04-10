// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------

var init = require('./init'),
   core = require('../lib/core');
   npm = require('../lib/npm');
var path = require('path');

var pkgdir = '/home/geaaru/dev/Log.io/';

var test_check_node_modules = function () {

   console.log('is present node_modules directory: ' + npm.isPresentNodeModules(pkgdir));

};

var test_npm_install = function () {

   ebuilder = init.initBuilder();

   console.log(ebuilder);
   opts = {
      'npm_opts' : ebuilder.npmInstallOpts,
   };

   console.log('Install node_modules under dir ' + pkgdir);

   var ans = npm.npmInstallDeps(pkgdir, opts);

}

console.log("BEGIN " + path.basename(__filename, '.js'));



//test_check_node_modules();

test_npm_install();

console.log("END " + path.basename(__filename, '.js'));


// vim: ts=3 sw=3 expandtab
