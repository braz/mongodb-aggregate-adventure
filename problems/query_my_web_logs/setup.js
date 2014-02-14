module.exports = function () {
  var async = require('async');
  const logsdoc  = require('../../data/logs.json');

  var server = 'mongodb://127.0.0.1:27017/test';
  var collectionname = 'logs';
  var MongoClient = require('mongodb').MongoClient 
      , format = require('util').format;

  async.series([
      // Setup for the exercise by ensuring there is no existing data
      function(callback) {
        MongoClient.connect(server, function(err, db) {
          if (err) return callback(err);

          db.dropCollection(collectionname, function(err, result) {
            if (err) return callback(err);

            db.collection(collectionname).insert(logsdoc, {w:1, fsync:true}, function(err, result) {
              if (err) return callback(err);              

              db.close(function(err, result) {
                if (err) return callback(err);
              }); //db.close
            }); //db.collection.insert
          }); //db.dropCollection - clear it out before adding in the records to simplify and prevent duplication
      }); // MongoClient.connect
      callback(null);
    } // callback
  ],
  // callback and error handling
  function(err, results) {
    if (err) console.warn(err.message);
  });

  return { args: [], stdin: null }
}
