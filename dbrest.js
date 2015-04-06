var express = require('express'),
	db = require('./app').db,
	ejsonHelper = require('./ejsonHelper'),
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
			var db = candidates[0];
			metaCollection.find({db: db.name}, function (e, results) {
				if (e != null) {
					return next(e);
				} else {
					results.toArray(function (e, results) {
						if (e != null) {
							return next(e);
						} else {
							db.collections = results.map(function (coll) {
								return ejsonHelper.inflateId(coll._id);
							})
							res.send(db);
						}
					});
				}
			})
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
		var existing = Object.keys(collection);
		metaCollection.find({db: dbName}, function (e, results) {
			results.toArray(function (e, metaNames) {
				if (e) {
					return next(e);
				}
				var removed = {};
				metaNames.forEach(function (meta) {
					removed[meta.collection] = true;
					delete collection[meta.collection];
				})
				existing.forEach(function (name) {
					delete removed[name];
				})
				if (Object.keys(removed).length > 0) {
					metaCollection.remove({db: dbName, collection: {$in: Object.keys(removed)}}, function (e, result) {
						console.log("removed " + result + " collections ");
					});
				}
				var metas = Object.keys(collection).map(function (collectionName) {
					return {
						collection: collectionName,
						name: collectionName,
						db: dbName,
						description: "generated on " + new Date() + "."
					};
				});
				if (metas.length > 0) {
					metaCollection.insert(metas, function (e, results) {
						if (e) {
							next(e);
						} else {
							var newCollections = [];
							results.forEach(function (collection) {
								newCollections.push(ejsonHelper.inflate(collection));
							})
							res.send({msg: "success", collections: newCollections});
						}
					});
				} else {
					res.send({msg: "success", collections: []});
				}
			});
		});
	});
})
