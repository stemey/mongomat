var expect = require('expect.js')
var GformGenerator = require('../GformGenerator');
require('mocha');

describe('gform generator ', function () {

	/**
	 * required:
	 * maxlength
	 *
	 */
	beforeEach(function () {
		this.generator = new GformGenerator();
	});

	it('handles primitive', function (done) {
		var schema = {"count": {type: "number"}};
		var gschema = this.generator.generate(schema);
		expect(gschema.attributes[0].code).to.equal("count");
		expect(gschema.attributes[0].type).to.equal("number");
		done();
	})

	it('handles object', function (done) {
		var schema = {
			"embedded": {type: "object"},
			"embedded.text": {type: "string"}
		};
		var gschema = this.generator.generate(schema);
		expect(gschema.attributes[0].code).to.equal("embedded");
		expect(gschema.attributes[0].type).to.equal("object");
		expect(gschema.attributes[0].group.attributes[0].code).to.equal("text");
		expect(gschema.attributes[0].group.attributes[0].type).to.equal("string");
		done();
	})

	it('handles primitive array', function (done) {
		var schema = {
			"strings": {type: "array"},
			"strings.items": {type: "string"}
		};
		var gschema = this.generator.generate(schema);
		expect(gschema.attributes[0].code).to.equal("strings");
		expect(gschema.attributes[0].type).to.equal("array");
		expect(gschema.attributes[0].element.type).to.equal("string");
		done();
	})

	it('handles embedded array', function (done) {
		var schema = {
			"strings": {type: "array"},
			"strings.items": {type: "object"},
			"strings.items.text": {type: "string"}
		};
		var gschema = this.generator.generate(schema);
		expect(gschema.attributes.length).to.equal(1);
		expect(gschema.attributes[0].code).to.equal("strings");
		expect(gschema.attributes[0].type).to.equal("array");
		expect(gschema.attributes[0].group.attributes[0].code).to.equal("text");
		expect(gschema.attributes[0].group.attributes[0].type).to.equal("string");
		done();
	})


})
