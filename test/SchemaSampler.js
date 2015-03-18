var expect = require('expect.js')
var SchemaSampler = require('../SchemaSampler');
require('mocha');
var sinon = require('sinon');

describe('schema sampler ', function () {

	var schemaSampler;

	/**
	 * required:
	 * maxlength
	 *
	 */
	beforeEach(function () {
		schemaSampler = new SchemaSampler();

	});

	var expectMetaUpdate = function (expectedMeta) {
		schemaSampler.metaCollection = {
			updateById: function (id, doc, opt, cb) {
				var meta = doc.$set;
				expect(meta).to.eql(expectedMeta);
				cb(null, true);
			}
		}
	}
	var expectSchemaInsert = function (expectedSchema, id) {
		schemaSampler.schemaCollection = {
			insert: function (schema, cb) {
				//expect(schema.group).to.equal(expectedSchema);
				cb(null, id);
			}
		}
	}

	it('updates meta', function (done) {
		expectMetaUpdate({name: "test"});
		var msg;
		schemaSampler.updateMeta({name: "test"}, function (e) {
			msg = e;
		}, null)


		expect(msg.msg).to.equal("success");
		done();
	})

	it('generates single schema', function (done) {

		var schema = {name: 1};
		expectSchemaInsert(schema, 123);
		var expectedMeta = {
			"name": "test",
			schema: {
				"type": "single-schema",
				"schema": 123
			}
		}
		expectMetaUpdate(expectedMeta);
		var msg;
		schemaSampler.sampleSingleSchema({name: "test"}, "type1", schema, function (e) {
			msg = e;
		}, null)


		expect(msg.msg).to.equal("success");
		done();
	})

	it('generates multi schema', function (done) {

		var schemas = [{name: "1"}, {name: "2"}];
		expectSchemaInsert(schemas, [101, 123]);


		var schema = {
			type1: {
				name: "1"
			},
			type2: {
				name: "2"
			}
		}

		var expectedMeta = {
			"name": "test",
			schema: {
				"type": "multiple-schema",
				"schemas": [101, 123]
			}
		}
		expectMetaUpdate(expectedMeta);
		var msg;
		schemaSampler.sampleMultiSchema({name: "test"}, ["type1", "type2"], schema, function (e) {
			msg = e;
		}, null)


		expect(msg.msg).to.equal("success");
		done();
	})

	it('sample single schema', function (done) {

		var callback = function () {
		}

		var meta = {collection: "testCollection"};

		var schema = {};
		var schemaMap = {default: schema}

		schemaSampler.sampleSingleSchema = sinon.mock().withExactArgs(meta, "default", schemaMap.default, callback, null)
		//this.sampleSingleSchema(meta, name, schema[name], callback, errCallback);
		//this.sampleMultiSchema(meta, discriminators, schema, callback, errCallback);


		var findById = function (metaId, cb) {
			expect(metaId).to.equal("collection1");
			cb(null, meta);
		}

		schemaSampler.metaCollection = {
			findById: findById
		}

		schemaSampler.generate = function(params,results){
			return schemaMap;
		}

		schemaSampler.db = {
			collection: function (id) {
				expect(id).to.equal("testCollection");
				return {
					find: function (query, options, callback) {
						callback(null, [1,2,3]);
					}
				}
			}
		}

		schemaSampler.sample("collection1", {}, callback, null)


		done();
	})

	it('generates multi schema', function (done) {

		var schemas = [{name: "1"}, {name: "2"}];
		expectSchemaInsert(schemas, [101, 123]);


		var schema = {
			type1: {
				name: "1"
			},
			type2: {
				name: "2"
			}
		}

		var expectedMeta = {
			"name": "test",
			schema: {
				"type": "multiple-schema",
				"schemas": [101, 123]
			}
		}
		expectMetaUpdate(expectedMeta);
		var msg;
		schemaSampler.sampleMultiSchema({name: "test"}, ["type1", "type2"], schema, function (e) {
			msg = e;
		}, null)


		expect(msg.msg).to.equal("success");
		done();
	})

	it('sample multi schema', function (done) {

		var callback = function () {
		}

		var meta = {collection: "testCollection"};

		var schema = {};
		var schema2 = {};
		var schemaMap = {test1: schema,test2:schema2}

		schemaSampler.sampleMultiSchema = sinon.mock().withExactArgs(meta, ["test1","test2"], schemaMap, callback, null)
		//this.sampleSingleSchema(meta, name, schema[name], callback, errCallback);
		//this.sampleMultiSchema(meta, discriminators, schema, callback, errCallback);


		var findById = function (metaId, cb) {
			expect(metaId).to.equal("collection1");
			cb(null, meta);
		}

		schemaSampler.metaCollection = {
			findById: findById
		}

		schemaSampler.generate = function(params,results){
			return schemaMap;
		}

		schemaSampler.db = {
			collection: function (id) {
				expect(id).to.equal("testCollection");
				return {
					find: function (query, options, callback) {
						callback(null, [1,2,3]);
					}
				}
			}
		}

		schemaSampler.sample("collection1", {}, callback, null)


		done();
	})

})
