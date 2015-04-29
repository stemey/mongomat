var SampleContext = require("./SampleContext");
var bson = require("bson");

var SchemaGenerator = function (config) {
	this.config = config;
}

SchemaGenerator.prototype.generate = function (samples) {
	var ctx = new SampleContext();
	samples.forEach(function (sample) {
		this.generateSingle(null, sample, ctx);
	}, this);
	return this.mergeSchemaSamples(ctx.samples);
}
SchemaGenerator.prototype.generateSingle = function (parentProp, sample, ctx) {
	var type = this.getTypeDiscriminator(sample);
	if (parentProp) {
		parentProp = parentProp + ".subtypes[" + type + "]";
	} else {
		parentProp = "subtypes[" + type + "]";
	}
	if (typeof sample === "object") {
		Object.keys(sample).forEach(function (prop) {
			this.generateProp(this.createPath(parentProp, prop), sample[prop], ctx);
		}, this);
	} else {
		console.log("no object " + sample);
	}
}
SchemaGenerator.prototype.getTypeDiscriminator = function (sample) {
	if (sample && this.config && this.config.typeProperty) {
		return sample[this.config.typeProperty] || "default"
	} else {
		return "default";
	}
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
		var required = true;
		if ("any" in types) {
			required = false;
			delete types.any;
		}
		if (Object.keys(types).length == 1) {
			var mergeMethod = "merge_" + propSamples[0].type;
			if (this[mergeMethod]) {
				schema[prop] = this[mergeMethod](propSamples, required);
			} else {
				schema[prop] = propSamples[0];
				schema[prop].required = required;
			}
		} else {
			schema[prop] = {type: "any"}
		}

	}, this)
	return schema;
}
SchemaGenerator.prototype.generateGform = function (schema) {
	var gschema = {};
	Object.keys(schema).forEach(function (prop) {
		var path = prop.split("/.");
		var propSchema = schema[prop];
		if (path.length == 1) {
			var attribute = {code: prop};
			Object.keys(propSchema).forEach(function (key) {
				attribute[key] = propSchema[key];
			})

			gschema.attributes.push(attribute);
		}
	});
}
SchemaGenerator.prototype.generate_string = function (prop, propSample, ctx) {
	var schema = {};
	schema.type = "string";
	schema.value = propSample;
	ctx.add(prop, schema);
}
SchemaGenerator.prototype.generate_any = function (prop, propSample, ctx) {
	var schema = {};
	schema.type = "any";
	schema.value = propSample;
	ctx.add(prop, schema);
}

SchemaGenerator.prototype.merge_string = function (samples, required) {
	var schema = {};
	schema.type = "string";
	schema.required = required;
	var values = [];
	samples.forEach(function (sample) {
		if (values.indexOf(sample.value) < 0) {
			values.push(sample.value);
		}
	});
	var sampleCount = this.config.sampleCount || 100;
	if (sampleCount / values.length >= (this.config.enumThreshold || 10)) {
		schema.values = values;
	}
	return schema;
}
SchemaGenerator.prototype.generate_number = function (prop, propSample, ctx) {
	var schema = {};
	schema.type = "number";
	schema.value = propSample;
	ctx.add(prop, schema);
}
SchemaGenerator.prototype.generate_date = function (prop, propSample, ctx) {
	var schema = {};
	schema.type = "date";
	schema.value = propSample;
	ctx.add(prop, schema);
}
SchemaGenerator.prototype.generate_object = function (prop, sample, ctx) {
	var schema = {};
	schema.type = "object";
	schema.value = sample;
	ctx.add(prop, schema);
	this.generateSingle(prop, sample, ctx);
}
SchemaGenerator.prototype.generate_boolean = function (prop, sample, ctx) {
	var schema = {};
	schema.type = "boolean";
	schema.value = sample;
	ctx.add(prop, schema);
}
SchemaGenerator.prototype.generate_array = function (prop, sample, ctx) {
	var schema = {};
	schema.type = "array";
	schema.value = sample;
	//schema.itemsType=this.getType();
	ctx.add(prop, schema);
	if (sample.length == 0) {
		sample = [""]
	}
	sample.forEach(function (element) {
		this.generateProp(this.createPath(prop, "items"), element, ctx);
	}, this);

}
SchemaGenerator.prototype.getType = function (propSample) {
	var type;
	if (propSample == null) {
		type = "any";
	} else if (Array.isArray(propSample)) {
		type = "array";
	} else if (propSample instanceof bson.ObjectID) {
		type = "string";
	} else if (propSample instanceof Date) {
		type = "date";
	} else {
		type = typeof propSample;
	}
	return type;
}
SchemaGenerator.prototype.generateProp = function (prop, propSample, ctx) {
	var schema = {};
	var type = this.getType(propSample);
	var method = "generate_" + type;
	var propSchema;
	if (this[method]) {
		propSchema = this[method](prop, propSample, ctx);
	} else {
		console.log("no method for type " + type);
		propSchema = {type: "any"}
	}
	return propSchema;
}


module.exports = SchemaGenerator;




