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
                var meta = doc;
                expect(meta).to.eql(expectedMeta);
                cb(null, true);
            }
        }
    }
    var expectSchemaInsert = function () {
        schemaSampler.schemaCollection = {
            update: function (query, schema, options, cb) {
                expect(query._id).to.equal(schema.name);

                cb(null, schema.name);
            }
        }
    }

    it('updates meta', function (done) {
        expectMetaUpdate({name: "test", _id: "12"});
        var msg;
        schemaSampler.updateMeta({name: "test", _id: "12"}, function (e) {
            msg = e;
        }, null)


        expect(msg.msg).to.equal("success");
        done();
    })

    it('generates single schema', function (done) {

        var schema = {name: 1};
        expectSchemaInsert();
        var expectedMeta = {
            "name": "test",
            "schema": {
                "schemaType": "single-schema",
                "schema": "type1"
            }
        }
        expectMetaUpdate(expectedMeta);
        var msg;
        schemaSampler.sampleSingleSchema({name: "test"}, "type1", schema, {}, function (e) {
            msg = e;
        }, null)


        expect(msg.msg).to.equal("success");
        done();
    })

    it('generates multi schema', function (done) {

        var schemas = [{name: "1"}, {name: "2"}];
        expectSchemaInsert();


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
                "schemaType": "multi-schema",
                "typeProperty": "type",
                "schemas": ["type1", "type2"]
            }
        }
        expectMetaUpdate(expectedMeta);
        var msg;
        schemaSampler.sampleMultiSchema({name: "test"}, ["type1", "type2"], schema, {typeProperty: "type"}, function (e) {
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

        schemaSampler.generate = function (params, results) {
            return schemaMap;
        }

        schemaSampler.db = function () {
            return {
                collection: function (id) {
                    expect(id).to.equal("testCollection");
                    return {
                        find: function (query, options, callback) {
                            callback(null, {
                                toArray: function () {
                                    [1, 2, 3]
                                }
                            });
                        }
                    }
                }
            }
        }

        schemaSampler.sample("collection1", {}, callback, null)


        done();
    })


    it('sample multi schema', function (done) {

        var callback = function () {
        }

        var meta = {collection: "testCollection"};

        var schema = {};
        var schema2 = {};
        var schemaMap = {test1: schema, test2: schema2}

        schemaSampler.sampleMultiSchema = sinon.mock().withExactArgs(meta, ["test1", "test2"], schemaMap, callback, null)
        //this.sampleSingleSchema(meta, name, schema[name], callback, errCallback);
        //this.sampleMultiSchema(meta, discriminators, schema, callback, errCallback);


        var findById = function (metaId, cb) {
            expect(metaId).to.equal("collection1");
            cb(null, meta);
        }

        schemaSampler.metaCollection = {
            findById: findById
        }

        schemaSampler.generate = function (params, results) {
            return schemaMap;
        }

        schemaSampler.db = function () {
            return {
                collection: function (id) {
                    expect(id).to.equal("testCollection");
                    return {
                        find: function (query, options, callback) {
                            callback(null, {toArray: function() {return [1, 2, 3]}});
                        }
                    }
                }
            }
        }

        schemaSampler.sample("collection1", {}, callback, null)


        done();
    })

})
