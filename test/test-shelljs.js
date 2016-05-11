// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


require('shelljs/global');

var ebuild = require('../lib/ebuild');
var path = require('path');
var overlaydir = '/home/geaaru/geaaru_overlay/';

var test_error_mkdir = function() {

   var ans = mkdir('-p', '/root/error');

   console.log("ERROR:");
   console.log(ans);
};

var test_cat = function() {

   cat(ebuild.getNpmEclassFile(overlaydir));

};

var test_ls = function() {

   console.log('LS -l');
   console.log(ls('-l', '.'));

   console.log('LS');
   console.log(ls('.'));
};

console.log("BEGIN " + path.basename(__filename, '.js'));

test_ls();


console.log("END " + path.basename(__filename, '.js'));

// vim: ts=3 sw=3 expandtab
