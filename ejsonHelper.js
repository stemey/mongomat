var EJSON = require('mongodb-extended-json');

var EjsonHelper = function () {
}

/**
 * transform native js object to serializable ejson
 * @param doc
 * @returns {*}
 */
EjsonHelper.prototype.inflate = function (doc) {
	var id=doc._id;
	var newDoc = EJSON.inflate(doc);
	newDoc._id=this.inflateId(id);
	return newDoc;
}
EjsonHelper.prototype.inflateId = function (id) {
	var id = EJSON.inflate(id);
	if (typeof id == "object") {
		return "oid(" + id.$oid + ")";
	}else{
		return id;
	}
}
EjsonHelper.prototype.inflateArray = function (doc) {
	return doc.map(function (el) {
		return this.inflate(el);
	}, this);
}
EjsonHelper.prototype.deflateId = function (id) {
	if (typeof id == "string") {
		var parts = id.match(/oid\((.*)\)/);
		if (parts) {
			return EJSON.deflate({$oid: parts[1]});
		} else {
			return id;
		}
	} else {
		return id;
	}
}

/**
 * transform ejson to native js
 * @param doc
 * @returns {*}
 */
EjsonHelper.prototype.deflate = function (doc) {

	doc._id = this.deflateId(doc._id);
	return EJSON.deflate(doc);
}


module.exports = new EjsonHelper();;




