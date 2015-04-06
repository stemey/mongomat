var ejsonHelper = require('./ejsonHelper');

var GenericCrud = function (config) {
	this.queryParser = config.queryParser;
}


GenericCrud.prototype.insert = function (collection, doc, res, next) {
	collection.insert(ejsonHelper.deflate(doc), {}, function (e, results) {
		if (e) return next(e)
		res.send(results);
	}.bind(this))
}

GenericCrud.prototype.update = function (collection, id, doc, res, next) {
	//delete doc._id;
	collection.updateById(ejsonHelper.deflateId(id), ejsonHelper.deflate(doc), {
		safe: true,
		multi: false
	}, function (e, result) {
		if (e) return next(e)
		res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
	}.bind(this))
}

GenericCrud.prototype.find = function (collection, req, res, next) {
	var query = this.queryParser.parseQuery(req);
	var options = this.queryParser.parseOptions(req);
	collection.find(query, options).toArray(function (e, results) {
		if (e) return next(e)
		collection.count(query, function (e, count) {
			if (e) return next(e)
			res.send({data: ejsonHelper.inflateArray(results), total: count});
		}.bind(this));
	}.bind(this))
}

GenericCrud.prototype.get = function (collection, id, res, next) {

	collection.findOne({_id: ejsonHelper.deflateId(id)}, function (e, result) {
		if (e) return next(e)
		if (result == null) {
			res.status(404);
			res.send({msg: "not found"});
		} else {
			res.send(ejsonHelper.inflate(result))
		}
	}.bind(this))
}

GenericCrud.prototype.delete = function (collection, id, res, next) {
	collection.removeById(ejsonHelper.deflateId(id), function (e, result) {
		if (e) return next(e)
		res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
	}.bind(this))
}

module.exports = GenericCrud;




