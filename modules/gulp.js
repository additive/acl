// TODO: make this available thorugh CLI

/*!
 * Easy to use ES6 and SCSS full featured compiler.
 */

const { task, src, dest, series, watch } = require('gulp')
const { resolve } = require('path')
const path = require('path')
const chalk = require('chalk')
const babel = require('gulp-babel')
const eslint = require('gulp-eslint')
const clean = require('gulp-clean')
const concat = require('gulp-concat')
const iftt = require('gulp-if')
const sourcemaps = require('gulp-sourcemaps')
const rev = require('gulp-rev')
const notifier = require('node-notifier')
const notify = require('gulp-notify')

const eslintPath = resolve(__dirname, '../../../.eslintrc.json')
const ENV = process.env.NODE_ENV
const isDev = ENV === 'development'
const SRC = resolve(__dirname, 'src')
const DEST = resolve(__dirname, 'dist')
const WATCH = `${SRC}/**/*.js`

/* Edit here */
const APP_NAME = 'additive_accordion'
const FILES = {
  datatables: [
    './node_modules/datatables.net-bs4/js/dataTables.bootstrap4.min.js',
    './node_modules/datatables.net-fixedcolumns-bs4/js/fixedColumns.bootstrap4.min.js',
    resolve(SRC, 'datatables.js'),
  ],
  featherlight: [
    './node_modules/featherlight/release/featherlight.min.js',
    resolve(SRC, 'featherlight.js'),
  ],
  featherlightGallery: [
    './node_modules/featherlight/release/featherlight.gallery.min.js',
    resolve(SRC, 'featherlightGallery.js'),
  ],
  mark: [resolve(SRC, 'mark.js')],
  plyr: [resolve(SRC, 'plyr.js')],
  scrollspy: [
    './node_modules/bootstrap/js/dist/scrollspy.js',
    resolve(SRC, 'scrollspy.js'),
  ],
}
/* End edit */

const TASKS = Object.keys(FILES)

const notifierOptions = {
  appName: APP_NAME,
  title: APP_NAME,
  message: 'Starting gulp...',
  sound: true,
}

console.log()
console.log(chalk.blue('Files'), FILES)
console.log(chalk.blue('Tasks'), TASKS)
console.log(chalk.blue('Watching'), WATCH)
console.log()

TASKS.forEach(name => {
  task('scripts:' + name, () => {
    return src(FILES[name])
      .pipe(concat(`${name}.js`))
      .pipe(iftt(isDev, sourcemaps.init()))
      .pipe(rev())
      .pipe(
        babel({
          presets: [
            [
              '@babel/preset-env',
              {
                targets: '> 0.25%, not dead',
              },
            ],
          ],
          minified: !isDev,
          comments: isDev,
        })
      )
      .pipe(dest(DEST)) // save .js
      .pipe(iftt(isDev, sourcemaps.write('.')))
      .pipe(dest(DEST)) // save .map
      .pipe(rev.manifest(`${DEST}/manifest.json`, { base: SRC, merge: true }))
      .pipe(dest(DEST)) // save manifest.json
      .pipe(notify(`Finished for ${name}`))
  })
})

task('scripts', series(TASKS.map(n => 'scripts:' + n)))

task('lint', () => {
  return src(WATCH)
    .pipe(
      eslint({
        configFile: eslintPath,
      })
    )
    .pipe(
      eslint.result(result => {
        if (result.messages.length > 0) {
          console.log() // EMPTY
          console.log(chalk.gray(result.filePath))
          console.log(result.messages)
        }
      })
    )
    .pipe(
      notify(file => {
        if (file.eslint.errorCount <= 0) {
          return false
        }

        const errors = file.eslint.messages.map(data => {
          return '(' + data.line + ':' + data.column + ') ' + data.message
        })

        return `${path.relative(__dirname, file.eslint.filePath)} (${
          file.eslint.errorCount
        } errors)\n ${errors[0]} …`
      })
    )
    .pipe(eslint.failAfterError())
})

task('clean', () => {
  return src(DEST, { read: false, allowEmpty: true }).pipe(clean())
})

task('start', cb => {
  notifier.notify(notifierOptions)
  cb()
})

task(
  'watch',
  series('start', 'lint', 'clean', 'scripts', () => {
    console.log('Watching:', WATCH)
    return watch(WATCH, series('scripts'))
  })
)

task('default', series('start', 'lint', 'scripts'))
