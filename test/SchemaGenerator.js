var expect = require('expect.js')
var SchemaGenerator = require('../SchemaGenerator');
require('mocha');

describe('schema generator ', function () {

	/**
	 * required:
	 * maxlength
	 *
	 */
	beforeEach(function () {
		this.generator = new SchemaGenerator();
	});

	it('handles string', function (done) {
		var samples = [{
			text: "1212"
		}, {
			text: "1212"
		}, {
			text: "1212"
		}];
		var schema = this.generator.generate(samples);
		expect(schema.text.type).to.equal("string");
		done();
	})

	it('handles number', function (done) {
		var samples = [{
			"count":1
		}, {
			"count":1
		}, {
			"count":1
		}];
		var schema = this.generator.generate(samples);
		expect(schema.count.type).to.equal("number");
		done();
	})

	it('handles object', function (done) {
		var samples = [{
			"obj":{
				"txt":"tt"
			}
		}];
		var schema = this.generator.generate(samples);
		expect(schema["obj.txt"].type).to.equal("string");
		done();
	})

	it('handles array', function (done) {
		var samples = [{
			"arr":[
				"tt"
			]
		}];
		var schema = this.generator.generate(samples);
		expect(schema["arr"].type).to.equal("array");
		expect(schema["arr.items"].type).to.equal("string");
		done();
	})

	it('handles embedded array', function (done) {
		var samples = [{
			"arr":[
				{"txt":"tt"}
			]
		}];
		var schema = this.generator.generate(samples);
		expect(schema["arr"].type).to.equal("array");
		expect(schema["arr.items"].type).to.equal("object");
		expect(schema["arr.items.txt"].type).to.equal("string");
		done();
	})


})
