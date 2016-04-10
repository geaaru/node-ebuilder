// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------

var core = require('../lib/core'),
  logging = require('../lib/logging');
var fs = require('fs');

var initBuilder = function () {

  var ans = new core.NodeBuilder();
  ans.debug = true;
  ans.overlaydir = '/tmp/node-ebuilder-overlay';

  if (!fs.existsSync(ans.overlaydir)) {
      console.log("Created " + ans.overlaydir + " for test module.");
      fs.mkdirSync(ans.overlaydir);
  }

  logging.initLogging(ans);

  return ans;
};


exports.initBuilder = initBuilder;

// vim: ts=3 sw=3 expandtab
