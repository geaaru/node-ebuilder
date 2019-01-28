# node-ebuilder

NodeJS module for create ebuild of nodejs modules with plugins or adapters support.

With adapters it's possible manage not standard packages: an example could be a package that inside
code uses a depedency that is included only as dev dependency, etc.

Require npmv1.eclass on target overlay directory from
[geaaru-overlay](https://github.com/geaaru/geaaru_overlay/blob/master/eclass/npmv1.eclass) project.


## npmv1 Eclass

Npmv1 eclass currently support EAPI 5 and EAPI 6.

### Main rules

Ebuild try to use standard NodeJs path `/usr/lib*/node_modules/` for install packages and
use variable `NODE_PATH` for override environment variables with right package paths.

So, packages tree will be:

```
/usr/lib64/node_modules/myproject/*.js
```

and where it's needed an old version of a dependency this will be installed under:

```
/usr/lib64/node_modules/myproject/node_modules/olddep
```

All works because on NODE_PATH is inserted first `node_modules` directory under `myproject` and then
general `node_modules` directory under `/usr/lib64`.

Currently, **it's support only one SLOT** and for this reason I softened packages dependencies restrictions
to avoid too many conflicts (yeah, i know this is not a good solution).

This means that **is better create test suites of released ebuilds before move in production**.

### Variables

| Ebuild Variable | Default | Description |
|-----------------|---------|-------------|
| NPM_DEFAULT_OPTS | -E --no-optional --production | Contains options used with npm program to download nodejs modules of the package. |
| NPM_PKG_NAME | ${PN} | Contains package name. |
| NPM_PACKAGEDIR | ${EROOT}usr/$(get_libdir) /node_modules/${NPM_PKG_NAME}/ | Contains default install directory of the package. |
| NPM_GITHUP_MOD | - | For nodejs module available on github identify user and module for automatically create SRC_URI. |
| NPM_BINS | - | If defined contains list of file used as binaries and related rename. |
| NPM_SYSTEM_MODULES | - | If defined permit to avoid install of the packages modules to insert on this variable. This permit to use module installed from another ebuild. When this options is used NPM_NO_DEPS must be with value a 0 or not present. |
| NPM_LOCAL_MODULES | - | It works in opposite of NPM_SYSTEM_MODULES to define modules that are installed locally on package directory and avoid use of system installed packages. It used always for sub-packages/sub-directories modules. When this options is used NPM_NO_DEPS must be with value a 0 or not present. |
| NPM_PKG_DIRS | - | Permit of defines additional directories or files to intall. Default install directory if available is lib directory. |
| NPM_NO_DEPS | - | If present and with value equal to 1 then disable download of node modules dependencies and install of node_modules directory. |
| NPM_GYP_BIN | - | Path of node-gyp program. |
| NPM_GYP_PKG | 0 | Identify if package has source to compile with node-gyp (value 1) or not (value 0). |
| NPM_NO_MIRROR | True | Boolean value that add RESTRICT="mirror" for download package from SRC_URI. Set to False to try to download package from gentoo mirrors. |

## Build Nodejs Ebuild

After copy npmv1.eclass under target overlay follow these steps:

* clone/unpack nodejs project

* run node-ebuilder:

```
node-ebuilder -c /home/user/node-ebuilder/config/config.json5 -d --dir /home/user/dev/mynodejs-project/
```


## Limitations

Most of limitations are related to current `npmv1` eclass.

* Single SLOT support

* Currently it's not supported new sub-directory dependencies [see issue.](https://github.com/geaaru/node-ebuilder/issues/3)


