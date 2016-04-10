// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

var sprintf = require('util').format;

var logging = require('./logging'),
   tools = require('./tools'),
   npm = require('./npm');

var createDependenciesList = function(pkg, packageJson) {

   var idx = undefined;

   for (idx in packageJson.dependencies) {

      pkg.dependencies[idx] = {
         name: idx,
         version: packageJson.dependencies[idx],
         stagingPkgDir: npm.getDepModulePath(pkg.stagingPkgDir, idx),
         elaborate: false,
         direct: true
      };

   } // end for


};

var normalizePackage = function(ebuilder, pkg) {

   // Check if is already present stagingPkgDir
   if (!pkg.stagingPkgDir) {

      // TODO: Download package / unpack to ebuilder.unpackDir
      //       and complete pkg object.
   } else {
      pkg.stagingPkgDir = npm.normalizePkgdir(pkg.stagingPkgDir);
   }

   // Load package.json file
   var packageJson = tools.loadPkgFile(pkg.stagingPkgDir);

   if (!pkg.version) {
      pkg.version = packageJson.version;
   }

   if (!pkg.name) {
      pkg.name = packageJson.name;
   }

   if (!pkg.description) {
      pkg.description = packageJson.description;
   }

   pkg.nodeBuilder = ebuilder;

   createDependenciesList(pkg, packageJson);

   console.log(pkg);
}


var processPackageData = function(ebuilder, pkg, installDeps) {

   var instRes = false;

   // Check input parameter.

   // Complete initialization of Package data object with
   // missing parameters (version, description, etc.)
   normalizePackage(ebuilder, pkg);

   if (installDeps) {

      instRes = npm.npmInstallDeps(pkg.stagingPkgDir,
                                   { npm_opts : ebuilder.npmInstallOpts } );

      if (!instRes) {
         throw 'Error on install node modules dependencies for package ' + pkg.name;
      }

      // Check package.json of all dependencies.
   }

   // Load

};


exports.processPackageData = processPackageData;

// vim: ts=3 sw=3 expandtab
