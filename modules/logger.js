const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const helper = require('./helper')

module.exports = class Logger {
  constructor(name, logToFile = false, cwd) {
    if (!name) {
      throw new Error('Please set a name!')
    }

    this.name = name
    this.cwd = cwd ? cwd : process.cwd()
    this.logToFile = logToFile

    if (this.logToFile) {
      helper.folderStructureExists(this.logPath)
    }
  }

  get now() {
    return new Date()
  }

  get date() {
    let now = this.now

    return now.getDate() < 10 ? '0' + now.getDate() : now.getDate()
  }

  get datetimeStamp() {
    let now = this.now
    let date = this.date

    return (
      date +
      '.' +
      (now.getMonth() + 1) +
      '.' +
      now.getFullYear() +
      ' @ ' +
      ('0' + now.getHours()).slice(-2) +
      ':' +
      ('0' + now.getMinutes()).slice(-2) +
      ':' +
      ('0' + now.getSeconds()).slice(-2)
    )
  }

  get dateStamp() {
    let now = this.now
    let date = this.date

    return date + '' + (now.getMonth() + 1) + '' + now.getFullYear()
  }

  get logPath() {
    return path.resolve(
      this.cwd,
      `logs/${this.name.toLowerCase()}-${this.dateStamp}.log`
    )
  }

  log(...message) {
    let text = chalk.grey(`(${this.name}) ->`) + ` ${message[0]}`

    if (typeof message[0] === 'object') {
      console.log(message[0])
    } else {
      message.shift()
      console.log(text, ...message)
      this._writeToLogFile(this.datetimeStamp + ' ' + text + message + '\n')
    }
  }

  empty(message) {
    if (!message) {
      console.log('\n')
    } else {
      console.log(message)
      this._writeToLogFile(this.datetimeStamp + ' ' + message + '\n')
    }
  }

  error(message, object) {
    console.log(object)
    let text = `(${this.name}) -> ${message}\n`
    this._writeToLogFile(this.datetimeStamp + ' ' + text + '\n')

    throw new Error(chalk.red.bold(message))
  }

  _writeToLogFile(text) {
    if (this.logToFile) {
      fs.appendFile(this.logPath, text, err => {
        if (err) console.log(err)
      })
    }
  }
}
