var express = require('express'),
	mongoskin = require('mongoskin'),
	bodyParser = require('body-parser')

var app = express()
app.use(bodyParser())

var db = mongoskin.db('mongodb://@localhost:27017', {safe: true})

var metaDb = mongoskin.db('mongodb://@localhost:27017', {safe: true})

var metaCollection = metaDb.collection("mdbCollection");
var schemaCollection = metaDb.collection("mdbschema");


module.exports.db=db;
module.exports.app=app;
module.exports.metaCollection=metaCollection;
module.exports.schemaCollection=schemaCollection;
