var EJSON = require('mongodb-extended-json');

var GenericCrud = function(config) {
	this.queryParser = config.queryParser;
}

/**
 * transform native js object to serializable ejson
 * @param doc
 * @returns {*}
 */
GenericCrud.prototype.inflate= function(doc) {
	return EJSON.inflate(doc);
}

/**
 * transform ejson to native js
 * @param doc
 * @returns {*}
 */
GenericCrud.prototype.deflate= function(doc) {
	return EJSON.deflate(doc);
}

GenericCrud.prototype.insert= function(collection, doc, res, next) {
	collection.insert(this.deflate(doc), {}, function (e, results) {
		if (e) return next(e)
		res.send(results);
	}.bind(this))
}

GenericCrud.prototype.update= function(collection, id, doc, res, next) {
	delete doc._id;
	collection.updateById(id, {$set: this.deflate(doc)}, {safe: true, multi: false}, function (e, result) {
		if (e) return next(e)
		res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
	}.bind(this))
}

GenericCrud.prototype.find= function(collection, req, res, next) {
	var query = this.queryParser.parseQuery(req);
	var options = this.queryParser.parseOptions(req);
	collection.find(query, options).toArray(function (e, results) {
		if (e) return next(e)

		res.send(this.inflate(results))
	}.bind(this))
}

GenericCrud.prototype.get= function(collection, id, res, next) {
	collection.findById(id, function (e, result) {
		if (e) return next(e)
		res.send(this.inflate(result))
	}.bind(this))
}

GenericCrud.prototype.delete= function(collection, id, res, next) {
	collection.removeById(id, function (e, result) {
		if (e) return next(e)
		res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
	}.bind(this))
}

module.exports = GenericCrud;




