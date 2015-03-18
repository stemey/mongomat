var express = require('express'),
    db = require('./app').db;

var adminDb = db.admin();


app.get('/db', function (req, res, next) {
	adminDb.listDatabases(function (err, dbs) {
		if (err) return next(err)
		res.send(dbs);
	});
})

app.get('/db/:id', function (req, res, next) {
	adminDb.listDatabases(function (err, dbs) {
		if (err) return next(err)
		var candidates = dbs.databases.filter(function(db) {
			return db.name===req.params.id;
		})
		if (candidates.length===1) {
			res.send(candidates[0]);
		} else {
			res.setatus(404);
		}
	});
})

app.put('/db/synchronize', function (req, res, next) {
	db.collectionNames(null, {namesOnly: true}, function (e, collectionNames) {
		if (e) {
			return next(e);
		}
		var collection = {};
		collectionNames.forEach(function (name) {
			var shortName = name.substring("testaccount".length + 1);
			collection[shortName] = false;
		})
		meta.find({}, function (e, results) {
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
		})
	});
})
