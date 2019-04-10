#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const systemPathToDownloads = require('downloads-folder')()

// get config
const cosmiconfig = require('cosmiconfig')
const explorer = cosmiconfig('colt') // name of our package
const explorerResult = explorer.searchSync()
const config = explorerResult.config

// modules
const Packager = require('../src/packager')
const Uploader = require('../src/uploader')

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Program: base
program
  .version(process.env.npm_package_version, '-V, --version')
  .usage('[command] <options ...>')
  .option('-v, --verbose', 'turns on verbosity', 0)

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Program: packager
program
  .command('packager [dest]')
  .alias('p')
  .option('--files [files...]', 'optional array of files', list)
  .option('--folders [folders...]', 'optional array of folders', list)
  .option('--globs [globs...]', 'optional globs of files or folders', list)
  .description('Zip some files and folders to a comfortable package.')
  .action((dest, args) => {
    const packager = new Packager()

    // Destination
    let downloadsFolder = systemPathToDownloads
    if (dest) {
      downloadsFolder = path.resolve(process.cwd(), dest)
    } else if (config.packager.destination) {
      downloadsFolder = path.resolve(process.cwd(), config.packager.destination)
    }
    const uniqId = require('uniqid').time()
    const destination = path.normalize(
      downloadsFolder + '/' + config.packager.filename + '-' + uniqId + '.zip'
    )
    packager.destination = destination

    // Files
    let files = config.packager.files
    if (args.files) files = args.files
    packager.files = files

    // Folders
    let folders = config.packager.folders
    if (args.folders) folders = args.folders
    packager.folders = folders

    // Globs
    let globs = config.packager.globs
    if (args.globs) globs = args.globs
    packager.globs = globs

    packager.start()
  })

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Program: uploader
program
  .command('uploader')
  .alias('u')
  .description(
    'Upload files and folders to a remote source. Options can be set in a separate config file.'
  )
  .action(args => {
    const uploader = new Uploader()

    // TODO: make single file rsync available with CLI command

    // Config
    let uploaderConfig = config.uploader
    if (!uploaderConfig) {
      throw new Error('No connection settings!')
    }
    uploader.config = uploaderConfig

    uploader.build()
    uploader.start()
  })

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Run
program.parse(process.argv)

// Check the program.args obj
const NO_COMMAND_SPECIFIED = program.args.length === 0

if (NO_COMMAND_SPECIFIED) {
  console.log('Please type in a command to execute!\n')

  program.help()
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Helper

function list(val) {
  return val.split(',')
}
