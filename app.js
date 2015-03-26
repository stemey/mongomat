var express = require('express'),
	mongoskin = require('mongoskin'),
	bodyParser = require('body-parser')

var app = express()
app.use(bodyParser())

var host = "localhost:27017";

var metaDb = mongoskin.db('mongodb://@' + host + '/metadata', {safe: true})

var metaCollection = metaDb.collection("mdbCollection");
var schemaCollection = metaDb.collection("mdbschema");

var getDb = function (name) {
	return mongoskin.db('mongodb://@' + host + '/' + name, {safe: true});
}


module.exports.db = getDb;
module.exports.admin = metaDb.admin();
module.exports.config = {host: host};
module.exports.app = app;
module.exports.metaCollection = metaCollection;
module.exports.schemaCollection = schemaCollection;
