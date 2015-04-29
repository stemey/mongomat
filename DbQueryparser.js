var QueryParser = require('./QueryParser'),
	util = require('util');


var DbQueryParser = function (config) {
	QueryParser.call(this, config);
	this.dbNames = config.dbNames;

}

util.inherits(DbQueryParser, QueryParser);

DbQueryParser.prototype.parseQuery = function (req) {
	var query = this.readJsonParam(req, 'query', {})
	var filter={name:{$not:{$in:["system.indexes","system.users"]}}}
	if (this.dbNames) {
		filter.db={"$in": this.dbNames};
	}
	query = {$and: [filter, query]}
	return query;
}


module.exports = DbQueryParser;
