var app = require('./app').app,
	db = require('./app').db,
	QueryParser = require('./QueryParser')


var queryParser = new QueryParser();

app.param('collectionName', function (req, res, next, collectionName) {
	req.collection = db.collection(collectionName)
	return next()
})

app.get('/collections/:collectionName', function (req, res, next) {
	var query = queryParser.parseQuery(req);
	var options = queryParser.parseOptions(req);
	req.collection.find(query, options).toArray(function (e, results) {
		if (e) return next(e)
		res.send(results)
	})
})

app.post('/collections/:collectionName', function (req, res, next) {
	req.collection.insert(req.body, {}, function (e, results) {
		if (e) return next(e)
		res.send(results)
	})
})

app.get('/collections/:collectionName/:id', function (req, res, next) {
	req.collection.findById(req.params.id, function (e, result) {
		if (e) return next(e)
		res.send(result)
	})
})

app.put('/collections/:collectionName/:id', function (req, res, next) {
	delete req.body._id;
	req.collection.updateById(req.params.id, {$set: req.body}, {safe: true, multi: false}, function (e, result) {
		if (e) return next(e)
		res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
	})
})

app.delete('/collections/:collectionName/:id', function (req, res, next) {
	req.collection.removeById(req.params.id, function (e, result) {
		if (e) return next(e)
		res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
	})
})


