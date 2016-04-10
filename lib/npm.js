// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// Description: Contains object used internally.

var sprintf = require('util').format,
   fs = require('fs'),
   shell = require('shelljs');

var logging = require('./logging');

var nodeModulesDir = 'node_modules';

var normalizePkgdir = function(pkgdir) {

   var dir = (pkgdir.substring(pkgdir.length -1, pkgdir.length)) == '/' ?
              pkgdir.substring(0, pkgdir.length - 1) : pkgdir;

   return dir;

};

var getNodeModulesPath = function(pkgdir) {

   return sprintf('%s/%s', normalizePkgdir(pkgdir), nodeModulesDir);

};

var getDepModulePath = function(pkgdir, module) {

   return sprintf('%s/%s', getNodeModulesPath(pkgdir), module);

};

var isPresentNodeModules = function(pkgDir) {

   var ans = false;

   try {

      ndir = getNodeModulesPath(pkgDir);
      // Check if exists node_modules directory
      var odStat = fs.statSync(ndir);

      if (odStat.isDirectory()) {
         ans = true;
      }

   } catch (err) {
      if (err.code != 'ENOENT')
         throw sprintf('Error on check if is present node_modules directory under %s!',
                       pkgDir);
   }

   return ans;
}

var npmInstallDeps = function(pkgDir, opts) {

   var cwd = process.cwd();
   var dir = normalizePkgdir(pkgDir);

   if (typeof opts == 'undefined') {
      opts = {};
   }

   // Clean node_modules directory
   if (isPresentNodeModules(pkgDir)) {
      var ndir = getNodeModulesPath(pkgDir);
      logging.Logger.debug(sprintf('Removing %s directory.', ndir));
      shell.rm('-rf', ndir);
   }

   // Change directory to package directory.
   logging.Logger.debug(sprintf('Go to directory %s...', dir));
   process.chdir(dir);

   var cmd = 'npm ';

   if ('npm_opts' in opts) {
      cmd = cmd + opts['npm_opts'];
   }

   cmd = cmd + ' install . ';

   logging.Logger.info(sprintf('Installing node modules on package directory %s...',
                               dir));

   var installOut = shell.exec(cmd, { silent: true });

   logging.Logger.debug(sprintf('On execute \'%s\':\ncode: %s\nout: %s\nerr: %s',
                                cmd, installOut.code,
                                installOut.output,
                                installOut.stderr));

   ans = !installOut.code;

   if (ans) {
      logging.Logger.info(sprintf('Node modules installed for package directory %s.', dir));
   } else {
      logging.Logger.error(
         sprintf('Error on install node modules for package directory %s:\n%s',
                 dir, installOut.stderr));
   }

   logging.Logger.debug(sprintf('Returning to directory %s...', cwd));
   process.chdir(cwd);

   return ans;
};

exports.getNodeModulesPath = getNodeModulesPath;
exports.getDepModulePath = getDepModulePath;
exports.isPresentNodeModules = isPresentNodeModules;
exports.npmInstallDeps = npmInstallDeps;
exports.normalizePkgdir = normalizePkgdir;

// vim: ts=3 sw=3 expandtab
