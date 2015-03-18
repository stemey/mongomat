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
		this.generator = new SchemaGenerator({typeProperty:"type", sampleCount:10});
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
		expect(schema["subtypes[default].text"].type).to.equal("string");
		expect(schema["subtypes[default].text"].values[0]).to.equal("1212");
		expect(schema["subtypes[default].text"].required).to.equal(true);
		done();
	})

	it('handles number', function (done) {
		var samples = [{
			"count": 1
		}, {
			"count": 1
		}, {
			"count": null
		}];
		var schema = this.generator.generate(samples);
		expect(schema["subtypes[default].count"].type).to.equal("number");
		expect(schema["subtypes[default].count"].required).to.equal(false);
		done();
	})

	it('handles object', function (done) {
		var samples = [{
			"obj": {
				"txt": "tt"
			}
		}];
		var schema = this.generator.generate(samples);
		expect(schema["subtypes[default].obj.subtypes[default].txt"].type).to.equal("string");
		done();
	})

	it('handles deeply nested object', function (done) {
		var samples = [{
			"obj": {
				"embe": {
					"tt":"4"
				}
			}
		}];
		var schema = this.generator.generate(samples);
		expect(schema["subtypes[default].obj.subtypes[default].embe.subtypes[default].tt"].type).to.equal("string");
		done();
	})

	it('handles multi object', function (done) {
		var samples = [
			{
				"obj": {
					"type":"x",
					"txt": "tt"
				}
			}, {
				"obj": {
					"type":"y",
					"count": 3
				}
			}];
		var schema = this.generator.generate(samples);
		expect(schema["subtypes[default].obj.subtypes[x].txt"].type).to.equal("string");
		expect(schema["subtypes[default].obj.subtypes[y].count"].type).to.equal("number");
		done();
	})

	it('handles array', function (done) {
		var samples = [{
			"arr": [
				"tt"
			]
		}];
		var schema = this.generator.generate(samples);
		expect(schema["subtypes[default].arr"].type).to.equal("array");
		expect(schema["subtypes[default].arr.items"].type).to.equal("string");
		done();
	})

	it('handles embedded array', function (done) {
		var samples = [{
			"arr": [
				{"txt": "tt"}
			]
		}];
		var schema = this.generator.generate(samples);
		expect(schema["subtypes[default].arr"].type).to.equal("array");
		expect(schema["subtypes[default].arr.items"].type).to.equal("object");
		expect(schema["subtypes[default].arr.items.subtypes[default].txt"].type).to.equal("string");
		done();
	})


	it('handles multi embedded array', function (done) {
		var samples = [{
			"arr": [
				{
					"type":"x",
					"txt": "tt"
				},
				{
					"type":"y",
					"count": 3
				}
			]
		}];
		var schema = this.generator.generate(samples);
		expect(schema["subtypes[default].arr"].type).to.equal("array");
		expect(schema["subtypes[default].arr.items"].type).to.equal("object");
		expect(schema["subtypes[default].arr.items.subtypes[x].txt"].type).to.equal("string");
		expect(schema["subtypes[default].arr.items.subtypes[y].count"].type).to.equal("number");
		done();
	})

})
