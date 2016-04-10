// -----------------------------------------------
// Author: geaaru, geaaru<@>gmail.com
// Version: $Id$
// -----------------------------------------------

require('shelljs/global');

var grep = require('simple-grep');
var replaceall = require('replaceall');
var ebuild = require('../lib/ebuild'),
   sprintf = require('util').format;

var overlaydir = '/home/geaaru/geaaru_overlay/';

function simple_grep() {

   grep('NPMV1_ECLASS_VERSION', ebuild.getNpmEclassFile(overlaydir),
     function(list) {
        console.log(list);

        if (list.length > 0) {
           console.log(list[0].results);

        }

        // Output:
        //      [ { file: '48', results: [ [Object] ] } ]
        // [ { line_number: 'NPMV1_ECLASS_VERSION="0.1.0"', line: undefined } ]
        //
        // BROKEN!!!
     });

};

function exec_grep() {

   // Sync
   var output = exec(sprintf('grep --color=never %s %s',
                         'NPMV1_ECLASS2_VERSION',
                         ebuild.getNpmEclassFile(overlaydir)),
                 { silent : true } );

   var s = output.output.split('=');
   console.log(output);

   if (output.output) {
      console.log(s);

      console.log(replaceall('\n', '', replaceall('"', '', s[1])));
   }
};

function test_npm_version () {

   var version = ebuild.getNpmEclassVersion(overlaydir);

   console.log(version);

   console.log('is valid ' + ebuild.isValidNpmEclassVersion(overlaydir));
   console.log('is valid ' + ebuild.isValidNpmEclassVersionByStr(version));

}

// exec_grep();

test_npm_version();

// vim: ts=3 sw=3 expandtab
