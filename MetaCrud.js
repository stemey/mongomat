var GenericCrud = require('./GenericCrud');
var dbHelper = require('mongoskin/lib/helper');
var ejsonHelper = require('./ejsonHelper');
var util = require('util');
var ObjectID = require('bson').ObjectID


var MetaCrud = function (config) {
	GenericCrud.call(this, config);
	this.db = config.db;
}

util.inherits(MetaCrud, GenericCrud);


MetaCrud.prototype.insert = function (collection, doc, res, next) {
	var me = this;
	collection.count({collection: doc.collection}, function (e, result) {
		if (result > 0) {
			res.status(512).send({status: 512, message: "the collection already exists"})
		} else {
			var col = me.db(doc.db).createCollection(doc.collection, function (e, results) {
				if (e) {
					next(e);
				} else {
					collection.insert(doc, {}, function (e, result) {
						if (e) return next(e)
						res.send(result)
					})
				}
			});
		}
	})
}

MetaCrud.prototype.delete = function (collection, id, res, next) {
	collection.findById(ejsonHelper.deflateId(id), function (e, result) {
		if (e) return next(e);
		this.db(result.db).collection(result.collection).drop(function (e, result) {
			if (e) return next(e);
			collection.removeById(ejsonHelper.deflateId(id), function (e, result) {
				if (e) return next(e)
				res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
			}.bind(this))
		}.bind(this));
	}.bind(this));
}

MetaCrud.prototype.update = function (collection, doc, id, res, next) {
	var me = this;
	collection.count({collection: doc.collection, db:doc.db,_id: {$ne: ejsonHelper.deflateId(id)}}, function (e, result) {
		if (result > 0) {
			res.status(512).send({status: 512, message: "the collection already exists"})
		} else {
			collection.findById(id, function (e, result) {
				if (result != null && result.collection !== doc.collection) {
					me.db.collection(result.collection).rename(doc.collection, function (e, result) {
						if (e) {
							next(e);
						} else {
							collection.updateById(ejsonHelper.deflateId(id), ejsonHelper.deflate(doc), {
								safe: true,
								multi: false
							}, function (e, result) {
								if (e) return next(e)
								res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
							})
						}
					});
				} else {
					collection.updateById(ejsonHelper.deflateId(id), ejsonHelper.deflate(doc), {
						safe: true,
						multi: false
					}, function (e, result) {
						if (e) return next(e)
						res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
					})
				}
			});
		}
	})
};

MetaCrud.prototype.generate = function (collection, params, id, res, next) {
	collection.findById(ejsonHelper.deflateId(id), function (e, meta) {
		if (e) {
			return next(e);
		} else {
			var dataCollection = db.collection(meta.collection);
			dataCollection.find({}, {limit: 100}, function (e, results) {
				if (e) {
					return next(e);
				} else {

				}
			})
		}
	})
};

module.exports = MetaCrud;

