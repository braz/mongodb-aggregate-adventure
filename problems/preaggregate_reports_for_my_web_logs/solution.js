var server = 'mongodb://127.0.0.1:27017/test';
var databasename = 'test';
var collectionname = 'logs';
var page_per_day_hits_name = 'page_per_day_hits';
var page_per_hour_hits_name = 'page_per_hour_hits';
var tmp_created_collection_per_day_name = 'page_per_day_hits_tmp';
var tmp_created_collection_per_hour_name = 'page_per_hour_hits_tmp';
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
	    var created_collection = db.collection(page_per_day_hits_name);

		created_collection.indexInformation(function(err, indexitems) {
			if (err) callback(err);

			var index_field_required = ['_id.p', '_id.d'];
			var values = us.values(indexitems);
			var flattened = us.flatten(values);
			var cleaned = us.without(flattened, "_id", 1);
			var valid_index = us.intersection(cleaned, index_field_required);
			var contains_same_index_fields = 0;

			if (us.difference(valid_index,index_field_required) == contains_same_index_fields) {
				collection.aggregate([{$project:{'page': '$PAGE', 'time': { 'y': {'$year':'$DATE'} , 'm':{'$month':'$DATE'}, 'day':{'$dayOfMonth':'$DATE'}}}}, {'$group':{'_id':{'p':'$page','y':'$time.y','m':'$time.m','d':'$time.day'}, 'daily':{'$sum':1}}},{'$out': tmp_created_collection_per_day_name}], function(err, result) {
		        	if (err) callback(err);

		        	var tmp_created_collection =  db.collection(tmp_created_collection_per_day_name);
			        tmp_created_collection.find({"_id.p": "cart.do", "_id.y": 2014, "_id.m": 2, "_id.d":10}).toArray(function(err, result) {
		          		if (err) callback(err);

			        	console.log(result);
			        });
		            callback(null);
           		});// aggregate
			} // if (valid_index.length == index_field_required.length)
			else {
				var correctIndexNotPresentError = new Error("This problem requires you to create an index on the collection " + created_collection + " for the fields " + index_field_required.toString() + ".");
				callback(correctIndexNotPresentError);
			}
		}); // collection.indexInformation(function(err, indexitems)
	},
	function(callback) {
	    var collection = db.collection(collectionname);
	    var created_collection = db.collection(page_per_hour_hits_name);

		created_collection.indexInformation(function(err, indexitems) {
			if (err) callback(err);

			var index_field_required = ['_id.p', '_id.d', '_id.h'];
			var values = us.values(indexitems);
			var flattened = us.flatten(values);
			var cleaned = us.without(flattened, "_id", 1);
			var valid_index = us.intersection(cleaned, index_field_required);
			var contains_same_index_fields = 0;

			if (us.difference(valid_index,index_field_required) == contains_same_index_fields) {
				collection.aggregate([{$project:{'page': '$PAGE', 'time': { 'y': {'$year':'$DATE'} , 'm':{'$month':'$DATE'}, 'day':{'$dayOfMonth':'$DATE'}, 'h':{'$hour':'$DATE'}}}}, {'$group':{'_id':{'p':'$page','y':'$time.y','m':'$time.m','d':'$time.day', 'h':'$time.h'}, 'hourly':{'$sum':1}}},{'$out': tmp_created_collection_per_hour_name}], function(err, result) {
		        	if (err) callback(err);

		        	var tmp_created_collection =  db.collection(tmp_created_collection_per_hour_name);
			        tmp_created_collection.find({"_id.p": "cart.do", "_id.y": 2014, "_id.m": 2, "_id.d":10, "_id.h" : { '$gte':14, '$lte':18 }}).toArray(function(err, result) {
	   			        	if (err) callback(err);

				        	console.log(result);
				            callback(null);
			        }); // tmp_created_collection.find
           		});// aggregate
			} // if (valid_index.length == index_field_required.length)
			else {
				var correctIndexNotPresentError = new Error("This problem requires you to create an index on the collection " + created_collection + " for the fields " + index_field_required.toString() + ".");
				callback(correctIndexNotPresentError);
			}
		}); // collection.indexInformation(function(err, indexitems)
	},

	function(callback) {
        db.dropCollection(tmp_created_collection_per_day_name, function(err, result) {
            if (err) return callback(err);
        });

	    db.dropCollection(tmp_created_collection_per_hour_name, function(err, result) {
            if (err) return callback(err);
        });
    	
    	callback(null);
	},
  ],
  // callback and error handling
  function(err, results) {
    if (err) console.warn(err.message);

	db.close(function(err, result) {
    	if (err) console.warn(err.message);
    }); //db.close
  });
}); // connect
