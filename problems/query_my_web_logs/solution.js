var server = 'mongodb://127.0.0.1:27017/test';
var databasename = 'test';
var collectionname = 'logs';
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var async = require('async');
var us = require('underscore');

// The sleep module and call are used to delay the execution of the solution script to ensure
// it does not check for the existing of the DB created by your program before it has a chance
// to create the database. A lock file or other approach will be used in future.
var sleep = require('sleep');
sleep.sleep(1);

MongoClient.connect(server, function(err, db) {
    if (err) {
        console.warn(err.message);
        return;
    }
 	async.series([
    // Deterime if the specified database exits
	function(callback) {
	    var collection = db.collection(collectionname);

		collection.aggregate([{"$match": { "DATE": { '$gte': new Date(2014,01,03), '$lt' : new Date(2014,01,04)}}}, {$project:{'path':1, 'time': { 'y': {'$year':'$DATE'} , 'm':{'$month':'$DATE'}, 'd':{'$dayOfMonth':'$DATE'}}}}, {'$group': { '_id': { 'p': '$path', 'y': '$time.y', 'm': '$time.m', 'd': '$time.d' }, 'hits' : {'$sum': 1}}}], function(err, result) {
            if (err) callback(err);

            console.log(result);

    		collection.aggregate([{"$match": { "DATE": { '$gte': new Date(2014,01,03), '$lt' : new Date(2014,01,04)}}}, {$project:{'path':1, 'time': { 'y': {'$year':'$DATE'} , 'm':{'$month':'$DATE'}, 'd':{'$dayOfMonth':'$DATE'}}}}, {'$group': { '_id': { 'p': '$path', 'y': '$time.y', 'm': '$time.m', 'd': '$time.d' }, 'hits' : {'$sum': 1}}}], function(err, result) {
	            if (err) callback(err);

	        	db.close(function(err, result) {
	          		if (err) callback(err);
	            }); //db.close
	        });// aggregate
		});// aggregate
	},
  ],
  // callback and error handling
  function(err, results) {
    if (err) console.warn(err.message);
  });
}); // connect
