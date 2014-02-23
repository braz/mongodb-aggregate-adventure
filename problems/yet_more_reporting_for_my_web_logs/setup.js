module.exports = function () {
  var async = require('async');

  var server = 'mongodb://127.0.0.1:27017/test';
  var collectionname = 'logs';
  var MongoClient = require('mongodb').MongoClient 
      , format = require('util').format;
  var correct_num_of_records = 13628;

  async.series([
      // Setup for the exercise by ensuring there is no existing data
      function(callback) {
        MongoClient.connect(server, function(err, db) {
          if (err) return callback(err);
          
          var collection = db.collection(collectionname);
          collection.find({}).count(function(err, count) {
            if (err) return callback(err);
            if (count != correct_num_of_records)
            {
              var collectionSizeError = new Error("There is a difference in size between collections!");
              callback(collectionSizeError);
            }
            db.close(function(err, result) {
              if (err) return callback(err);
            }); //db.close
          }); //collection.find({}).count - get the count number
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
