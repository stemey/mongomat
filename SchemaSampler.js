var GformGenerator = require("./GformGenerator");
var SchemaGenerator = require("./SchemaGenerator");

var SchemaSampler = function (config) {
	if (config) {
		this.metaCollection = config.metaCollection;
		this.schemaCollection = config.schemaCollection;
		this.db = config.db;
	}
}

SchemaSampler.prototype.generate=function(params,results) {
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
			this.db.collection(meta.collection).find({}, {limit: params.sampleCount}, function (e, cursor) {
				if (e) {
					errCallback(e);
				} else {
					cursor.toArray(function (e, results) {
						var schema = this.generate(params, results);
						var discriminators = Object.keys(schema);
						if (discriminators.length == 1 && discriminators[0] == "default") {
							var name = discriminators[0];
							this.sampleSingleSchema(meta, name, schema[name], callback, errCallback);
						} else {
							this.sampleMultiSchema(meta, discriminators, schema, callback, errCallback);
						}
					}.bind(this));
				}
			}.bind(this))

		}
	}.bind(this));
}
SchemaSampler.prototype.updateMeta = function (meta, callback, errCallback) {
	this.metaCollection.updateById(meta._id, {$set: meta}, {
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
SchemaSampler.prototype.sampleSingleSchema = function (meta, name, schema, callback, errCallback) {
	var schemaEntity = this.createSchemaEntity(meta,name,schema);

	this.schemaCollection.insert(schemaEntity, function (e, result) {
		if (e) {
			errCallback(e);
		} else {
			meta.schema = {type: "single-schema", schema: result};
			this.updateMeta(meta, callback, errCallback);
		}
	}.bind(this));
}
SchemaSampler.prototype.createSchemaEntity=function(meta,name,schema) {
	return {
		_id:name,
		group: schema,
		description: "generated on " + new Date() + " for collection " + meta.collection,
		name: name
	}
}
SchemaSampler.prototype.sampleMultiSchema = function (meta, discriminators, schemaMap, callback, errCallback) {
	var schemas = [];
	discriminators.forEach(function (discriminator) {
		var schema = this.createSchemaEntity(meta,discriminator,schemaMap[discriminator]);
		schemas.push(schema);
	},this);
	this.schemaCollection.insert(schemas, function (e, ids) {
		if (e) {
			errCallback(e);
		} else {
			meta.schema = {schemaType: "multi-schema", schemas: ids};
			meta.typeProperty="className";
			this.updateMeta(meta, callback, errCallback);
		}
	}.bind(this));

}


module.exports = SchemaSampler;




