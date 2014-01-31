#!/usr/bin/env node

const Workshopper = require('workshopper')
    , path        = require('path')

Workshopper({
    name     : 'mongodb-aggregate-adventure'
  , title    : 'MONGODB AGGREGATE ADVENTURE!'
  , appDir   : __dirname
  , helpFile : path.join(__dirname, 'help.txt')
  , prerequisitesFile : path.join(__dirname, 'prerequisites.txt')
  , creditsFile : path.join(__dirname, 'credits.txt')
  , menu: {
    bg: 'cyan',
    fg: 'white'
  }
}).init()