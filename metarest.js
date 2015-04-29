var express = require('express'),
	mongoskin = require('mongoskin'),
	dbHelper = require('mongoskin/lib/helper'),
	DbQueryParser = require('./DbQueryParser')
	MetaCrud = require('./MetaCrud'),
	ejsonHelper = require('./ejsonHelper'),
	SchemaSampler = require('./SchemaSampler'),
	// TODO use the special meta db
	db = require('./app').db,
	config = require('./app').config,
		// TODO name collision app
	app = require('./app').app,
	metaCollection = require('./app').metaCollection
schemaCollection = require('./app').schemaCollection


var meta = require('./app').metaCollection;

var queryParser = new DbQueryParser(config);

var metaCrud = new MetaCrud({queryParser: queryParser, db: db, dbNames:config.dbNames});

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
	var options = req.body;
	if (!options.sampleCount) {
		options.sampleCount=100;
	}
	schemaSampler.sample(ejsonHelper.deflateId(req.params.id), options, function (msg) {
		res.send(msg);
	}, function (e) {
		next(e);
	});

})


