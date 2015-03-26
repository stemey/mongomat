var app = require('./app').app,
	db = require('./app').db,
	QueryParser = require('./QueryParser'),
	GenericCrud = require('./GenericCrud')


var crud = new GenericCrud({queryParser: new QueryParser()});

app.param('db', function (req, res, next, dbName) {
	req.db = db(dbName)
	return next()
})

app.param('collectionName', function (req, res, next, collectionName) {
	req.collection = req.db.collection(collectionName)
	return next()
})

app.get('/data/:db/:collectionName', function (req, res, next) {
	crud.find(req.collection, req, res, next);
})

app.post('/data/:db/:collectionName', function (req, res, next) {
	crud.insert(req.collection, req.body, res, next);
})

app.get('/data/:db/:collectionName/:id', function (req, res, next) {
	crud.get(req.collection, req.params.id, res, next);
})

app.put('/data/:db/:collectionName/:id', function (req, res, next) {
	crud.update(req.collection, req.params.id, req.body, res, next);
})

app.delete('/data/:db/:collectionName/:id', function (req, res, next) {
	crud.delete(req.collection, req.params.id, res, next);
})


