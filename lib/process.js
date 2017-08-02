// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

var sprintf = require('util').format,
   replaceall = require('replaceall'),
   fs = require('fs');

var logging = require('./logging'),
   tools = require('./tools'),
   ebuild = require('./ebuild'),
   core = require('./core'),
   npm = require('./npm');

var createDependenciesList = function(pkg, packageJson) {

   var idx = undefined;

   for (idx in packageJson.dependencies) {

      pkg.dependencies[idx] = {
         name: idx,
         version: packageJson.dependencies[idx],
         stagingPkgDir: npm.getDepModulePath(pkg.stagingPkgDir, idx),
         elaborate: false,
         direct: true,
         // If local is true means that this module
         // is installed under node_modules directory of
         // the package.
         local: false
      };

   } // end for

}; // end createDependenciesList

var check4OptionalDependencies = function(ebuilder, pkg) {

   var idx = 0;
   var p = undefined;

   if (pkg.useOptionalDependencies) {

      // Add optional dependencies as direct dependencies
      for (idx in pkg.packageJson.optionalDependencies) {

         pkg.dependencies[idx] = {
            name: idx,
            version: pkg.packageJson.optionalDependencies[idx],
            stagingPkgDir: npm.getDepModulePath(pkg.stagingPkgDir, idx),
            elaborate: false,
            direct: true,
            local: false
         };

      } // end for

      // Check if --no-optional is present on npmInstallOpts
      if (ebuilder.npmInstallOpts.indexOf('no-optional') > -1) {

         ebuilder.npmInstallOpts = replaceall('--no-optional', '',
                                              ebuilder.npmInstallOpts);

      }

   }

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
   var customName = undefined;

   if (!pkg.version) {
      pkg.version = packageJson.version;
   }

   if (!pkg.name) {
      pkg.name = packageJson.name;
   }

   if (!pkg.description && "description" in packageJson &&
       packageJson.description.length > 0) {
      pkg.description = replaceall('`', '', packageJson.description);
   } else {
      logging.Logger.warn(sprintf('For package %s description is not present.',
                                  pkg.getEbuildPkgName()));
      pkg.description = sprintf('%s nodejs module', pkg.name);
   }

   pkg.ebuildFile.description = pkg.description;

   if ("license" in packageJson) {
      pkg.ebuildFile.license = packageJson.license;
   }

   if (pkg.homepage) {
      pkg.ebuildFile.homepage = pkg.homepage;
   } else if ("homepage" in packageJson) {
      pkg.ebuildFile.homepage = packageJson.homepage;
   } else {
      // For now if homepage is not available I use npmjs.org page
      pkg.ebuildFile.homepage = sprintf('http://www.npmjs.com/package/%s',
                                        pkg.name);

   }

   pkg.ebuildFile.keywords = ebuilder.ebuildArch;

   pkg.packageJson = packageJson;

   pkg.nodeBuilder = ebuilder;

   // Check if name is fine for portage

   customName = ebuild.normalizePkgName(pkg.name,
                                        pkg.gitUrl,
                                        pkg.tarball,
                                        ebuilder.customNameMap);
   if (customName !== pkg.name) {
      pkg.customName = customName;
      pkg.ebuildFile.npm_pkg_name = pkg.name;
   }

   createDependenciesList(pkg, packageJson);

}; // end of normalizePkgName

var getDependenciesListByModules = function(pkg) {

   // PRE: package is already normalized.

   var modulesdir = npm.getNodeModulesPath(pkg.stagingPkgDir);
   var n = undefined;
   var ans = [];
   var pkgjsonfile = undefined;
   var dep = undefined;
   var moddir = undefined;
   var dirs = [];

   if (fs.existsSync(modulesdir)) {
      dirs = fs.readdirSync(modulesdir);
   }

   logging.Logger.debug(
      sprintf('For package %s found modules: %s',
              pkg.getEbuildPkgName(), dirs));

   for (idx in dirs) {

      n = dirs[idx];

      if (n.substring(0, 1) != '.') {
         // POST: Is not a hidden directory.

         moddir = sprintf('%s/%s', modulesdir, n);
         pkgjsonfile = tools.loadPkgFile(moddir);

         dep = {
            name: n,
            availableVersion: pkgjsonfile.version,
            stagingPkgDir: moddir,
            elaborate: false,
            direct: false,
            // If local is true means that this module
            // is installed under node_modules directory of
            // the package.
            local: false,
         };

         ans.push(dep);

      }

   } // end for

   return ans;

}; // end getDependenciesListByModules

// Return true if all dependencies are already present as ebuilds.
var checkIfDepsEbuildArePresent = function (ebuilder, pkg) {

   var ans = true;
   var idx = 0;
   var isPresent = true;

   // TODO: manage alias/custom name

   for (idx in pkg.dependencies) {

      if (pkg.excludeDependencies.indexOf(pkg.dependencies[idx].name) < 0) {
         isPresent = ebuild.isThereValidEbuild4Range(ebuilder.overlaydir,
                                                     ebuilder.category,
                                                     pkg.dependencies[idx].name,
                                                     pkg.dependencies[idx].version);

         logging.Logger.debug(
            sprintf('Check if is already present ebuild for package %s with version %s: %s.',
                    pkg.dependencies[idx].name,
                    pkg.dependencies[idx].version,
                    isPresent));


         if (!isPresent) {
            ans = false;
            break;
         }
      }

   } // end for

   return ans;

}; // end of checkIfDepsEbuildArePresent

var installPackageModules = function(ebuilder, pkg) {

   var instRes = false;
   var opts = {
      npm_opts: pkg.overrideNpmInstallOpts ?
         pkg.overrideNpmInstallOpts : ebuilder.npmInstallOpts,
   };

   logging.Logger.debug(sprintf("Installing package %s modules..",
                                pkg.name));

   instRes = npm.npmInstallDeps(pkg.stagingPkgDir, opts);

   if (!instRes) {
      throw 'Error on install node modules dependencies for package ' + pkg.name;
   }

   // Check package.json of all dependencies.

   var modulesDeps = getDependenciesListByModules(pkg);

   // Add dependencies to package if not already present.
   for (idx in modulesDeps) {

      if (!pkg.dependencies[modulesDeps[idx].name]) {
         pkg.dependencies[modulesDeps[idx].name] = modulesDeps[idx];
      } else {
         // POST: if dependency is already present set
         //       availableVersion attribute with current available
         //       version of module.
         pkg.dependencies[modulesDeps[idx].name].availableVersion =
            modulesDeps[idx].availableVersion;
      }

   } // end for


}; // end installPackageModules

var processPreliminaryAdapter = function(adapter, ebuilder, pkg) {

   var ans = false;
   var mod = false;
   var opts = undefined;

   try {

      if ("builtin" in adapter && adapter.builtin) {
         mod = require(sprintf('../adapters/%s', adapter.name));
      } else {
         mod = require(adapter.file);
      }

      // Check if are present adapters options
      if ("adapters_opts" in adapter) {
         opts = adapter.adapters_opts;
      }

      if (typeof mod.doPreliminary == 'function') {
         ans = mod.doPreliminary(ebuilder, pkg, opts);
      } else {
         throw 'Invalid adapter!';
      }

      if (ans) {
         pkg.needNpmInstall = true;
      }

   } catch (err) {

      logging.Logger.error(sprintf(
         "Error on process adapter %s: %s\nI exclude adapter and I force 'false'.",
         adapter.name, err));

   }

   return ans;

}; // end processPreliminaryAdapter

var callPreliminaryAdapters = function(ebuilder, pkg) {

   var defaultPreAdapters = [
      {
         name: 'pre-gyp',
         builtin: true,
      }
   ];

   var ans = false;

   var adapters = typeof ebuilder.preliminaryAdapters == 'undefined' ||
                  ebuilder.preliminaryAdapters.length == 0 ?
                  defaultPreAdapters : ebuilder.preliminaryAdapters;

   for (idx in adapters) {

      ans = processPreliminaryAdapter(adapters[idx], ebuilder, pkg);
      logging.Logger.debug(sprintf('Preliminary Adapter %s return: %s',
                                   adapters[idx].name, ans));
      if (ans) {
         break;
      }

   } // end for adapters

   return ans;
}; // end callPreliminaryAdapters

var processEbuildAdapter = function(adapter, ebuilder, pkg) {

   var mod = false;
   var opts = undefined;

   try {

      if ("builtin" in adapter && adapter.builtin) {
         mod = require(sprintf('../adapters/%s', adapter.name));
      } else {
         mod = require(adapter.file);
      }

      // Check if are present adapters options
      if ("adapters_opts" in adapter) {
         opts = adapter.adapters_opts;
      }

      if (typeof mod.processEbuild == 'function') {
         mod.processEbuild(ebuilder, pkg, opts);
      } else {
         throw 'Invalid adapter!';
      }

   } catch (err) {

      logging.Logger.error(sprintf(
         "Error on process adapter %s: %s\nI exclude adapter and I force 'false'.",
         adapter.name, err));

   }

}; // end processEbuildAdapter


var callEbuildAdapters = function(ebuilder, pkg) {

   var defaultEbuildAdapters = [
      {
         name: 'ebuild-gyp',
         builtin: true,
      }
   ];

   var adapters = typeof ebuilder.ebuildAdapters == 'undefined' ||
                  ebuilder.ebuildAdapters.length == 0 ?
                  defaultEbuildAdapters : ebuilder.ebuildAdapters;

   for (idx in adapters) {

      ans = processEbuildAdapter(adapters[idx], ebuilder, pkg);
      logging.Logger.debug(sprintf('Process ebuild with Ebuilder Adapter %s.',
                                   adapters[idx].name));

   } // end for adapters

}; // callEbuildAdapters

var translateDepVersion = function(ebuilder, name, range) {

   var ans = [];

   if (range == "*") {

      ans.push(sprintf("%s/%s", ebuilder.category, name));

   } else if (range.substring(0, 1) == "^") {
      // POST: range contains value like "^0.1.0"
      ans = ebuild.getValidRange4Version(ebuilder.category, name, range);

   } else if (range.substring(0, 1) == "~") {
      // POST: range contains value like "~0.1.0"
      ans = ebuild.getValidRange4Version(ebuilder.category, name, range);

   } else {
      // POST: range contains value related with a particular version
      //       like "0.1.0"

      ans.push(sprintf("%s/%s-%s", ebuilder.category,
                       name, ebuild.gentoofyVersion(range)));
   }

   return ans;

}; // end translateDepVersion

var prepareEbuildDependencies = function(ebuilder, pkg) {

   var idx = 0;
   var evers = "";
   var depsStrings = undefined;
   var lver = undefined;
   var systemDep = false;
   var excluded = false;

   for (idx in pkg.dependencies) {

      systemDep = "local" in pkg.dependencies[idx] && pkg.dependencies[idx].local ?
         false : true;
      notExclude = pkg.excludeDependencies.indexOf(pkg.dependencies[idx].name) < 0 ?
         true : false;

      if (pkg.dependencies[idx].direct && systemDep && notExclude) {

         lver = ebuild.getMajorEbuildVersion(ebuilder.overlaydir,
                                             ebuilder.category,
                                             pkg.dependencies[idx].name);
         evers = ebuild.getEbuildVersion4Range(ebuilder.overlaydir,
                                               ebuilder.category,
                                               pkg.dependencies[idx].name,
                                               pkg.dependencies[idx].version);

         if (evers) {

            pkg.ebuildFile.depend.push(
               sprintf(">=%s/%s-%s",
                       ebuilder.category,
                       ebuild.normalizePkgName(pkg.dependencies[idx].name,
                                               undefined,
                                               undefined,
                                               ebuilder.customNameMap),
                       ebuild.gentoofyVersion(evers)));

         } else if ("availableVersion" in pkg.dependencies[idx]) {

            // TODO: manage lver and if use npm_sys_modules options.
            pkg.ebuildFile.depend.push(
               sprintf(">=%s/%s-%s",
                       ebuilder.category,
                       ebuild.normalizePkgName(pkg.dependencies[idx].name,
                                               undefined,
                                               undefined,
                                               ebuilder.customNameMap),
                       ebuild.gentoofyVersion(
                          pkg.dependencies[idx].availableVersion)));



         } else {

            depsStrings = translateDepVersion(ebuilder,
                                              pkg.dependencies[idx].name,
                                              pkg.dependencies[idx].version);

            for (d in depsStrings) {
               pkg.ebuildFile.depend.push(depsStrings[d]);
            } // end for

         }

      } // end if (pkg.dependencies[idx].direct)
   } // end for

}; // end prepareEbuildDependencies

var inQueuePkgDeps4Processing = function(ebuilder, pkg) {

   var idx = 0;
   var p = undefined;
   var isPresent = false;
   var pkg2Elaborate = undefined;
   var pj = undefined;
   var systemDep = false;
   var notExclude = false;
   var version = undefined;

   for (idx in pkg.dependencies) {

      p = pkg.dependencies[idx];

      isPresent = false;
      version = undefined;
      notExclude = pkg.excludeDependencies.indexOf(p.name) < 0 ? true : false;
      systemDep = "local" in p && p.local ? false : true;

      if ("availableVersion" in p) {
         version = p.availableVersion;
      } else if (notExclude) {

         // POST: If availableVersion is not present I try
         //       to retrieve version from package.json file
         //       of the module.
         pj = tools.loadPkgFile(p.stagingPkgDir);
         if (!pj) {
            throw sprintf('Error on retrieve version of dependencies %s (%s)!',
                          p.name, p.version);
         }

         version = pj.version;
      }

      if (notExclude && version) {

         // Check if already present ebuild
         isPresent = ebuild.isThereValidEbuild4Range(ebuilder.overlaydir,
                                                     ebuilder.category,
                                                     p.name, version);

      }

      logging.Logger.debug(sprintf(
         '[%s] For package %s-%s: isPresent = %s, systemDep = %s, notExclude = %s',
         'inQueuePkgDeps4Processing', p.name, (version ? version : "N.A."),
         isPresent, systemDep, notExclude));

      if ((!isPresent) && systemDep && notExclude) {

         pkg2Elaborate = new core.PackageData();
         pkg2Elaborate.name = p.name;
         pkg2Elaborate.stagingPkgDir = p.stagingPkgDir;
         pkg2Elaborate.version = version;


         if (ebuilder.addPackage(pkg2Elaborate)) {

            logging.Logger.info(sprintf(
               'In queue package %s (version %s) for ebuild creation.',
               p.name, pkg2Elaborate.version));

         } else {

            logging.Logger.info(sprintf(
               'Package %s (version %s) is already in queue.',
               p.name, pkg2Elaborate.version));

         }

      }


   } // end for

}; // end inQueuePkgDeps4Processing

var processPackageData = function(ebuilder, pkg) {

   var installDeps = false;
   var ebuildsArePresent = false;

   // Check input parameter. TODO

   logging.Logger.info(sprintf("Processing package %s ...",
                               (pkg.name ? pkg.name : '')));

   // Complete initialization of Package data object with
   // missing parameters (version, description, etc.)
   normalizePackage(ebuilder, pkg);
   logging.Logger.debug(sprintf("Package %s normalized correctly.", pkg.name));

   // Check if ebuild is already present
   if (ebuild.isPresentEbuild(ebuilder.overlaydir, ebuilder.category,
                              pkg.getEbuildPkgName(), pkg.version)) {

      if (ebuilder.force) {

         ebuild.removeEbuild(ebuilder.overlaydir, ebuilder.category,
                             pkg.getEbuildPkgName(), pkg.version);

      } else {
         logging.Logger.info(
            sprintf(
               "Ebuild of package %s with version %s is already present. Nothing to do.",
               pkg.getEbuildPkgName(), pkg.version));

         return;
      }

   }

   // Call package initial filter to check if it is needed
   // execute npm install
   installDeps = callPreliminaryAdapters(ebuilder, pkg);
   logging.Logger.debug(sprintf(
      "Package %s on execute preliminary adapters %s install of modules.",
      pkg.name,
      installDeps ? "require" : "doesn't require"
   ));

   check4OptionalDependencies(ebuilder, pkg);

   // Check if ebuild for dependencies are already present.
   ebuildsArePresent = checkIfDepsEbuildArePresent(ebuilder, pkg);
   logging.Logger.debug(sprintf(
      "Package %s dependencies %s.",
      pkg.name,
      ebuildsArePresent ?
         "are already present has ebuilds" : "aren't all present"
   ));

   if ((!ebuildsArePresent) || installDeps) {

      installPackageModules(ebuilder, pkg);

   }

   if (!installDeps) {

      if (!pkg.ebuildFile.npm_gyp_pkg) {
         pkg.ebuildFile.npm_no_deps = true;
      }

   }

   // Call ebuilds adapters
   callEbuildAdapters(ebuilder, pkg);

   prepareEbuildDependencies(ebuilder, pkg);

   if (!ebuildsArePresent) {

      inQueuePkgDeps4Processing(ebuilder, pkg);

   }

   ebuild.writeEbuildFile(ebuilder.overlaydir, ebuilder.category,
                          pkg.getEbuildPkgName(), pkg.version,
                          pkg.ebuildFile);

   if (ebuilder.debug) {
      logging.Logger.info(sprintf("For package %s and version %s create ebuild file:\n%s\n",
                                  pkg.getEbuildPkgName(), pkg.version,
                                  ebuild.produceEbuildFile(pkg.ebuildFile)));
   }

   logging.Logger.info(sprintf("Created ebuild for package %s, version %s.",
                               pkg.getEbuildPkgName(), pkg.version));

   ebuild.createManifest(ebuilder.overlaydir, ebuilder.category,
                         pkg.getEbuildPkgName(), pkg.version);


   logging.Logger.info(sprintf("Created Manifest for package %s, version %s.",
                               pkg.getEbuildPkgName(), pkg.version));

}; // end processPackageData

exports.processPackageData = processPackageData;
exports.normalizePackage = normalizePackage;
exports.getDependenciesListByModules = getDependenciesListByModules;

// vim: ts=3 sw=3 expandtab
