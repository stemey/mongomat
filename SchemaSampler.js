var GformGenerator = require("./GformGenerator");
var SchemaGenerator = require("./SchemaGenerator");

var SchemaSampler = function (config) {
	if (config) {
		this.metaCollection = config.metaCollection;
		this.schemaCollection = config.schemaCollection;
		this.db = config.db;
	}
}

SchemaSampler.prototype.generate = function (params, results) {
	var schemaGenerator = new SchemaGenerator({typeProperty: params.typeProperty});
	var gformGenerator = new GformGenerator({typeProperty: params.typeProperty});
	var schemaInfo = schemaGenerator.generate(results);
	return gformGenerator.generateMulti(schemaInfo);
}
SchemaSampler.prototype.sample = function (metaId, params, callback, errCallback) {

	var app = this.app;
	this.metaCollection.findById(metaId, function (e, meta) {
		if (e) {
			errCallback(e);
		} else {
			this.db(meta.db).collection(meta.collection).find({}, {limit: params.sampleCount}, function (e, cursor) {
				if (e) {
					errCallback(e);
				} else {
					cursor.toArray(function (e, results) {
						var schema = this.generate(params, results);
						var discriminators = Object.keys(schema);
						if (discriminators.length == 1 && discriminators[0] == "default") {
							var name = discriminators[0];
							this.sampleSingleSchema(meta, meta.collection, schema[name], params, callback, errCallback);
						} else {
							this.sampleMultiSchema(meta, discriminators, schema, params, callback, errCallback);
						}
					}.bind(this));
				}
			}.bind(this))

		}
	}.bind(this));
}
SchemaSampler.prototype.updateMeta = function (meta, callback, errCallback) {
	var id = meta._id;//.toHexString();
	delete meta._id;
	this.metaCollection.updateById(id, {$set: meta}, {
		safe: true,
		multi: false
	}, function (e, result) {
		if (e) {
			errCallback(e);
		} else {
			callback({msg: 'success'})
		}
	});
}
SchemaSampler.prototype.sampleSingleSchema = function (meta, name, schema, options, callback, errCallback) {
	var schemaEntity = this.createSchemaEntity(meta, name, schema);
	this.schemaCollection.findById(name, function (e, result) {
		if (result == null || !options.overwrite) {
			if (result == null) {
				schemaEntity._id = name;
			}

			this.schemaCollection.insert(schemaEntity, function (e, result) {
				if (e) {
					errCallback(e);
				} else {
					var id = result[0]._id.toHexString();
					meta.schema = {schemaType: "single-schema", schema: id};
					this.updateMeta(meta, callback, errCallback);
				}
			}.bind(this));
		} else {
			this.schemaCollection.updateById(name, schemaEntity, function (e, result) {
				if (e) {
					errCallback(e);
				} else {
					meta.schema = {schemaType: "single-schema", schema: result};
					this.updateMeta(meta, callback, errCallback);
				}
			}.bind(this));
		}

	}.bind(this));
}
SchemaSampler.prototype.createSchemaEntity = function (meta, name, schema) {
	return {
		group: schema,
		description: "generated on " + new Date() + " for collection " + meta.collection,
		name: name
	}
}

SchemaSampler.prototype.sampleMultiSchema = function (meta, discriminators, schemaMap, options, callback, errCallback) {
	var schemas = [];
	discriminators.forEach(function (discriminator) {
		var schema = this.createSchemaEntity(meta, discriminator, schemaMap[discriminator]);
		schemas.push(schema);
	}, this);
	this.schemaCollection.insert(schemas, function (e, results) {
		if (e) {
			errCallback(e);
		} else {
			meta.schema = {schemaType: "multi-schema", schemas: results.map(function(schema) {
				return schema._id.toHexString();
			})};
			meta.schema.typeProperty = options.typeProperty;
			this.updateMeta(meta, callback, errCallback);
		}
	}.bind(this));

}


module.exports = SchemaSampler;




