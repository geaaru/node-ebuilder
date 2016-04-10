// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------


require('shelljs/global');

var ebuild = require('../lib/ebuild');
var path = require('path');
var overlaydir = '/home/geaaru/geaaru_overlay/';

cat(ebuild.getNpmEclassFile(overlaydir));




// vim: ts=3 sw=3 expandtab
