var server = 'mongodb://127.0.0.1:27017/test';
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var async = require('async');
var fs = require('fs');
var locationsfile = 'film_locations_in_san_francisco.json';
var collectionname = 'locations';
var collection_tmp_name = 'locations_tmp';
var collection_tmp_count;

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
	function(callback) {
      var collection = db.collection(collectionname);
      var tmp_collection = db.collection(collection_tmp_name);

		fs.exists(locationsfile, function(exists) {
    	if (exists) {

        	fs.readFile(locationsfile, 'utf8', function (err, data) {
	            if (err) callback(err);
	            filmlocationsdoc = JSON.parse(data);
	           	tmp_collection.insert(filmlocationsdoc, {w:1, fsync:true}, function(err, result) {
					
					if (err) {
						if ( err.message.indexOf('E11000 ') !== -1 ) {
							// this _id was already inserted into the database. There is bad detail in source file so ignore this error.
						}
						else {
							return callback(err);
						}
					}


					tmp_collection.count(function(err, count) {
			            if (err) callback(err);
			            collection_tmp_count = count;
			            collection.count(function(err, count2) {
			            	if (err) callback(err);

			            	if (collection_tmp_count != count2)
			            	{
			            		var collectionSizeError = new Error("There is a difference in size between collections!");
			            		callback(collectionSizeError);
			            	}
			    	    });
	            	});

			        collection.aggregate([{"$project": {"cast":1}},{$unwind: "$cast"}], function(err, result) {
			            if (err) callback(err);

                        console.log(result);
		            	db.close(function(err, result) {
		              		if (err) callback(err);
	           		    	callback(null);
			            }); //db.close
					});// aggregate
	            }); // db.insert
	        }); // fs.readFile
        } // if exists
	    }); // fs.exists
		callback(null);
		}, 
	  ],
	  // callback and error handling
	  function(err, results) {
	    if (err) console.warn(err.message);
	  }
	); // async.series
});//MongoClient.connect