var express = require('express'),
	db = require('./app').db,
	adminDb = require('./app').admin,
	config = require('./app').config,
	metaCollection = require('./app').metaCollection,
    mongoskin = require('mongoskin');



var getDatabases = function (cb) {
	adminDb.listDatabases(function (err, dbs) {
		if (err) {
			cb(err);
		} else {
			var mdbs = dbs.databases.map(function (mdb) {
				mdb.host = config.host;
				return mdb;
			});
			cb(null, mdbs);
		}
	});
}

app.get('/db', function (req, res, next) {
	getDatabases(function (err, dbs) {
		if (err) return next(err)
		res.send({data: dbs, total: dbs.length});
	});
})

app.get('/db/:id', function (req, res, next) {
	getDatabases(function (err, dbs) {
		if (err) return next(err)
		var candidates = dbs.filter(function (db) {
			return db.name === req.params.id;
		})
		if (candidates.length === 1) {
			res.send(candidates[0]);
		} else {
			res.status(404);
		}
	});
})

app.put('/db/synchronize/:id', function (req, res, next) {
	var dbName = req.param("id");
	var adb = db(dbName);
	adb.collectionNames(null, {namesOnly: true}, function (e, collectionNames) {
		if (e) {
			return next(e);
		}
		var collection = {};
		collectionNames.forEach(function (name) {
			var shortName = name.substring(dbName.length + 1);
			if (!shortName.match(/^system/)) {
				collection[shortName] = false;
			}
		})
		metaCollection.find({}, function (e, results) {
			results.toArray(function (e, metaNames) {
				if (e) {
					return next(e);
				}
				metaNames.forEach(function (meta) {
					delete collection[meta.collection];
				})
				var metas = Object.keys(collection).map(function (collectionName) {
					return {
						collection: collectionName,
						name: collectionName,
						db: dbName,
						description: "generated on " + new Date() + "."
					};
				});
				metaCollection.insert(metas, function (e, results) {
					if (e) {
						next(e);
					} else {
						res.send({msg: "success"});
					}
				});
			});
		});
	});
})
