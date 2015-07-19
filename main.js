var app = require('./app').app,
	config = require('./app').config,
	express = require('express'),
	open = require('open');


// add cors support

var allowCrossDomain = function (req, res, next) {
	res.header('Access-Control-Expose-Headers', "Content-Range,Location");
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	// dojo sends X-Requested-With and If-None-Match (for insert)
	res.header('Access-Control-Allow-Headers', 'Content-Range,Content-Type, X-Requested-With, If-None-Match');

	return next();
}

app.use(allowCrossDomain);

require('./mongorest');
require('./metarest');
require('./dbrest');
require('./schemarest');


console.info("starting server on port " + config.port);
app.use("/client", express.static("./node_modules/gform-app/dist"));
app.listen(config.port);
if (config.openBrowser) {
	console.info("opening browser")
	open("http://localhost:" + config.port + "/client/mongodb.html");
}
