var server = 'mongodb://127.0.0.1:27017/test';
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var async = require('async');
var collectionname = 'locations';

MongoClient.connect(server, function(err, db) {
    if (err) {
        console.warn(err.message);
        return;
    }
    
	async.series([
	function(callback) {
	        var collection = db.collection(collectionname);
	        collection.aggregate([{"$project": {"filmlocations":1, _id:0}},{$unwind: "$filmlocations"},{$group:{ "_id":"$filmlocations", "timesUsed": {"$sum":1}}}, {"$sort" : {"timesUsed":-1}}], function(err, result) {
	            if (err) callback(err);

                console.log(result);
            	db.close(function(err, result) {
              		if (err) callback(err);
	            }); //db.close
			});// aggregate
			callback(null);
		}, 
	  ],
	  // callback and error handling
	  function(err, results) {
	    if (err) console.warn(err.message);
	  }
	); // async.series
});//MongoClient.connect