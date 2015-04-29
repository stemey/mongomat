var express = require('express'),
	mongoskin = require('mongoskin'),
	bodyParser = require('body-parser'),
	program = require('commander')

var intParser = function (x) {
	return parseInt(x);
};

var boolParser = function (x) {
	return x === "true" || x === "yes";
};

program
	.version('0.0.1')
	.option('-P, --port <n>', 'Port to run node server on', intParser, 3001)
	.option('-M, --metadataDb <value>', 'Name of meta data db', 'metadata')
	.option('-B, --openBrowser <bool>', 'true - open app in bowser', boolParser, true)
	.option('-U, --mongoUrl <value>', 'url of mongo server', 'localhost:27017')
	.option('-S, --synchronize <bool>', 'synchronze on start up', boolParser, true)
	.option('-A, --authDb <value>', 'db which holds user data')
	.option('-u, --user <value>', 'user')
	.option('-d, --dbs <db1,db2,>')
	.option('-p, --pwd <value>', 'password')


program.on('--help', function () {
});

program.parse(process.argv);

if (program.dbs) {
	var dbNames = program.dbs.split(",");
	//dbNames.push(program.metadataDb);
	program.dbNames=dbNames;
}



var app = express()
app.use(bodyParser())

var getDb = function (name) {
	var credentials = program.user ? program.user + ':' + program.pwd : '';
	var url = 'mongodb://' + credentials + '@' + program.mongoUrl + '/' + name;
	return mongoskin.db(url, {
		db: {
			authSource: "admin"
		},
		safe: true
	});
}

console.info("connecting to mongodb ", program.mongoUrl);
var metaDb = getDb(program.metadataDb);

console.info("metadatadb is ", program.metadataDb);
var metaCollection = metaDb.collection("mdbCollection");
var schemaCollection = metaDb.collection("mdbschema");


module.exports.db = getDb;
module.exports.admin = metaDb.admin();
module.exports.config = program;
module.exports.app = app;
module.exports.metaCollection = metaCollection;
module.exports.schemaCollection = schemaCollection;

app.use("/client", express.static("./node_modules/gform-app/dist"));
