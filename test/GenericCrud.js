var expect = require('expect.js')
var GenericCrud = require('../GenericCrud');
require('mocha');
var sinon = require('sinon');

describe('generic crud ', function() {



	beforeEach(function() {
		this.crud = new GenericCrud({queryParser:{}});
	});

	it('finds object by id', function (done) {
		var entity=999;
		var collection ={
			findOne: function(query,cb) {
				cb(null,query._id==1?entity:null);
			}
		};
		var send = sinon.mock().withExactArgs(entity);
		this.crud.get(collection,1,{send:send},null);
		send.verify();
		done();
	})

	it('updates object by id', function (done) {
		var updatedEntity=999;
		var collection ={
			updateById: function(id,value, options,cb) {
				expect(value).to.equal(updatedEntity);
				cb(null,id==1?1:null);
			}
		};
		var send = sinon.mock().withExactArgs({msg:'success'});
		this.crud.update(collection,1,updatedEntity,{send:send},null);
		send.verify();
		done();
	})

	it('creates new object', function (done) {
		var entity={value:999};
		var createdEntity={_id:1,value:999};
		var collection ={
			insert: function(value, options,cb) {
				cb(null,[createdEntity]);
			}
		};
		var send = sinon.mock().withExactArgs(createdEntity);
		this.crud.insert(collection,entity,{send:send},null);
		send.verify();
		done();
	})


})
