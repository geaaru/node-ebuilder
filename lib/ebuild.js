// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$

var path = require('path'),
   sprintf = require('util').format,
   replaceall = require('replaceall'),
   semver = require('semver'),
   shell = require('shelljs');
   fs = require('fs');

var npmEclassvar = 'NPMV1_ECLASS_VERSION';
var npmEclassFile = 'npmv1.eclass';
var npmEclassMinVer = '0.1.0';

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

// Variables
exports.npmEclassMinVer = npmEclassMinVer;

// Functions
exports.getNpmEclassFile = getNpmEclassFile;
exports.npmEclassVersion = npmEclassVersion;
exports.getNpmEclassVersion = npmEclassVersion;
exports.isPresentNpmEclass = npmEclassIsPresent;
exports.isValidNpmEclassVersion = isValidNpmEclassVersion;
exports.isValidNpmEclassVersionByStr = isValidNpmEclassVersionByStr;

// vim: ts=3 sw=3 expandtab
