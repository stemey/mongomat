var app = require('./app').app,
	schemaCollection = require('./app').schemaCollection,
	QueryParser = require('./QueryParser'),
	GenericCrud = require('./GenericCrud')


var crud = new GenericCrud({queryParser: new QueryParser()});

app.get('/schema', function (req, res, next) {
	crud.find(schemaCollection, req, res, next);
})

app.post('/schema', function (req, res, next) {
	crud.insert(schemaCollection, req.body, res, next);
})

app.get('/schema/:id', function (req, res, next) {
	crud.get(schemaCollection, req.params.id, res, next);
})

app.put('/schema/:id', function (req, res, next) {
	crud.update(schemaCollection, req.params.id, req.body, res, next);
})

app.delete('/schema/:id', function (req, res, next) {
	crud.delete(schemaCollection, req.params.id, res, next);
})
