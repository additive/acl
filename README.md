# ADDITIVE CLI

This package provides some CLI tools for use with some ADDITIVE projects.

## Install

`npm install --save-dev @additive/colt`

## Config

we are using [cosmiconfig](https://github.com/davidtheclark/cosmiconfig)

## Packager

```console
Usage: packager|p [options] [dest]

Zip some files and folders to an comfortable package.

Options:
  --files [files...]      optional array of files
  --folders [folders...]  optional array of folders
  --globs [globs...]      optional globs of files or folders
  -h, --help              output usage information
```

or add options via the config file:

```js
{
  packager: {
    files: ["index.js"],
    folders: ["src/"],
    globs: ["package*.json", ".*/"],
    destination: "tmp",
    filename: "additive-backup"
  }
}
```

## Uploader

```console
Usage: uploader|u [options]

Upload files and folders to a remote source. Options can be set in a separate config file.

Options:
  -h, --help  output usage information
```

add options via the config file:

```js
{
  uploader: {
    sources: [
      'modules/'
    ],
    includes: [
      '.editorconfig',
      'package*.json'
    ],
    excludes: ['.git/', 'logs', '._*', '.*/', '.*', 'node_modules/'],
    config: {
      host: '127.0.0.1',
      port: 22, // default
      user: 'root',
      pass: '',
      local: './',
      remote: '/srv/var/apache/vhosts',
      dryrun: true // run without syncing to the server
    }
  }
}
```

> At the moment we can not automaticall pass the password to rsync, that is why
> it will be copied into your clipboard. If we want to use it, we need to use
> sshpass on server side or any other solution.
