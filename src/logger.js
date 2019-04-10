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
    this.tmpl = '($) ->'

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

  set template(string) {
    this.tmpl = string
  }

  get template() {
    return this.tmpl
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
    let text = this.buildHeadline(message[0])
    let out = null

    if (typeof message[0] === 'object') {
      out = message[0]
      out = JSON.stringify(out, null, 2)
      console.log(out)
      out =
        this.datetimeStamp +
        ' ' +
        this.removeSequences(this.buildHeadline()) +
        out +
        '\n'
    } else {
      message.shift()
      console.log(text, ...message)
      out = this.buildLogOut(text + message.join(''))
    }

    this._writeToLogFile(out)

    return out
  }

  error(message, object) {
    if (typeof message === 'object') {
      return 'Argument `message` must be a string!'
    }
    // prettier-ignore
    let text = `${this.tmpl.replace('$', this.name)} ${message}:\n${JSON.stringify(object, null, 2)}\n`
    this._writeToLogFile(this.datetimeStamp + ' ' + text + '\n')
    console.dir(object)
    throw new Error(chalk.red.bold(message))
  }

  empty(message) {
    if (!message) {
      console.log('\n')
    } else {
      console.log(message)
      this._writeToLogFile(this.datetimeStamp + ' ' + message + '\n')
    }
  }

  buildLogOut(string = '') {
    return this.datetimeStamp + ' ' + this.removeSequences(string) + '\n'
  }

  buildHeadline(headline = '') {
    return `${chalk.grey(this.tmpl.replace('$', this.name))} ${headline}`
  }

  removeSequences(...sequence) {
    sequence.forEach((t, i) => {
      sequence[i] = t.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ''
      )
    })
    return sequence.join('')
  }

  _writeToLogFile(text) {
    if (this.logToFile) {
      fs.appendFile(this.logPath, text, err => {
        if (err) console.log(err)
      })
    }
  }
}
