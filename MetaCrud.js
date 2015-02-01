var GenericCrud = require('./GenericCrud');
var dbHelper = require('mongoskin/lib/helper');
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
			var col = me.db.createCollection(doc.collection, function (e, results) {
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

MetaCrud.prototype.update = function (collection, doc, id, res, next) {
	delete doc._id;
	var me = this;
	collection.count({collection: doc.collection, _id: {$ne: ObjectID(id)}}, function (e, result) {
		if (result > 0) {
			res.status(512).send({status: 512, message: "the collection already exists"})
		} else {
			collection.findById(id, function (e, result) {
				if (result.collection !== doc.collection) {
					me.db.collection(result.collection).rename(doc.collection, function (e, result) {
						if (e) {
							next(e);
						} else {
							collection.updateById(id, {$set: doc}, {safe: true, multi: false}, function (e, result) {
								if (e) return next(e)
								res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
							})
						}
					});
				} else {
					collection.updateById(id, {$set: doc}, {safe: true, multi: false}, function (e, result) {
						if (e) return next(e)
						res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
					})
				}
			});
		}
	})
};

module.exports = MetaCrud;

