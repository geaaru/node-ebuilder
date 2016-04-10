// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// Description: Contains object used internally.

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

   // -- Functions -- //
   this.addPackage = function(pkg) {
      this.packages.push(pkg);
      pkg.nodeBuilder = this;
   };

   // Enable debug
   this.debug = false;

   // Enable/Disable quiet mode
   this.quiet = false;

   return this;
});


exports.NodeBuilder = NodeBuilder;
exports.PackageData = PackageData;

// vim: ts=3 sw=3 expandtab
