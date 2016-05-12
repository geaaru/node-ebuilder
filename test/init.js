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

  ans.logFile = './node-ebuilder.log';
  ans.logLevel = 'debug';

  logging.initLogging(ans);

  return ans;
};

var initPreliminaryAdapters = function(ebuilder) {

   var adapters = [
      {
         name: 'pre-ls',
         builtin: true,
      },
      {
         name: 'pre-gyp',
         builtin: true,
      },
      {
         name: 'pre-force',
         builtin: true,
         adapters_opts: {
            checkOptionalDeps: true
         }
      }
   ];

   ebuilder.preliminaryAdapters = adapters;

};

var initEbuildAdapters = function(ebuilder) {

   var adapters = [
      {
         name: 'ebuild-gyp',
         builtin: true
      },
      {
         // NOTE: if it is used this adapter for a package
         //       then MUST be used also pre-force adapter for
         //       same module.
         name: 'ebuild-local-mods',
         builtin: true,
         adapters_opts: {
            pkgs: [
               {
                  name: 'sshpk',
                  localMods: [
                     'assert-plus'
                  ]
               }

            ]

         }
      }, // end ebuild-local-deps adapter
      {
         name: 'ebuild-npm-bins',
         builtin: true,
         adapters_opts: {
            pkgs: [
               {
                  name: 'node-uuid',
                  bins: [
                     'uuid => node-uuid',
                  ]
               },
               {
                  name: 'commander',
                  // Avoid install of files under bin directory
                  bins: []
               },
               {
                  name: 'mkdirp',
                  // Avoid install of files under bin directory
                  bins: []
               }
            ]

         }

      }, // end ebuild-npm-bins adapter
      {
         name: 'ebuild-npm-pkg-dirs',
         builtin: true,
         adapters_opts: {
            pkgs: [
               {
                  name: 'nan',
                  dirs: [
                     '*.h',
                  ]
               },
               {
                  name: 'http-signature',
                  dirs: [
                     'http_signing.md',
                  ]
               },
               {
                  name: 'moment-timezone',
                  dirs: [
                     'data',
                  ]
               },
               {
                  name: 'json-schema',
                  dirs: [
                     'draft-00',
                     'draft-01',
                     'draft-02',
                     'draft-03',
                     'draft-04',
                     'draft-zyp-json-schema-03.xml',
                     'draft-zyp-json-schema-04.xml'
                  ]
               },
               {
                  name: 'isarray',
                  dirs: [
                     'build',
                  ]
               },
               {
                  name: 'mime-db',
                  dirs: [
                     'db.json',
                  ]
               },
            ]


         }
      }, // end ebuild-npm-pkg-dirs adapter
      {
         name: 'ebuild-override-srcuri',
         builtin: true,
         adapters_opts: {
            pkgs: [
               {
                  name: 'form-data',
                  uri: 'http://registry.npmjs.org/${PN}/-/${PN}-${MY_V}.tgz'
               },
            ]

         }

      }, // end ebuild-override-srcuri adapter

      {
         name: 'ebuild-customize',
         builtin: true,
         adapters_opts: {
            pkgs: [
               {
                  name: 'form-data',
                  preCustomOptions: [
                     'MY_V=${PV/_rc/-rc}',
                  ],
                  // customOptions: []
               },
            ]

         }

      }, // end ebuild-customize adapter

      {
         name: 'ebuild-show-dropped',
         builtin: true,
      }, // end ebuild-show-dropped adapter
   ];

   ebuilder.ebuildAdapters = adapters;

};


exports.initBuilder = initBuilder;
exports.initPreliminaryAdapters = initPreliminaryAdapters;
exports.initEbuildAdapters = initEbuildAdapters;

// vim: ts=3 sw=3 expandtab
