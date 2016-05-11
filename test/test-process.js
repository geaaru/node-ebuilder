// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------

var init = require('./init'),
   core = require('../lib/core'),
   sprintf = require('util').format,
   proc = require('../lib/process');
var path = require('path');

var test_process  = function() {

   ebuilder = init.initBuilder();
   ebuilder.force = true;

   init.initPreliminaryAdapters(ebuilder);
   init.initEbuildAdapters(ebuilder);

   pkg = new core.PackageData();
   //pkg.stagingPkgDir = '/home/geaaru/dev/Log.io';
   pkg.stagingPkgDir = '/home/geaaru/dev/Log.io/node_modules/json-schema';

   proc.processPackageData(ebuilder, pkg);

   // console.log(ebuilder.packages);
};

var test_get_deps = function() {

   ebuilder = init.initBuilder();

   pkg = new core.PackageData();
   //pkg.stagingPkgDir = '/home/geaaru/dev/Log.io';
   pkg.stagingPkgDir = '/home/geaaru/dev/Log.io/node_modules/eyes';

   proc.normalizePackage(ebuilder, pkg);

   proc.getDependenciesListByModules(pkg);
};

var test_process_all  = function() {

   ebuilder = init.initBuilder();
   ebuilder.force = true;

   init.initPreliminaryAdapters(ebuilder);
   init.initEbuildAdapters(ebuilder);

   pkg = new core.PackageData();
   pkg.stagingPkgDir = '/home/geaaru/dev/Log.io';

   ebuilder.addPackage(pkg);

   while (ebuilder.packages.length > 0) {

      pkg = ebuilder.packages.pop();

      try {

         proc.processPackageData(ebuilder, pkg);

      } catch (err) {

         console.log(
            sprintf("Error on elaborate package %s:\n%s",
                    pkg.getEbuildPkgName(), err));
         pkg.inError = true;
         pkg.errorException = err;

         ebuilder.addPackageInError(pkg);
      }

   } // end while


   console.log(ebuilder.summaryErrors());

   // console.log(ebuilder.packages);
};



console.log("BEGIN " + path.basename(__filename, '.js'));

// test_get_deps();

// NOTE: tmp overlay directory must be contains npmv1.eclass and metadata/layout.conf

test_process();
// test_process_all();

console.log("END " + path.basename(__filename, '.js'));

// vim: ts=3 sw=3 expandtab
