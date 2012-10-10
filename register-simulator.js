#!/bin/node

var registered = true;
var http = require("http");

http.createServer(function(req, res) {

res.writeHead(200, { 'Content-Type' : 'text/plain' });
if (req.url.indexOf("exist.php") != -1) {
	if (registered) {
		res.end('<?xml version="1.0" encoding="UTF-8"?>\n<exist>\n<response status="ok" result="34657303459"/>\n</exist>');
	} else {
		res.end('<?xml version="1.0" encoding="UTF-8"?>\n<exist>\n<response status="failed" result="34657303459"/>\n</exist>');
	}
} else if (req.url.indexOf("code.php") != -1) {
	res.end('<?xml version="1.0" encoding="UTF-8"?>\n<exist>\n<response status="ok" result="34657303459"/>\n</exist>');
	//res.end('<?xml version="1.0" encoding="UTF-8"?>\n<code>\n<response status="fail-too-many"/>\n</code>');
} else if (req.url.indexOf("register.php") != -1) {
	res.end('<?xml version="1.0" encoding="UTF-8"?>\n<exist>\n<response status="ok" result="34657303459"/>\n</exist>');
	registered = true;
} else {
	res.end("....");
}

}).listen(80, '127.0.0.1');