var SampleContext = require("./SampleContext");
var SchemaGenerator = function (config) {
	this.config=config;
}

SchemaGenerator.prototype.generate = function (samples) {
	var ctx =  new SampleContext();
	samples.forEach(function (sample) {
		this.generateSingle(null, sample, ctx);
	}, this);
	return this.mergeSchemaSamples(ctx.samples);
}
SchemaGenerator.prototype.generateSingle = function (parentProp, sample, ctx) {
	Object.keys(sample).forEach(function (prop) {
		this.generateProp(this.createPath(parentProp, prop), sample[prop], ctx);
	}, this);
}
SchemaGenerator.prototype.createPath = function (parent, child) {
	if (parent != null) {
		return parent + "." + child;
	} else {
		return child;
	}
}
SchemaGenerator.prototype.mergeSchemaSamples = function (schemaSamples) {
	var schema = {};
	Object.keys(schemaSamples).forEach(function (prop) {
		var propSamples = schemaSamples[prop];
		var types = {};
		propSamples.forEach(function (schemaSample) {
			var count = types[schemaSample.type];
			if (typeof count == "undefined") {
				types[schemaSample.type] = 1;
			} else {
				types[schemaSample.type]++;
			}
		})
		if (Object.keys(types).length == 1) {
			schema[prop] = propSamples[0];
		}

	})
	return schema;
}
SchemaGenerator.prototype.generateGform=function(schema) {
	var gschema={};
	Object.keys(schema).forEach(function(prop) {
		var path = prop.split("/.");
		var propSchema =schema[prop];
		if (path.length==1) {
			var attribute={code:prop};
			Object.keys(propSchema).forEach(function(key) {
				attribute[key]=propSchema[key];
			})

			gschema.attributes.push(attribute);
		}
	});
}
SchemaGenerator.prototype.generate_string = function (prop, propSample, ctx) {
	var schema = {};
	schema.type = "string";
	ctx.add(prop, schema);
}
SchemaGenerator.prototype.generate_number = function (prop, propSample, ctx) {
	var schema = {};
	schema.type = "number";
	ctx.add(prop, schema);
}
SchemaGenerator.prototype.generate_date = function (prop, propSample, ctx) {
	var schema = {};
	schema.type = "date";
	ctx.add(prop, schema);
}
SchemaGenerator.prototype.generate_object = function (prop, sample, ctx) {
	var schema = {};
	schema.type = "object";
	ctx.add(prop, schema);
	this.generateSingle(prop, sample, ctx);
}
SchemaGenerator.prototype.generate_array = function (prop, sample, ctx) {
	var schema = {};
	schema.type = "array";
	//schema.itemsType=this.getType();
	ctx.add(prop, schema);
	sample.forEach(function (element) {
		this.generateProp(this.createPath(prop, "items"), element, ctx);
	}, this);
}
SchemaGenerator.prototype.getType = function (propSample) {
	var type;
	if (Array.isArray(propSample)) {
		type = "array";
	} else {
		type = typeof propSample;
	}
	return type;
}
SchemaGenerator.prototype.generateProp = function (prop, propSample, ctx) {
	var schema = {};
	var type = this.getType(propSample);
	var method = "generate_" + type;
	var propSchema = this[method](prop, propSample, ctx);
	return propSchema;
}


module.exports = SchemaGenerator;




