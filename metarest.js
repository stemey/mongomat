var express = require('express'),
  mongoskin = require('mongoskin'),
	dbHelper = require('mongoskin/lib/helper'),
	QueryParser = require('./QueryParser')
  db = require('./app').db,
	  app = require('./app').app


var meta = db.collection('mdbcollection');

var queryParser = new QueryParser();

app.get('/meta', function(req, res, next) {
	var query = queryParser.parseQuery(req);
	var options = queryParser.parseOptions(req);
	meta.find(query ,options).toArray(function(e, results){
    if (e) return next(e)
    res.send(results)
  })
})

app.post('/meta', function (req, res, next) {
	meta.find({collection:req.body.collection},function(e,result) {
		if (result.length>0) {
			res.status(512).send({status:512, message:"the collection already exists"})
		}else{
			var col = db.createCollection(req.body.collection, function(e, results) {
				if (e) {
					next(e);
				} else {
					meta.insert(req.body, {}, function (e, results) {
						if (e) return next(e)
						res.send(results)
					})
				}
			});
		}
	})

})

app.get('/meta/:id', function (req, res, next) {
	meta.findById(req.params.id, function (e, result) {
		if (e) return next(e)
		res.send(result)
	})
})

app.put('/meta/:id', function (req, res, next) {
	var id = req.body._id;
	delete req.body._id;
	meta.find({collection:req.body.collection},function(e,result) {
		if (result.length>1 || (result.length ==1 && dbHelper.toObjectID(result[0]._id)!=id)) {
			res.status(512).send({status:512, message:"the collection already exists"})
		}else{
			meta.findById(req.params.id,function(e, result) {
				if (result.collection!==req.body.collection) {
					db.collection(result.collection).rename(req.body.collection);
				}
				meta.updateById(req.params.id, {$set: req.body}, {safe: true, multi: false}, function (e, result) {
					if (e) return next(e)
					res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
				})
			});
		}
	})
})

app.delete('/meta/:id', function (req, res, next) {
	// find and archive collection
	meta.removeById(req.params.id, function (e, result) {
		if (e) return next(e)
		res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
	})
})
