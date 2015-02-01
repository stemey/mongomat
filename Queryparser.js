var EJSON = require('mongodb-extended-json');

var QueryParser = function () {

}


QueryParser.prototype.readJsonParam = function (req, key, defaultValue) {
	var value;
	var param = req.param(key);
	if (param) {
		value = EJSON.parse(param);
	} else {
		value = defaultValue || {};
	}
	return value;
}

QueryParser.prototype.readSortParam = function (req) {
	var value;
	var param = req.param('sort');
	if (param) {
		var query ={};
		var match = param.match(/[+-]?$/);
		var name = param.substring(0, param.length - 1);
		if (match[0].length == 1) {
			query[name]=parseInt(match[0] + "1", 10);
		} else {
			query[name]= 1;
		}
		return query;
	}
	return undefined;
}

QueryParser.prototype.parseOptions = function (req) {
	var options = {};
	var sort = this.readSortParam(req);
	if (sort) {
		options.sort = sort;
	}
	var skip = req.param('skip');
	if (skip) {
		options.skip = skip;
	}
	var limit = req.param('limit');
	if (limit) {
		options.limit = limit;
	}
	return options;
}

QueryParser.prototype.parseQuery = function (req) {
	return this.readJsonParam(req, 'query', {})
}


module.exports = QueryParser;
