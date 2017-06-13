// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------

var semver = require('semver'),
   sprintf = require('util').format,
   ebuild = require('../lib/ebuild');
var path = require('path');

var test_vers1 = function () {

  var v1 = '^0.2.0';
  var v2 = '0.1.0';
  var v3 = '0.3.0';
  var v4 = '0.2.1';


  console.log(sprintf('Version %s satisfies %s: %s',
                      v1, v2, semver.satisfies(v2, v1)));

  console.log(sprintf('Version %s satisfies %s: %s',
                      v1, v3, semver.satisfies(v3, v1)));

  console.log(sprintf('Version %s satisfies %s: %s',
                      v1, v3, semver.satisfies(v4, v1)));
};


var test_vers2 = function () {

  var v1 = '0.2.0';
  var v2 = '0.1.0';
  var v3 = '0.3.0';
  var v4 = '0.2.1';


  console.log(sprintf('Version %s satisfies %s: %s',
                      v1, v2, semver.satisfies(v2, v1)));

  console.log(sprintf('Version %s satisfies %s: %s',
                      v1, v3, semver.satisfies(v3, v1)));

  console.log(sprintf('Version %s satisfies %s: %s',
                      v1, v3, semver.satisfies(v4, v1)));
};

var test_vers3 = function () {

   var r1 = "^0.1.0";
   var r2 = "^1.0.0";

   console.log(semver.validRange(r1));
   console.log(semver.validRange(r2));

};

var test_vers4 = function () {

   var r1 = "~0.1.0";
   var r2 = "~1.0.0";

   console.log(semver.validRange(r1));
   console.log(semver.validRange(r2));

   console.log(typeof semver.validRange(r2));
};

var test_vers5 = function () {

   var v1 = "0.1.0";
   var v2 = "1.0.0";
   var v3 = "0.0.1";

   console.log(sprintf("major of version %s: %s", v1, semver.major(v1)));
   console.log(sprintf("major of version %s: %s", v2, semver.major(v2)));
   console.log(sprintf("major of version %s: %s", v3, semver.major(v3)));

   console.log(sprintf("minor of version %s: %s", v1, semver.minor(v1)));
   console.log(sprintf("minor of version %s: %s", v2, semver.minor(v2)));
   console.log(sprintf("minor of version %s: %s", v3, semver.minor(v3)));


   console.log(sprintf("patch of version %s: %s", v1, semver.patch(v1)));
   console.log(sprintf("patch of version %s: %s", v2, semver.patch(v2)));
   console.log(sprintf("patch of version %s: %s", v3, semver.patch(v3)));
};

var test_range_versions = function() {

   // Handle double-ended-queue version...

   var v = '2.1.0';
   var p_v = '^2.0.0-beta3';

   console.log(sprintf("ebuild version %s", v));

   console.log(sprintf("packet version %s", p_v));

   console.log(sprintf("Satisfy range: %s", semver.satisfies(v, p_v)));

};

var test_gentoofy1 = function() {

   version = '2.1.0-0';

   console.log(sprintf('gentoo %s => %s', version, ebuild.gentoofyVersion(version)));

}

console.log("BEGIN " + path.basename(__filename, '.js'));

//test_vers1();
//test_vers2();
//test_vers3();
//test_vers4();
//test_vers5();
//test_range_versions();
test_gentoofy1();

console.log("END " + path.basename(__filename, '.js'));

// vim: ts=3 sw=3 expandtab
