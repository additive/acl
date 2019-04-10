const namespace = 'logger.spec.js'
const chalk = require('chalk')
const Logger = require('../src/logger')
const logger = new Logger(namespace, true)

test('Log single string without sequences', () => {
  const text = 'Something single here!'

  const expectation = logger.log(chalk.red(text))
  const result = logger.buildLogOut(logger.buildHeadline() + text)

  expect(expectation).toBe(result)
})

test('Log multi string without sequences', () => {
  const text = ['Something multi', 'here!']

  const expectation = logger.log(chalk.red(...text))
  const result = logger.buildLogOut(logger.buildHeadline() + text.join(' '))

  expect(expectation).toBe(result)
})

test('Log object', () => {
  const text = {
    nice: 'totally',
  }

  const expectation = logger.log(text)
  const result =
    logger.datetimeStamp +
    ' ' +
    logger.removeSequences(logger.buildHeadline()) +
    `{
  "nice": "totally"
}
`

  expect(expectation).toBe(result)
})
