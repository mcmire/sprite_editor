path    = require 'path'
console = require 'console'
glob    = require 'glob'

projectRoot = path.resolve(__dirname, "../../..")
require.paths.unshift path.join(projectRoot, "app/javascripts/lib")
require.paths.unshift path.join(projectRoot, "public/javascripts/vendor")

require 'ender'