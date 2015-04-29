var express = require('express'),
	db = require('./app').db,
	ejsonHelper = require('./ejsonHelper'),
	adminDb = require('./app').admin,
	config = require('./app').config,
	metaCollection = require('./app').metaCollection


var DbCrud = function () {
	if (config.dbNames) {
		this.dbs = config.dbNames.map(function (name) {
			return {name: name, _id: name};
		});
	}

}


DbCrud.prototype._getDatabases = function (cb) {
	if (this.dbs) {
		cb(null,this.dbs);
	} else {
		adminDb.listDatabases(function (err, dbs) {
			if (err) {
				cb(err);
			} else {
				var mdbs = dbs.databases.map(function (mdb) {
					mdb.host = config.host;
					return mdb;
				});
				cb(null, mdbs);
			}
		});
	}
}

DbCrud.prototype.find = function (cb) {
	this._getDatabases(cb);
};

DbCrud.prototype.get = function (id, cb) {
	this.find(function (err, dbs) {
		if (err) return cb(err)
		var candidates = dbs.filter(function (db) {
			return db.name === id;
		})
		if (candidates.length === 1) {
			var db = candidates[0];
			metaCollection.find({db: db.name}, function (e, results) {
				if (e != null) {
					return next(e);
				} else {
					results.toArray(function (e, results) {
						if (e != null) {
							return next(e);
						} else {
							db.collections = results.map(function (coll) {
								return ejsonHelper.inflateId(coll._id);
							})
							cb(null, db);
						}
					});
				}
			})
		} else {
			cb(null, null)
		}
	});
}


DbCrud.prototype.synchronize = function (dbName, cb) {
	if (this.dbs) {
		return;
	}
	var adb = db(dbName);
	adb.collectionNames(null, {namesOnly: true}, function (e, collectionNames) {
		if (e) {
			cb(e);
		} else {
			var collection = {};
			collectionNames.forEach(function (name) {
				var shortName = name.substring(dbName.length + 1);
				collection[shortName] = false;
			})
			var existing = Object.keys(collection);
			metaCollection.find({db: dbName}, function (e, results) {
				results.toArray(function (e, metaNames) {
					if (e) {
						cb(e);
					} else {
						var removed = {};
						metaNames.forEach(function (meta) {
							removed[meta.collection] = true;
							delete collection[meta.collection];
						})
						existing.forEach(function (name) {
							delete removed[name];
						})
						if (Object.keys(removed).length > 0) {
							metaCollection.remove({
								db: dbName,
								collection: {$in: Object.keys(removed)}
							}, function (e, result) {
								console.log("removed " + result + " collections ");
							});
						}
						var metas = Object.keys(collection).map(function (collectionName) {
							return {
								collection: collectionName,
								name: collectionName,
								db: dbName,
								description: "generated on " + new Date() + "."
							};
						});
						if (metas.length > 0) {
							metaCollection.insert(metas, function (e, results) {
								if (e) {
									cb(e);
								} else {
									var newCollections = [];
									results.forEach(function (collection) {
										newCollections.push(ejsonHelper.inflate(collection));
									})
									cb({msg: "success", collections: newCollections});
								}
							});
						} else {
							cb({msg: "success", collections: []});
						}
					}
				});
			});
		}
	});
};

DbCrud.prototype.synchronizeAll = function (cb) {
	var me = this;
	this.find(function (e, dbs) {
		if (e) {
			cb(e);
		} else {
			var dbCount = dbs.length;
			dbs.forEach(function (db) {
				me.synchronize(db.name, function (e, result) {
					dbCount--;
					if (dbCount == 0) {
						if (cb) cb();
					}
				});
			});
		}
	})
}


module.exports = DbCrud;
