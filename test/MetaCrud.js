var expect = require('expect.js')
var MetaCrud = require('../MetaCrud');
require('mocha');
var sinon = require('sinon');

describe('meta crud', function () {


	var myId = "012345678901234567891234";

	beforeEach(function () {
		this.crud = new MetaCrud({queryParser: {}});
	});


	it('updates object by id', function (done) {
		var updatedEntity = {};
		var old = {};
		var collection = {
			updateById: function (id, value, options, cb) {
				expect(value.$set).to.equal(updatedEntity);
				cb(null, id == myId ? 1 : null);
			}, findById: function (id, cb) {
				cb(null, old);
			}, count: function (query, cb) {
				cb(null, 0);
			}
		};
		var send = sinon.mock().withExactArgs({msg: 'success'});
		this.crud.update(collection, updatedEntity, myId, {send: send}, null);
		send.verify();
		done();

	})

	it('fails to update collection because it already exists', function (done) {
		var doc = {_id: myId, collection: "test"};
		var collection = {
			count: function (query, cb) {
				cb("oops", 4);
			}
		};
		var res = {
			status: sinon.mock().withExactArgs(512).returnsThis(),
			send: sinon.mock()
		}
		this.crud.update(collection, doc, myId, res, null);
		res.send.verify();
		res.status.verify();
		done();
	})

	it('updates collection', function (done) {
		var collection = {rename: sinon.mock().withExactArgs("test")};
		var doc = {_id: myId, collection: "test"};
		var updated_doc = {_id: myId, collection: "test"};
		var collection = {
			findById: function (id, cb) {
				cb(null, doc);
			}, updateById: function (id, op, options, cb) {
				expect(id).to.equal(myId);
				expect(op.$set).to.equal(updated_doc);
				expect(id).to.equal(myId);
				expect(typeof updated_doc._id === "undefined").to.equal(true);
				cb(null, 1);
			}, count: function (query, cb) {
				cb(0);
			}
		};
		var res = {
			send: sinon.mock().withExactArgs({msg: 'success'})
		}
		this.crud.update(collection, updated_doc, myId, res, null);
		res.send.verify();
		done();
	})

	it('updates collection and renames mongodb collection', function (done) {
		var doc = {_id: myId, collection: "test"};
		var updated_doc = {_id: myId, collection: "newtest"};
		var targetCollection = {
			rename: function (newName, cb) {
				expect(newName).to.equal("newtest");
				cb(null);
			}
		}
		this.crud.db = {collection: sinon.mock().withExactArgs("test").returns(targetCollection)};
		var collection = {
			findById: function (id, cb) {
				cb(null, doc);
			}, updateById: function (id, op, options, cb) {
				expect(id).to.equal(myId);
				expect(op.$set).to.equal(updated_doc);
				expect(id).to.equal(myId);
				expect(typeof updated_doc._id === "undefined").to.equal(true);
				cb(null, 1);
			}, count: function (query, cb) {
				cb(0);
			}
		};
		var res = {
			send: sinon.mock().withExactArgs({msg: 'success'})
		}
		this.crud.update(collection, updated_doc, myId, res, null);
		res.send.verify();
		done();
	})

	it('creates new object', function (done) {
		var entity = {collection: "test"};
		this.crud.db = {
			createCollection: function (name, cb) {
				expect(name).to.equal(entity.collection);
				cb(null);
			}
		};
		var collection = {
			insert: function (value, options, cb) {
				cb(null, entity);
			}, count: function (query, cb) {
				cb(0);
			}
		};
		var res = {
			send: sinon.mock().withExactArgs(entity).returnsThis()
		}
		this.crud.insert(collection, entity, res, null);
		res.send.verify();
		done();
	})

})
