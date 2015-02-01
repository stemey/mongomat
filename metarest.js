var express = require('express'),
  mongoskin = require('mongoskin'),
	dbHelper = require('mongoskin/lib/helper'),
	QueryParser = require('./QueryParser')
    MetaCrud = require('./MetaCrud'),
		// TODO use the special meta db
    db = require('./app').db,
		app = require('./app').app


var meta = db.collection('mdbcollection');

var queryParser = new QueryParser();

var metaCrud = new MetaCrud({queryParser: queryParser, db: db});

app.get('/meta', function(req, res, next) {
	metaCrud.find(meta,req,res,next);
})

app.post('/meta', function (req, res, next) {
	metaCrud.insert(meta,req.body,res,next);
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
