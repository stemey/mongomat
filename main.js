var app = require('./app').app;


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


app.listen(3001);
