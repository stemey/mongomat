var GformGenerator = function () {
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
		return {code: prop, type: propSchema.type};
	}
}


GformGenerator.prototype.generate_object = function (prop, mainSchema) {

	var attribute = {code: this.getLeaf(prop), type: "object"}
	var schema = mainSchema[prop]
	var subProps = Object.keys(mainSchema).filter(function (key) {
		return key.lastIndexOf(prop) == 0;
	})
	var subSchema = {};
	subProps.forEach(function (subProp) {
		var subCode = subProp.substring(prop.length + 1);
		if (subCode.indexOf(".") < 0 && subCode.length > 0) {
			subSchema[subCode] = mainSchema[subProp];
		}
	})
	var gschema = this.generate(subSchema);
	attribute.group = gschema;
	return attribute;
}

GformGenerator.prototype.generate_array = function (prop, mainSchema) {
	var schema = mainSchema[prop]
	var attribute = {code: this.getLeaf(prop),type:"array"}
	var itemsSchema = mainSchema[prop + ".items"];

	if (itemsSchema.type === "object") {
		var group = this.generate_object(prop+".items", mainSchema);
		delete group.code;
		attribute.group = group.group;
	} else {
		attribute.element = this.generateAttribute(prop+".items",mainSchema);
		delete attribute.element.code;
	}
	return attribute;

}

module.exports = GformGenerator;




