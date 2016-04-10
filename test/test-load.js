// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------

var init = require('./init'),
   tools = require('../lib/tools');
var path = require('path');


var test_load = function() {

   console.log("BEGIN " + path.basename(__filename, '.js'));

   builder = init.initBuilder();

   pkg = tools.loadPkgFile(path.normalize(path.dirname(process.argv[1]) + '/' ));

   console.log(pkg);

   console.log("END " + path.basename(__filename, '.js'));
};


main();


// vim: ts=3 sw=3 expandtab
