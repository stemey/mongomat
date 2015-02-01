var SampleContext = function () {
	this.samples={};
}


/**
 * add a sschema Sample
 * @param samples
 * @returns {*}
 */
SampleContext.prototype.add = function (path, sample) {
	var samples = this.samples[path];
	if (!samples) {
		samples = [];
		this.samples[path] = samples;
	}
	samples.push(sample);

}


module.exports = SampleContext;




