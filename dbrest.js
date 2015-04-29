var DbCrud = require('./DbCrud'),
	config = require('./app').config,
	app = require('./app').app;


var dbCrud = new DbCrud();


if (config.synchronize) {
	dbCrud.synchronizeAll();
}

app.get('/db', function (req, res, next) {
	dbCrud.find(function (err, dbs) {
		if (err) return next(err)
		res.send({data: dbs, total: dbs.length});
	});
})

app.get('/db/:id', function (req, res, next) {
	dbCrud.get(req.params.id, function (err, db) {
		if (err != null) {
			return next(err);
		} else if (db === null) {
			res.status(404);
		} else {
			res.send(db);
		}
	});
});

app.put('/db-synchronize/:id', function (req, res, next) {
	var dbName = req.param("id");
	dbCrud.synchronize(dbName, function (e, result) {
		if (e) {
			next(e);
		} else {
			res.send(result);
		}
	})
})
