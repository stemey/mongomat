var express = require('express'),
	mongoskin = require('mongoskin'),
	bodyParser = require('body-parser'),
	program = require('commander')


program
	.version('0.0.1')
	.option('-P, --port <n>', 'Port to run node server on', parseInt, 3001)
	.option('-M, --metadataDb <value>', 'Name of meta data db', 'metadata' )
	.option('-U, --mongoUrl <value>', 'url of mongo server', 'localhost:27017')
	.option('-S, --synchronize <bool>', 'synchronze on start up', true)


program.on('--help', function(){
});

program.parse(process.argv);



var app = express()
app.use(bodyParser())

var metaDb = mongoskin.db('mongodb://@' + program.mongoUrl + '/'+program.metadataDb, {safe: true})

var metaCollection = metaDb.collection("mdbCollection");
var schemaCollection = metaDb.collection("mdbschema");

var getDb = function (name) {
	return mongoskin.db('mongodb://@' + program.mongoUrl + '/' + name, {safe: true});
}


module.exports.db = getDb;
module.exports.admin = metaDb.admin();
module.exports.config = program;
module.exports.app = app;
module.exports.metaCollection = metaCollection;
module.exports.schemaCollection = schemaCollection;
