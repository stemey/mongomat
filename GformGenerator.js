var GformGenerator = function (config) {
	this.config = config || {};
	if (config && config.editorMapping) {
		this.editorMapping = config.editorMapping;
	} else {
		this.editorMapping = {};
	}
}


GformGenerator.prototype.generateMulti = function (schema) {
	var groups = this.group(schema);
	var schemas = {};
	Object.keys(groups).forEach(function (discriminator) {
		schemas[discriminator] = this.generate(groups[discriminator]);
	}, this);
	return schemas;
}
GformGenerator.prototype.group = function (schema) {
	var groups = {};
	Object.keys(schema).forEach(function (path) {
		var d = path.match(/subtypes\[([^\]]+)\]/);
		if (d && d.length == 2) {
			var discriminator = d[1];
			var subPath = path.substring(("subtypes[" + discriminator + "]").length + 1)
			var samples = groups[discriminator];
			if (!samples) {
				samples = {};
				groups[discriminator] = samples;
			}
			samples[subPath] = schema[path];
		} else {
			console.log("no discriminator found " + path);
		}
	}, {})
	return groups;
}
GformGenerator.prototype.generate = function (schema) {
	var gschema = {attributes: []};
	Object.keys(schema).forEach(function (prop) {
		var path = prop.split(".");
		if (path.length == 1) {
			var attribute = this.generateAttribute(prop, schema);
			gschema.attributes.push(attribute);
		}
	}, this);
	return gschema;
}
GformGenerator.prototype.getLeaf = function (path) {
	return path.substring(path.lastIndexOf("."));
}
GformGenerator.prototype.generateAttribute = function (prop, schema) {
	var propSchema = schema[prop];
	var method = "generate_" + propSchema.type;
	if (this[method]) {
		return this[method](prop, schema);
	} else {
		var attribute = {code: prop, type: propSchema.type};
		if (propSchema.required) {
			attribute.required = propSchema.required;
		}
		attribute.editor = this.getEditor(attribute);
		return attribute;
	}
}
GformGenerator.prototype.getEditor = function (attribute) {
	var editor = this.editorMapping[attribute.type];
	if (editor) {
		return editor;
	} else {
		return attribute.type;
	}
}
GformGenerator.prototype.generate_string = function (prop, mainSchema) {
	var propSchema = mainSchema[prop];
	var attribute = {
		code: this.getLeaf(prop),
		type: "string",
		required: propSchema.required
	}
	if (propSchema.values) {
		attribute.values = propSchema.values.map(function (value) {
			return {value: value, label: value};
		});
		attribute.editor = "select";
	} else {
		attribute.editor = "string";
	}
	return attribute;
}

GformGenerator.prototype.generate_object = function (prop, mainSchema) {

	var attribute = {
		code: this.getLeaf(prop),
		type: "object"
	}
	var schema = mainSchema[prop]
	if (schema.required) {
		attribute.required = schema.required;
	}
	var subProps = Object.keys(mainSchema).filter(function (key) {
		return key.indexOf(prop) == 0;
	})
	var subSchema = {};
	subProps.forEach(function (subProp) {
		var subCode = subProp.substring(prop.length + 1);
		if (subCode.length > 0 && subCode.indexOf(".") > 0) {
			subSchema[subCode] = mainSchema[subProp];
		}
	})
	// TODO lacks prop parameter to mnage deeply nested schemas
	var groups = this.generateMulti(subSchema);
	var keys = Object.keys(groups);
	if (keys.length == 1) {
		attribute.group = groups[keys[0]];
		attribute.editor = "object";
	} else {
		attribute.groups = keys.map(function (discriminator) {
			var group = groups[discriminator];
			group.code = discriminator;
			group.editor="listpane";
			return group;
		})
		attribute.typeProperty = this.config.typeProperty;
		attribute.editor = "multi-object";
	}
	return attribute;
}


GformGenerator.prototype.generate_array = function (prop, mainSchema) {
	var schema = mainSchema[prop]
	var attribute = {code: this.getLeaf(prop), type: "array"}
	var itemsSchema = mainSchema[prop + ".items"];

	if (itemsSchema.type === "object") {
		var group = this.generate_object(prop + ".items", mainSchema);
		delete group.code;
		if (group.group) {
			attribute.group = group.group;
			attribute.editor = "array";
		} else {
			attribute.typeProperty = this.config.typeProperty;
			attribute.groups = group.groups;
			attribute.editor = "multi-array";
		}
	} else {
		attribute.element = this.generateAttribute(prop + ".items", mainSchema);
		attribute.editor = "primitive-array";
		delete attribute.element.code;
	}
	return attribute;

}

module.exports = GformGenerator;




