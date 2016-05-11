// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------

var init = require('./init'),
   core = require('../lib/core'),
   ebuild = require('../lib/ebuild');
var path = require('path');

var test_ebuild1 = function() {

   var e = core.EbuildPkgFile();

   e.description = "Rigorous implementation of RFC4122 (v1 and v4) UUIDs.";
   e.homepage = "https://www.npmjs.com/package/node-uuid";

   e.license = "MIT";
   e.keywords = "~amd64 ~arm";

   e.npm_bins_override = true;
   e.npm_bins = [
      "uuid => node-uuid"
   ];

   console.log("----------------------------------------");
   console.log(ebuild.produceEbuildFile(e));
   console.log("----------------------------------------");
};


console.log("BEGIN " + path.basename(__filename, '.js'));

test_ebuild1();

console.log("END " + path.basename(__filename, '.js'));

// vim: ts=3 sw=3 expandtab

