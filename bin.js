#!/usr/bin/env node

var chalk = require('chalk')
var chokidar = require('chokidar')
var respawn = require('respawn')

var BIN_SH = process.platform === 'android' ? '/system/bin/sh' : '/bin/sh'
var CMD_EXE = process.env.comspec || 'cmd.exe'
var pad = ['', '    ', '   ', '  ', ' ', '']

var cmd = 'node ' + process.argv.slice(2).join(' ')
var count = 0

var m = spawn(cmd)
m.on('spawn', onspawn)
m.on('stdout', onstdout)
m.on('stderr', onstderr)
m.start()

var w = chokidar.watch(process.cwd(), { ignored: /\.swp$/ })
w.on('change', restart)
w.on('unlink', restart)

function restart () {
  m.stop(), m.start()
}

function onspawn () {
  if (count++) log(cmd, 'green')
}

function onstdout (message) {
  log(message, 'gray')
}

function onstderr (message) {
  log(message, 'red')
}

function log (message, color) {
  var ln = message.toString().split('\n')
  if (ln[ln.length - 1] === '') ln.pop()

  var i = 0, l = ln.length
  for (; i < l; i++) ln[i] = prefix(m.pid) + ln[i]
  console.log(chalk[color](ln.join('\n')))
}

function prefix (pid) {
  return pid + pad[('' + pid).length] + ': '
}

function spawn (cmd) {
  var args = [BIN_SH, '-c', cmd]
  var opts = { env: process.env, maxRestarts: Infinity }
  if (process.platform === 'win32') {
    args = [CMD_EXE, '/d', '/s', '/c', '"' + cmd + '"']
    opts.windowsVerbatimArguments = true
  }
  return respawn(args, opts)
}
