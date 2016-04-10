// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

const argv = require('minimist')(process.argv.slice(2)),
   fs = require('fs'),
   core = require('./core');

var helpMessage = function() {

  ans = "=== Node Ebuilder ===\n" +
        "Author: Geaaru, geaaru@gmail.com\n" +
        "\n" +
        "Node Ebuilder command line parameters:\n" +
        "\n" +
        "-h|--help               This message.\n" +
        "-c|--config [F]         Configuration file.\n" +
        "                        Mandatory parameter with ABS path.\n" +
        "-d|--debug              Enable debugging on standard output.\n" +
        "--url [U]               Url of package tarball.\n" +
        "--git-url [U]           Url of git project of the package.\n" +
        "--dir [D]               ABS Path of package directory.\n" +
        "--quiet|-q              Quiet mode, avoid end summary with ebuild created.\n";

  return ans;

};

var parsePackage = function(pkgOpts, idx) {

   var pkgAttrs = ['name', 'version', 'tarball', 'gitPackage',
                  'gitUrl', 'gitTag', 'customName', 'customCategory',
                  'stagingPkgDir' ] ;

   var ans = new core.PackageData();
   var validOpts

   for (opt in pkgOpts) {
      if (pkgAttrs.indexOf(opt)+1) {
         ans[opt] = pkgOpts[opt];
      } // end if
   } // end for

   if (!ans.name || !ans.version) {
      throw 'Invalid package option on entry ' + idx + '!';
   }

   return ans;
};

var parseConfig = function(ebuilder, opts) {

   var configurableOpts = ['overlaydir', 'category', 'npmInstallOpts',
                           'customNameMap', 'excludePkgs', 'npmBinary',
                           'logFile', 'logLevel', 'timezone',
                           'packages', 'unpackDir'];

   // Check NodeBuilder options
   for (opt in opts) {
      if (configurableOpts.indexOf(opt)+1) {
         if (opt == 'packages') {
            var pkgs = opts[opt];
            for (idx in pkgs) {
               ebuilder.addPackage(parsePackage(pkgs[idx], idx));
            } // end for idx
         } else {
            ebuilder[opt] = opts[opt];
         }
      }

   } // end for

};

var parseLineOpts = function(ebuilder) {

   if ("d" in argv || "debug" in argv) {
      ebuilder.debug = true;
   }

   if ("q" in argv || "quiet" in argv) {
      ebuilder.quiet = true;
   }

   if ("dir" in argv) {
      // Create a new empty package
      var pkg = new core.PackageData();
      pkg.stagingPkgDir = argv.dir;
      ebuilder.addPackage(pkg);
   }

}

var parseCmdLine = function() {

   var hasConfig = false,
      conffile = null,
      confopts = null;

   if ("h" in argv || "help" in argv) {
      console.log(helpMessage());
      process.exit(1);
   }

   // Check if --config option is present
   if ("config" in argv) {
      conffile = argv.config;
      hasConfig = true;

      // Check if -c option is present
   } else if ("c" in argv) {
      conffile = argv.c;
      hasConfig = true;
   }

   if (!hasConfig) {
      console.log("Missing configuration file parameter!");
      process.exit(1);
   }

   // Check if exist configuration file
   try {
      if (!fs.statSync(conffile).isFile()) {
         console.log("Invalid file " + conffile);
         process.exit(1);
      }
   } catch (err) {
      console.log("Invalid file " + conffile + ": " + err);
      process.exit(1);
   }

   // Try to load configuration files.
   try {

      confopts = require(conffile);

   } catch (err) {
      console.log("Syntax error on file " + conffile + ": " + err);
      process.exit(1);
   }

   var ans = new core.NodeBuilder();

   parseConfig(ans, confopts);

   parseLineOpts(ans);

   return ans;
};

exports.parseCmdLine = parseCmdLine;

// vim: ts=3 sw=3 expandtab
