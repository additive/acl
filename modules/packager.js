const archiver = require('archiver')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')

// Modules
const helper = require('./helper')
const Logger = require('./logger')
const logger = new Logger('Packager', true)

module.exports = class Packager {
  constructor() {
    this.filesList = []
    this.foldersList = []
    this.globsList = []

    // setup
    this.archiver = archiver('zip')
    this.totalBytes = 0

    // events
    this.archiver.on('progress', this.onProgress)
    this.archiver.on('end', this.onEnd)
    this.archiver.on('error', this.onError)
  }

  set destination(dest) {
    this.destinationPath = dest
  }

  set files(files) {
    this.filesList = files === true ? false : files
  }

  set folders(folders) {
    this.foldersList = folders === true ? false : folders
  }

  set globs(globs) {
    this.globsList = globs === true ? false : globs
  }

  async start() {
    const checksPassed = await this.checks()
    if (!checksPassed) {
      logger.error(chalk.red.bold('Not all checks have passed!'))

      return false
    }

    logger.log('Creating writable stream:', this.destinationPath)
    this.destinationStream = await fs.createWriteStream(this.destinationPath)
    this.archiver.pipe(this.destinationStream)

    // Files and directories to zip

    if (this.filesList) {
      this.filesList.forEach(file => {
        logger.log('Add file to archiver:', file)
        this.archiver.file(file)
      })
    }

    if (this.foldersList) {
      this.foldersList.forEach(folder => {
        logger.log('Add folder to archiver:', folder)
        this.archiver.directory(folder)
      })
    }

    if (this.globsList) {
      this.globsList.forEach(glob => {
        logger.log('Add glob to archiver:', glob)
        this.archiver.glob(glob)
      })
    }

    logger.log(chalk.green('Start zipping...\n'))
    this.archiver.finalize()
  }

  // @static
  onProgress(progress) {
    let processedBytes = progress.fs.processedBytes
    this.totalBytes = progress.fs.totalBytes
    let percent = Math.round(
      100 - ((this.totalBytes - processedBytes) / this.totalBytes) * 100
    )
    let totalColor = ` (${percent} %)`

    if (percent < 33) {
      totalColor = chalk.red(totalColor)
    } else if (percent >= 33 && percent < 66) {
      totalColor = chalk.yellow(totalColor)
    } else if (percent >= 66) {
      totalColor = chalk.green(totalColor)
    }

    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write(
      chalk.grey(
        `${helper.bytesToSize(processedBytes)} / ${helper.bytesToSize(
          this.totalBytes
        )}`
      ) + totalColor
    )
  }

  // @static
  onEnd() {
    const archiveSize = this.pointer()

    console.log('\n')
    logger.log('Archiver wrote %s', helper.bytesToSize(archiveSize))
    logger.log(
      'Compression ratio: %d:1',
      Math.round(this.totalBytes / archiveSize)
    )
    logger.log(
      chalk.green('Space savings: %d %'),
      Math.round((1 - archiveSize / this.totalBytes) * 100)
    )
  }

  // @static
  onError(err) {
    logger.error(err)
  }

  async checks() {
    let destinationCheck = await this._checkIfDestinationExists()

    let folderCheck = false
    if (this.foldersList && this.foldersList.length !== 0) {
      folderCheck = await this._checkIfFoldersExists()
    }

    let filesCheck = false
    if (this.filesList && this.filesList.length !== 0) {
      filesCheck = await this._checkIfFilesExists()
    }

    let resume =
      destinationCheck === true && folderCheck === true && filesCheck === true

    return resume
  }

  _checkIfDestinationExists() {
    if (this.destinationPath) {
      helper.folderStructureExists(this.destinationPath)

      return true
    }

    return false
  }

  _checkIfFoldersExists() {
    let checks = true

    this.foldersList.forEach(folder => {
      if (!fs.existsSync(path.resolve(process.cwd(), folder))) {
        logger.log(chalk.red.bold(`Folder "${folder}" does not exist.`))

        checks = checks ? false : checks
      }
    })

    return checks
  }

  _checkIfFilesExists() {
    let checks = true

    this.filesList.forEach(file => {
      if (!fs.existsSync(path.resolve(process.cwd(), file))) {
        logger.log(chalk.red.bold(`File "${file}" does not exist.`))

        checks = checks ? false : checks
      }
    })

    return checks
  }
}
