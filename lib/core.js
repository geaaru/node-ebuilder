// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// Description: Contains object used internally.

const sprintf = require('util').format;

var EbuildPkgFile = (function() {

   this._this = this;

   // Related with NPM_PKG_NAME option
   this.npm_pkg_name = undefined;

   // Related with NPM_PACKAGEDIR option
   this.npm_packagedir = undefined;

   // Related with NPM_GITHUP_MOD variable
   this.npm_github_mod = undefined;

   // Related with NPM_BINS variable
   this.npm_bins_override = false;
   this.npm_bins = []

   // Related with NPM_SYSTEM_MODULES variable.
   this.npm_sys_mods_override = false;
   this.npm_sys_modules = [];

   // Related with NPM_LOCAL_MODULES variable.
   this.npm_local_mods_override = false;
   this.npm_local_modules = [];

   // Related with NPM_PKG_DIRS variable
   this.npm_pkg_dirs_override = false;
   this.npm_pkg_dirs = [];

   // Related with NPM_NO_DEPS variable
   this.npm_no_deps = false;

   // Related with NPM_GYP_PKG variable
   this.npm_gyp_pkg = false;

   // Related with SRC_URI variable
   this.src_uri_override = false;
   this.src_uri = undefined;

   // Content of DESCRIPTION ebuild variable
   this.description = undefined;

   // Content of HOMEPAGE ebuild variable
   this.homepage = undefined;

   // Content of LICENSE ebuild variable
   this.license = undefined;

   // Content of KEYWORDS ebuild variable
   this.keywords = undefined;

   // Content of IUSE ebuild variable
   this.iuse = "";

   // Override S ebuild variable or not
   this.override_s = true;
   this.s = "${WORKDIR}/package" ;

   // List of inherit of ebuild file
   this.inherits = [ 'npmv1' ] ;

   // Custom options added on ebuild file
   // after inherit option
   this.customOptions = [];

   // Custom options added before DESCRIPTION
   this.preCustomOptions = [];

   // Content of DEPEND ebuild variable
   this.depend = [];

   // Content of RDEPEND ebuild variable
   this.rdepend = [
      "${DEPEND}"
   ];

   // Content of EAPI ebuild variable
   this.eapi = "6";

   this.ebuildHeader = [
      "# Copyright 1999-2019 Gentoo Authors",
      "# Distributed under the terms of the GNU General Public License v2",
   ];

   this.addNpmLocalModule = function(pkgname) {

      // Use only first section for sub-directory
      var name = pkgname.substring(0, pkgname.indexOf('/'))

      // Check dependency is already present
      for (idx in this.npm_local_modules) {

         if (name == this.npm_local_modules[idx]) {
            // module is already present.
            // Nothing to do.
            return false;
         }

      }

      this.npm_local_mods_override = true;
      this.npm_local_modules.push(name);

      return true;
   }

   return this;
});

var PackageData = (function() {

   this._this = this;

   // Name of the package
   this.name = undefined;

   // Version of the package
   this.version = undefined;

   // url of tarball
   this.tarball = undefined;

   // git package
   this.gitPackage = false;

   // git url
   this.gitUrl = undefined;

   // git tag
   this.gitTag = undefined;

   // Description
   this.description = undefined;

   // Homepage
   this.homepage = undefined;

   // Dependencies
   this.dependencies = {};

   // List of PackageData dependencies
   this.pkgDependencies = [];

   // Custom name
   this.customName = undefined;

   // Custom portage category
   this.customCategory = undefined;

   // Staging package directory
   this.stagingPkgDir = undefined;

   this.nodeBuilder = undefined;

   // Is true if ebuild related with package is already
   // present on overlay directory or not (false).
   this.ebuildPresent = false;

   // Check if require call npm install (for example
   // for compenent where is present binding.gyp)
   this.needNpmInstall = false;

   // Override npm intall options for this package
   // For example on package sshpk dependencies ecc-jsbn
   // is present as dependencies and as optionalDependencies
   this.overrideNpmInstallOpts = undefined;

   // Ebuild file object
   this.ebuildFile = new EbuildPkgFile();

   // Content of package.json file of the package
   this.packageJson = undefined;

   // Elaboration in error (true) or not (false).
   this.inError = false;

   // Elaborate also optional dependencies
   this.useOptionalDependencies = false;

   // Exclude processing of dependencies on list
   this.excludeDependencies = [];

   // Error description
   this.errorException = undefined;

   this.getEbuildPkgName = function () {
      return (this.customName ? this.customName : this.name);
   }


   return this;
});

var NodeBuilder = (function () {

   this._this = this;

   // Overlay directory
   this.overlaydir = undefined;

   // Overlay category
   this.category = 'dev-node';

   // Npm default install options
   this.npmInstallOpts = '-E --no-optional --production';

   // Custom name list for override
   // package name to a different name
   // List of object PackageData.
   this.customNameMap = [];

   // Unpack directory where download packages with url.
   this.unpackDir = './staging';

   // List of package to exclude
   this.excludePkgs = [];

   // Npm binary path
   this.npmBinary = 'npm';

   // Logfile
   this.logFile = undefined;

   // Loglevel
   this.logLevel = 'info';

   // Logging timezone
   this.timezone = 'UTC';

   // List of Packages to Elaborate
   this.packages = [];

   // Custom package directories
   this.npmPkgDirs = undefined;

   // Architectures for ebuild
   this.ebuildArch = "~amd64";

   // Enable debug
   this.debug = false;

   // Enable/Disable quiet mode
   this.quiet = false;

   // List of preliminary adapters called after
   // loading of package.json file of package
   // to elaborate. It is used to identify
   // if is required execute npm install or not.
   this.preliminaryAdapters = [];

   // List of adapters called before create
   // ebuild file for initialize ebuild file
   // content.
   this.ebuildAdapters = [];

   // Force override of ebuild file
   // if ebuild is already present on package.
   this.force = false;

   // Packages in error.
   this.pkgsInError = [];


   // -- Functions -- //
   this.isPackageInError = function(pkg) {

      var ans = false;
      var idx = 0;

      if (this.pkgsInError.length > 0) {
         for (idx in this.pkgsInError) {

            if (this.pkgsInError[idx].name == pkg.name &&
                this.pkgsInError[idx].version == pkg.version) {
               // Package is already in error
               // Nothing to do.
               ans = true;
               break;
            }

         } // end for
      }

      return ans;
   };

   this.addPackage = function(pkg) {

      var idx = 0;
      var inError = false;
      pkg.nodeBuilder = this;

      // Check if package is already in queue
      if (this.packages.length > 0) {
         for (idx in this.packages) {

            if (this.packages[idx].name == pkg.name &&
                this.packages[idx].version == pkg.version) {
               // Package is already in queue
               // Nothing to do.
               return false;
            }

         } // end for
      }

      // Check if package is already present
      // on error queue
      inError = this.isPackageInError(pkg);
      if (inError) { return false; }

      this.packages.push(pkg);

      return true;
   };

   this.addPackageInError = function(pkg) {

      // Check if packages is alreay in list
      var inError = this.isPackageInError(pkg);

      if (!inError) {
         this.pkgsInError.push(pkg);
      }
   };

   // Return an array with error summary
   this.summaryErrors = function() {

      var ans = [];
      var idx = 0;
      var p = undefined;

      if (this.pkgsInError.length > 0) {
         for (idx in this.pkgsInError) {
            p = this.pkgsInError[idx];
            ans.push(sprintf('Error on package %s (version %s):\n%s\n',
                             p.name, p.version, p.errorException));
         } // end for
      }

      return ans;

   };

   this.getEbuildAdapterByName = function(name) {

      var idx = 0;
      var ans = undefined;

      for (idx in this.ebuildAdapters) {

         if (this.ebuildAdapters[idx].name == name) {
            ans = this.ebuildAdapters[idx];
            break;
         }

      } // end for

      return ans;
   };

   return this;
});


// Objects
exports.EbuildPkgFile = EbuildPkgFile;
exports.NodeBuilder = NodeBuilder;
exports.PackageData = PackageData;

// vim: ts=3 sw=3 expandtab
