const chalk = require('chalk')

// Modules
const helper = require('./helper')
const Logger = require('./logger')
const logger = new Logger('Uploader', true)

// Client
const Rsync = require('rsync')

module.exports = class Uploader {
  constructor() {
    this.configObj = {
      port: 22,
      local: './',
      remote: '~/',
      dryrun: false,
    }

    // signal handler function
    this.quitting = () => {
      if (this.rsyncPid) {
        this.rsyncPid.kill()
      }
      process.exit()
    }

    process.on('SIGINT', this.quitting) // run signal handler on CTRL-C
    process.on('SIGTERM', this.quitting) // run signal handler on SIGTERM
    process.on('exit', this.quitting) // run signal handler when main process exits
  }

  set config(obj) {
    this.configObj = { ...this.configObj, ...obj }
  }

  build() {
    const destinationString =
      this.configObj.user +
      '@' +
      this.configObj.host +
      ':' +
      this.configObj.remote

    logger.log(chalk.blue('Building rsync module...'))
    this.rsync = Rsync.build({
      destination: destinationString,
      shell: 'ssh',
      output: [this.__stdout, this.__stderr],
    })

    if (this.configObj.local) {
      this.rsync.source(this.configObj.local)
    }

    // -vrutP --delete
    this.rsync.set('verbose')
    this.rsync.set('recursive')
    this.rsync.set('update')
    this.rsync.set('times')
    this.rsync.set('progress')
    this.rsync.set('delete')

    if (this.configObj.dryrun) {
      this.rsync.set('dry-run')
      logger.log(chalk.red('Dry-run is now activated!'))
      logger.empty()
    }

    // find .rsyncsrc and .rsyncexl
    const rsSrcFilePath = helper.findFile(process.cwd(), '.rsyncsrc')
    const rsExlFilePath = helper.findFile(process.cwd(), '.rsyncexl')
    if (rsSrcFilePath) {
      this.rsync.set('--files-from', rsSrcFilePath)
    }
    if (rsExlFilePath) {
      this.rsync.set('--exclude-from', rsExlFilePath)
    }
  }

  start() {
    if (!this.rsync) return false

    const command = this.rsync.command()
    logger.empty()
    logger.log(
      'Use password:',
      chalk.bold.hex('#FFFFFF').bgBlue(this.configObj.pass)
    )
    logger.log('Executing...')
    logger.empty()
    logger.empty(chalk.grey(command))
    logger.empty()

    // copy password to clipboard
    this.__copyToClipboard(this.configObj.pass)

    this.rsyncPid = this.rsync.execute((error, code) => {
      if (error) {
        throw error
      }
      logger.log('Exited with code:', chalk.green(code))
    })
  }

  __copyToClipboard(text) {
    require('child_process').exec(`printf "${text}" | pbcopy`)
  }

  __stdout(data) {
    console.log(data.toString('utf-8'))
  }

  __stderr(data) {
    console.log(data.toString('utf-8'))
  }
}
