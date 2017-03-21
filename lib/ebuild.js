// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

var path = require('path'),
   sprintf = require('util').format,
   replaceall = require('replaceall'),
   semver = require('semver'),
   shell = require('shelljs'),
   path = require('path'),
   fs = require('fs');

var core = require('./core'),
   logging = require('./logging');

var npmEclassvar = 'NPMV1_ECLASS_VERSION';
var npmEclassFile = 'npmv1.eclass';
var npmEclassMinVer = '0.1.0';


var EbuildDefaults = function() {

   this.getEclassDocFiles = function() {
      var npmEclassDocFiles = [
         'ChangeLog', 'CHANGELOG.md', 'LICENSE.md',
         'LICENSE', 'LICENSE.txt', 'README',
         'README.md'
      ];

      return npmEclassDocFiles;
   };

   this.getEclassDirs = function() {

      var npmEclassDirs = [ 'lib' ];

      return npmEclassDirs;
   };

   this.getEclassBinDirs = function() {

      var npmEclassBinDir = [ 'bin' ];

      return npmEclassBinDir;
   };

   return this;

};

var getNpmEclassFile = function(overlaydir) {

   var odStat = fs.statSync(overlaydir);
   var npmEclass = undefined,
      dir = undefined;

   if (odStat.isDirectory()) {
      dir = (overlaydir.substring(overlaydir.length -1, overlaydir.length)) == '/' ?
             overlaydir.substring(0, overlaydir.length - 1) : overlaydir;
   } else {
      dir = path.dirname(overlaydir);
   }

   npmEclass = sprintf('%s/eclass/%s', dir, npmEclassFile);

   if (!path.isAbsolute(overlaydir)) {
      throw 'Overlay dir must be in ABS format!';
   }

   return npmEclass;
};

var npmEclassIsPresent = function(overlaydir) {

   var ans = false;
   var npmEclass = getNpmEclassFile(overlaydir);

   if (fs.existsSync(npmEclass)) {
      ans = true;
   }

   return ans;
};

var npmEclassVersion = function(overlaydir) {

   var ans = undefined;
   var npmEclass = getNpmEclassFile(overlaydir);

   var output = shell.exec(sprintf('grep --color=never %s %s', npmEclassvar, npmEclass),
                           { silent : true } );
   if (output.stderr) {
      throw 'Error on retrieve eclass version:\n' + output.stderr;
   } else if (!output.output) {
      throw sprintf('Missing %s variable on file %s!',
                    npmEclassvar, npmEclass);
   }

   var s = output.output.split('=');
   ans = replaceall('\n', '', replaceall('"', '', s[1]));

   return ans;
};

var isValidNpmEclassVersionByStr = function(npmVersion) {

   var ans = false;

   if (semver.valid(npmVersion)) {
      ans = semver.gte(npmVersion, npmEclassMinVer);
   }

   return ans;
};


var isValidNpmEclassVersion = function(overlaydir) {
   return isValidNpmEclassVersionByStr(npmEclassVersion(overlaydir));
};

var isPresentEbuild = function(overlaydir, category, name, version) {

   var ans = false;
   var f = sprintf('%s/%s/%s/%s-%s.ebuild',
                   overlaydir, category, name, name, version);

   try {

      var odStat = fs.statSync(f);
      if (odStat.isFile()) {
         ans = true;
      }

   } catch (err) {
      if (err.code != 'ENOENT') {
         throw sprintf('Error on check if present ebuild %s!', f);
      }
   }

   return ans;
};

var removeEbuild = function(overlaydir, category, name, version) {

   var ans = true;
   var f = sprintf('%s/%s/%s/%s-%s.ebuild',
                   overlaydir, category, name, name, version);

   try {

      f.unlinkSync(f);

   } catch (err) {
      ans = false;
   }

   return ans;

}; // end removeEbuild

var isPresentEbuildDir = function(overlaydir, category, name) {

   var ans = false;

   var dir = sprintf('%s/%s/%s', overlaydir, category, name);

   try {
      var odStat = fs.statSync(dir);
      if (odStat.isDirectory()) {
         ans = true;
      }

   } catch (err) {
      if (err.code != 'ENOENT') {
         throw sprintf('Error on check if exists package directory %s!',
                       dir);
      }

   }

   return ans;
};

var getListEbuildVersions = function(overlaydir, category, name) {

   var ans = [];

   var isPresDir = isPresentEbuildDir(overlaydir, category, name);
   var filename = undefined;
   var version = undefined;
   var n = undefined;

   if (isPresDir) {
      // Retrieve last version of package ebuild

      var dir = sprintf('%s/%s/%s', overlaydir, category, name);
      var files = fs.readdirSync(dir);

      for (idx in files) {

         n = files[idx];

         if (n.substring(0, 1) != '.' && path.extname(n) == '.ebuild') {

            filename = n;
            fver = filename.replace(name + '-', '').replace('.ebuild', '');
            fver = unGentoofyVersion(fver);

            if (semver.valid(fver)) {
               ans.push(fver);
            } else {
               throw sprintf('Invalid version (%s) for file %s.',
                             fver, filename);
            }
         }

      } // end for

   } // end if (isPresDir)

   return ans;
};

var getMajorEbuildVersion = function(overlaydir, category, name) {

   var ans = undefined;

   var isPresDir = isPresentEbuildDir(overlaydir, category, name);
   var filename = undefined;
   var version = undefined;
   var fver = undefined;
   var n = undefined;

   if (isPresDir) {
      // Retrieve last version of package ebuild

      var dir = sprintf('%s/%s/%s', overlaydir, category, name);
      var files = fs.readdirSync(dir);

      for (idx in files) {

         n = files[idx];

         if (n.substring(0, 1) != '.' && path.extname(n) == '.ebuild') {

            filename = n;
            fver = filename.replace(name + '-', '').replace('.ebuild', '');
            fver = unGentoofyVersion(fver);

            if (semver.valid(fver)) {
               if (!version || (version && (semver.gte(fver, version)))) {
                  version = fver;
               }
            } else {
               throw sprintf('Invalid version (%s) for file %s.',
                             fver, filename);
            }
         }

      } // end for

   } // end if (isPresDir)

   return version;
};

var getListSatisfiesVersions = function(list, range) {

   var ans = [];
   var idx = 0;

   for (idx in list) {
      if (semver.satisfies(list[idx], range)) {
         ans.push(list[idx]);
      }
   } // end for

   // TODO: check if replace satisfies with function semver.maxSatisfying

   return ans;
}

var getEbuildVersion4Range = function(overlaydir, category, name, range) {

   var ans = undefined;
   var lver = undefined;
   var listvers = undefined;
   var idx = 0;

   if (isPresentEbuildDir(overlaydir, category, name)) {

      lver = getMajorEbuildVersion(overlaydir, category, name);

      if (semver.satisfies(lver, range)) {
         ans = lver;
      } else {
         // Check between list of versions

         listvers = getListEbuildVersions(overlaydir, category, name);
         for (idx in listvers) {
            if (semver.satisfies(listvers[idx], range)) {
               ans = listvers[idx];
               break;
            }
         } // end for idx
      }

   }

   return ans;
};

var isThereValidEbuild4Range = function(overlaydir, category, name, range) {

   var ver = getEbuildVersion4Range(overlaydir, category, name, range);

   return (ver ? true : false);
};

var getValidRange4Version = function(category, name, range) {

   var ans = [];
   var str = undefined;
   var vers = undefined;
   var idx = 0;

   str = semver.validRange(range);

   vers = str.split(" ");

   for (idx in vers) {

      if (vers[idx].substring(0,1) == ">=") {

         ans.push(sprintf(">=%s/%s-%s", category, name,
                          replaceall('-rc', '_rc', vers[idx].substring(2))));

      } else if (vers[idx].substring(0,1) == "<") {

         ans.push(sprintf("<%s/%s-%s", category, name,
                          replaceall('-rc', '_rc', vers[idx].substring(1))));

      } else if (vers[idx].substring(0,1) == ">") {

         ans.push(sprintf(">%s/%s-%s", category, name,
                          replaceall('-rc', '_rc', vers[idx].substring(1))));

      }


   } // end for

   return ans;
};

var produceEbuildFile = function (efile) {

   var ans = "";
   var idx = 0;
   // Now npmv1.eclass support only SLOT=0
   var slot=0;

   if (!efile.description || efile.description.length == 0)
      throw 'Invalid description field!';

   if (!efile.homepage || efile.homepage.length == 0)
      throw 'Invalid homepage field!';

   // Add header rows
   for (idx in efile.ebuildHeader) {

      ans += efile.ebuildHeader[idx] + "\n";

   } // end for

   // Add node-ebuilder comment
   ans += "# Ebuild automatically produced by node-ebuilder.\n";

   // Add empty line
   ans += "\n";

   // Add EAPI variable
   ans += sprintf("EAPI=%s\n", efile.eapi);

   // Add empty line
   ans += "\n";

   if (efile.preCustomOptions.length > 0) {
      for (idx in efile.preCustomOptions) {
         ans += efile.preCustomOptions[idx] + "\n";
      }

      // Add empty line
      ans += "\n";
   }

   // Add DESCRIPTION variable
   ans += sprintf("DESCRIPTION=\"%s\"\n",
                  replaceall('"', '\'', efile.description));

   // Add HOMEPAGE variable
   ans += sprintf("HOMEPAGE=\"%s\"\n",
                  efile.homepage);

   // Add SRC_URI if available
   if (efile.src_uri_override) {
      ans += sprintf("SRC_URI=\"%s\"\n", efile.src_uri);
   }

   // Add empty line
   ans += "\n";

   // Add LICENSE if available
   if (efile.license) {
      ans += sprintf("LICENSE=\"%s\"\n", efile.license);
   }

   // Add SLOT variable
   ans += sprintf("SLOT=\"%s\"\n", slot);

   // Add KEYSWORDS if available
   if (efile.keywords) {
      ans += sprintf("KEYWORDS=\"%s\"\n", efile.keywords);
   }

   // Add IUSE
   ans += sprintf("IUSE=\"%s\"\n", efile.iuse);

   // Add empty line
   ans += "\n";

   // Add DEPEND variable
   ans += sprintf("DEPEND=\"\n");
   for (idx in efile.depend) {
      ans += "\t" + efile.depend[idx] + "\n";
   } // end for depend
   // close DEPEND variable value
   ans += sprintf("\"\n");

   // Add RDEPEND variable
   if (efile.rdepend.length > 1) {
      ans += sprintf("RDEPEND=\"\n");
      for (idx in efile.rdepend) {
         ans += "\t" + efile.rdepend[idx] + "\n";
      } // end for depend
      // close RDEPEND variable value
      ans += sprintf("\"\n");
   } else {
      ans += sprintf("RDEPEND=\"%s\"\n\n",
                     efile.rdepend.length > 0 ? efile.rdepend[0] : "");
   }

   if (efile.npm_pkg_name) {
      ans += sprintf("NPM_PKG_NAME=\"%s\"\n",
                     efile.npm_pkg_name);
   }

   if (efile.npm_packagedir) {
      ans += sprintf("NPM_PACKAGEDIR=\"%s\"\n",
                     efile.npm_packagedir);
   }

   if (efile.npm_github_mod) {
      ans += sprintf("NPM_GITHUP_MOD=\"%s\"\n",
                     efile.npm_github_mod);
   }

   // Set NPM_BINS variable if present
   if (efile.npm_bins_override) {

      ans += sprintf("NPM_BINS=\"\n");
      for (idx in efile.npm_bins) {
         ans += efile.npm_bins[idx] + "\n";
      } // end for depend
      // close NPM_BINS variable value
      ans += sprintf("\"\n");

   }

   if (efile.npm_sys_mods_override) {

      ans += sprintf("NPM_SYSTEM_MODULES=\"\n");
      for (idx in efile.npm_sys_modules) {
         ans += efile.npm_sys_modules[idx] + "\n";
      } // end for depend
      // close NPM_SYSTEM_MODULES variable value
      ans += sprintf("\"\n");

   }

   if (efile.npm_pkg_dirs_override) {

      ans += sprintf("NPM_PKG_DIRS=\"\n");
      for (idx in efile.npm_pkg_dirs) {
         ans += efile.npm_pkg_dirs[idx] + "\n";
      }
      // close NPM_PKG_DIRS variable value
      ans += sprintf("\"\n");

   }

   // Set NPM_NO_DEPS variable to 1 is equal to true
   if (efile.npm_no_deps) {
      ans += "NPM_NO_DEPS=1\n";
   }

   // Set NPM_GYP_PKG variable to 1 is npm_gyp_pkg is true
   if (efile.npm_gyp_pkg) {
      ans += "NPM_GYP_PKG=1\n";
   }

   // Add empty line
   ans += "\n";

   if (efile.override_s) {
      ans += sprintf("S=\"%s\"\n\n", efile.s);
   }

   // Add inherit instruction
   ans += "inherit";
   for (idx in efile.inherits) {
      ans += " " + efile.inherits[idx];
   } // end for
   ans += "\n";

   // Add empty line
   ans += "\n";

   if (efile.customOptions.length > 0) {
      for (idx in efile.customOptions) {
         ans += efile.customOptions[idx] + "\n";
      }

      // Add empty line
      ans += "\n";
   }

   return ans;
};

var normalizePkgName = function (name, gitUrl, tarball, customNameList) {

   var ans = name;

   if (typeof customNameList != 'undefined' && customNameList.length > 0) {

      // TODO
   } else {

      // Replace . on name with -
      ans = replaceall('.', '-', ans);

      // Replace -_ with -
      ans = replaceall('-_', '-', ans);

   }

   return ans;
};

var gentoofyVersion = function (version) {

   return replaceall('-rc', '_rc', version);

};

var unGentoofyVersion = function (version) {

   return replaceall('_rc', '-rc', version);

}

var writeEbuildFile = function (overlaydir, category, name, version, ebuildFile) {

   var dir = sprintf('%s/%s/%s', overlaydir, category, name);
   var file = sprintf('%s/%s-%s.ebuild', dir, name,
                      gentoofyVersion(version));

   // Create package dir
   shell.mkdir('-p', dir);

   fs.writeFileSync(file, produceEbuildFile(ebuildFile));

   logging.Logger.info(sprintf('Created file %s for package %s-%s',
                               file, name, version));

}; // end writeEbuildFile

var createManifest = function (overlaydir, category, name, version) {

   var pwd = shell.pwd();

   var dir = sprintf('%s/%s/%s', overlaydir, category, name);
   var file = sprintf('%s-%s.ebuild', name, gentoofyVersion(version));
   var cmd = sprintf('ebuild %s digest', file);

   // Export PORTDIR_OVERLAY environment variable
   process.env['PORTDIR_OVERLAY'] = overlaydir;

   shell.cd(dir);

   logging.Logger.debug(sprintf('Executing...:\n%s', cmd));

   var output = shell.exec(cmd, { silent : true });

   if (output.stderr) {

      logging.Logger.error(sprintf('Error on create Manifest for package %s-%s:\n%s',
                                   name, version, output.stderr));

      shell.cd(pwd);

      throw sprintf('Error on create Manifest file for pacakge %s!', name);

   }

   logging.Logger.info(sprintf('Created Manifest for package %s-%s:\n%s',
                               name, version, output.output));

   shell.cd(pwd);
};

// Variables
exports.npmEclassMinVer = npmEclassMinVer;

// Functions
exports.getNpmEclassFile = getNpmEclassFile;
exports.npmEclassVersion = npmEclassVersion;
exports.getNpmEclassVersion = npmEclassVersion;
exports.isPresentNpmEclass = npmEclassIsPresent;
exports.isValidNpmEclassVersion = isValidNpmEclassVersion;
exports.isValidNpmEclassVersionByStr = isValidNpmEclassVersionByStr;
exports.isPresentEbuild = isPresentEbuild;
exports.isPresentEbuildDir = isPresentEbuildDir;
exports.getMajorEbuildVersion = getMajorEbuildVersion;
exports.getListEbuildVersions = getListEbuildVersions;
exports.isThereValidEbuild4Range = isThereValidEbuild4Range;
exports.produceEbuildFile = produceEbuildFile;
exports.normalizePkgName = normalizePkgName;
exports.getEbuildVersion4Range = getEbuildVersion4Range;
exports.getValidRange4Version = getValidRange4Version;
exports.writeEbuildFile = writeEbuildFile;
exports.removeEbuild = removeEbuild;
exports.createManifest = createManifest;
exports.gentoofyVersion = gentoofyVersion;
exports.unGentoofyVersion = unGentoofyVersion;

// Objects
exports.ebuildDefaults = new EbuildDefaults();

// vim: ts=3 sw=3 expandtab
