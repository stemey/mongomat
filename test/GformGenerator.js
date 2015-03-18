var expect = require('expect.js')
var GformGenerator = require('../GformGenerator');
require('mocha');

describe('gform generator ', function () {

	beforeEach(function () {
		this.generator = new GformGenerator();
	});

	it('groups by discriminator', function (done) {
		var schema = {
			"subtypes[default].count": {type: "number"},
			"subtypes[default].txt": {type: "string"},
			"subtypes[xxx].txt": {type: "string"}
		};
		var groups = this.generator.group(schema);
		expect(groups.default.count.type).to.equal("number");
		expect(groups.xxx.txt.type).to.equal("string");
		done();
	})

	it('handles primitive', function (done) {
		var schema = {"subtypes[default].count": {type: "number", required:true}};
		var gschema = this.generator.generateMulti(schema)
		//var gschema = this.generator.generate(groups.default);
		expect(gschema.default.attributes[0].code).to.equal("count");
		expect(gschema.default.attributes[0].type).to.equal("number");
		expect(gschema.default.attributes[0].required).to.equal(true);
		done();
	})

	it('handles string', function (done) {
		var schema = {"subtypes[default].text": {type: "string",values:["tt","dd"]}};
		var gschema = this.generator.generateMulti(schema)
		//var gschema = this.generator.generate(groups.default);
		expect(gschema.default.attributes[0].code).to.equal("text");
		expect(gschema.default.attributes[0].type).to.equal("string");
		expect(gschema.default.attributes[0].editor).to.equal("select");
		expect(gschema.default.attributes[0].values.length).to.equal(2);
		expect(gschema.default.attributes[0].values[0].value).to.equal("tt");
		done();
	})

	it('handles two primitive', function (done) {
		var schema = {
			"subtypes[default].count": {type: "number"},
			"subtypes[default].txt": {type: "string"}
		};
		var gschema = this.generator.generateMulti(schema)
		//var gschema = this.generator.generate(groups.default);
		expect(gschema.default.attributes[0].code).to.equal("count");
		expect(gschema.default.attributes[0].type).to.equal("number");
		expect(gschema.default.attributes[0].editor).to.equal("number");
		expect(gschema.default.attributes[1].code).to.equal("txt");
		expect(gschema.default.attributes[1].type).to.equal("string");
		done();
	})

	it('handles object', function (done) {
		var schema = {
			"embedded": {type: "object"},
			"embedded.subtypes[default].text": {type: "string"}
		};
		var gschema = this.generator.generate(schema);
		expect(gschema.attributes[0].code).to.equal("embedded");
		expect(gschema.attributes[0].type).to.equal("object");
		expect(gschema.attributes[0].editor).to.equal("object");
		expect(gschema.attributes[0].group.attributes[0].code).to.equal("text");
		expect(gschema.attributes[0].group.attributes[0].type).to.equal("string");
		done();
	})

	it('handles deeply nested object', function (done) {
		var schema = {
			"embedded": {type: "object"},
			"embedded.subtypes[default].e": {type: "object"},
			"embedded.subtypes[default].e.subtypes[default].txt": {type: "string"}
		};
		var gschema = this.generator.generate(schema);
		expect(gschema.attributes[0].code).to.equal("embedded");
		expect(gschema.attributes[0].type).to.equal("object");
		var attribute0=gschema.attributes[0].group.attributes[0];
		expect(attribute0.code).to.equal("e");
		expect(attribute0.type).to.equal("object");
		expect(attribute0.group.attributes[0].code).to.equal("txt");
		expect(attribute0.group.attributes[0].type).to.equal("string");
		done();
	})

	it('handles multi object', function (done) {
		var schema = {
			"embedded": {type: "object"},
			"embedded.subtypes[x].text": {type: "string"},
			"embedded.subtypes[y].count": {type: "number"}
		};
		var gschema = this.generator.generate(schema);
		expect(gschema.attributes[0].code).to.equal("embedded");
		expect(gschema.attributes[0].type).to.equal("object");
		expect(gschema.attributes[0].groups.length).to.equal(2);
		expect(gschema.attributes[0].editor).to.equal("multi-object");
		var group1 =gschema.attributes[0].groups[0];
		var group2 =gschema.attributes[0].groups[1];
		var xGroup,yGroup;
		if (group1.code=="x") {
			xGroup=group1;
			yGroup=group2;
		} else{
			xGroup=group2;
			yGroup=group1;
		}
		expect(xGroup.attributes[0].code).to.equal("text");
		expect(xGroup.code).to.equal("x");
		expect(yGroup.attributes[0].code).to.equal("count");
		expect(yGroup.code).to.equal("y");
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
		expect(gschema.attributes[0].editor).to.equal("primitive-array");
		done();
	})

	it('handles embedded array', function (done) {
		var schema = {
			"strings": {type: "array"},
			"strings.items": {type: "object"},
			"strings.items.subtypes[default].text": {type: "string"}
		};
		var gschema = this.generator.generate(schema);
		expect(gschema.attributes.length).to.equal(1);
		expect(gschema.attributes[0].code).to.equal("strings");
		expect(gschema.attributes[0].type).to.equal("array");
		expect(gschema.attributes[0].group.attributes[0].code).to.equal("text");
		expect(gschema.attributes[0].group.attributes[0].type).to.equal("string");
		expect(gschema.attributes[0].editor).to.equal("array");
		done();
	})


	it('handles multi embedded array', function (done) {
		var schema = {
			"ems": {type: "array"},
			"ems.items": {type: "object"},
			"ems.items.subtypes[x].text": {type: "string"},
			"ems.items.subtypes[y].count": {type: "number"}
		};
		var gschema = this.generator.generate(schema);
		expect(gschema.attributes.length).to.equal(1);
		expect(gschema.attributes[0].code).to.equal("ems");
		expect(gschema.attributes[0].type).to.equal("array");
		expect(gschema.attributes[0].editor).to.equal("multi-array");

		var group1 =gschema.attributes[0].groups[0];
		var group2 =gschema.attributes[0].groups[1];
		var xGroup,yGroup;
		if (group1.code=="x") {
			xGroup=group1;
			yGroup=group2;
		} else{
			xGroup=group2;
			yGroup=group1;
		}


		expect(xGroup.attributes[0].code).to.equal("text");
		expect(yGroup.attributes[0].code).to.equal("count");
		done();
	})

})
