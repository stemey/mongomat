var express = require('express'),
	mongoskin = require('mongoskin'),
	dbHelper = require('mongoskin/lib/helper'),
	QueryParser = require('./QueryParser')
MetaCrud = require('./MetaCrud'),
	SchemaSampler = require('./SchemaSampler'),
	// TODO use the special meta db
	db = require('./app').db,
	// TODO name collision app
	app = require('./app').app,
	metaCollection = require('./app').metaCollection
schemaCollection = require('./app').schemaCollection


var meta = require('./app').metaCollection;

var queryParser = new QueryParser();

var metaCrud = new MetaCrud({queryParser: queryParser, db: db});

var schemaSampler = new SchemaSampler({
	db: db,
	metaCollection: metaCollection,
	schemaCollection: schemaCollection
});

app.get('/meta', function (req, res, next) {
	metaCrud.find(meta, req, res, next);
})

app.post('/meta', function (req, res, next) {
	metaCrud.insert(meta, req.body, res, next);
})

app.get('/meta/:id', function (req, res, next) {
	metaCrud.get(meta, req.params.id, res, next);
})

app.put('/meta/:id', function (req, res, next) {
	metaCrud.update(meta, req.body, req.params.id, res, next);

})

app.delete('/meta/:id', function (req, res, next) {
	metaCrud.delete(meta, req.params.id, res, next);
})

app.put('/task/generate/:id', function (req, res, next) {
	schemaSampler.sample(req.params.id, {sampleCount: 100, typeProperty: "className"}, function (msg) {
		res.send(msg);
	}, function (e) {
		next(e);
	});

})

app.put('/task/synchronize', function (req, res, next) {

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
