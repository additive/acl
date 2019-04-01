const path = require('path')
const fs = require('fs')

module.exports = {
  folderStructureExists(filePath) {
    let dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
      return true
    }
    this.folderStructureExists(dirname)
    fs.mkdirSync(dirname)
  },

  bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes == 0) return '0 Byte'
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))

    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
  },

  findFile(startPath = './', filter) {
    const ignore = ['.git', '.vscode', 'node_modules', 'tmp', 'cache', 'logs']
    if (!filter) {
      throw new Error('No filter!')
    }
    const files = fs.readdirSync(startPath)
    for (var i = 0; i < files.length; i++) {
      const filename = path.join(startPath, files[i])
      if (
        ignore.some(x => {
          return filename.indexOf(x) >= 0
        })
      ) {
        continue
      }
      const stat = fs.lstatSync(filename)
      if (stat.isDirectory()) {
        this.findFile(filename, filter) // recursive
      } else if (filename.indexOf(filter) >= 0) {
        return filename
      }
    }

    return false
  },
}
