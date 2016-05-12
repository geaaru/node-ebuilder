// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------

var init = require('./init'),
   core = require('../lib/core'),
   sprintf = require('util').format,
   logging = require('../lib/logging');
var path = require('path');


var test_log1 = function() {

   ebuilder = init.initBuilder();
   ebuilder.force = true;

   init.initPreliminaryAdapters(ebuilder);
   init.initEbuildAdapters(ebuilder);

   logging.Logger.info('TEST LOG1!');
};

console.log("BEGIN " + path.basename(__filename, '.js'));

test_log1();

console.log("END " + path.basename(__filename, '.js'));


// vim: ts=3 sw=3 expandtab
