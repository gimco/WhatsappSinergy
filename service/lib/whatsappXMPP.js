
WAZ.XMPP = function (transport) {
	this.transport = transport;
	this.parser = new WAZ.Parser(this);
	this.username = transport.country + transport.number;
};

WAZ.XMPP.DOMAIN = "@s.whatsapp.net";
WAZ.XMPP.SERVER = "bin-short.whatsapp.net";
WAZ.XMPP.PORT = 443;
WAZ.XMPP.TIMEOUT = 300 * 1000;

WAZ.XMPP.prototype.login = function () {
	this.conn = net.createConnection(WAZ.XMPP.PORT, host=WAZ.XMPP.SERVER);

	this.conn.setTimeout(WAZ.XMPP.TIMEOUT);
	this.conn.on("connect", this._onconnect.bind(this));
	this.conn.on("timeout", this._ontimeout.bind(this));
	this.conn.on("data", this._ondata.bind(this));
	this.conn.on("end", this._onend.bind(this));
	this.conn.on("error", this._onend.bind(this));
	
	this.syncFuture = new Future().immediate({ ok : false });
	this.onLoggingOn();
};

WAZ.XMPP.prototype.write = function (data) {
	try {
		this.conn.write(data);
	} catch (e) {
		try { this.conn.end(); } catch (e) { }
		this.onOffline();
	}
};

WAZ.XMPP.prototype.logout = function (transport) {
	if (this.conn) {
		this.conn.end();
	} else {
		this._onend();
	}
};

WAZ.XMPP.prototype.sendMessage = function (id, dest, txt) {
	if (this.conn) {
		console.log("Enviando a " + id + " : " + dest + " : " + txt);
		this.write(WAZ.Messages.XMPP_MESSAGE({id : id, dest : dest, txt : txt}));
	} else {
		this.onOffline();
	}
};



// private
WAZ.XMPP.prototype._onconnect = function () {
	// Socket connected! send hello
	this.write(WAZ.Messages.XMPP_HELLO);
	this.write(WAZ.Messages.XMPP_STREAM);
	this.write(WAZ.Messages.XMPP_FEATURES);
	this.write(WAZ.Messages.XMPP_AUTH);
};

WAZ.XMPP.prototype._ontimeout = function () {
	console.log("Intentar pedir presence, o enviar ping 0x00");
	this.write(WAZ.Messages.XMPP_PRESENCE_AVAILABLE);
};

WAZ.XMPP.prototype._ondata = function (data) {
	console.log("Recibido " + data);
	this.parser.parse(data);
};

WAZ.XMPP.prototype._onend = function () {
	console.log("Cerrado");
	this.onOffline();
};


WAZ.XMPP.prototype.startElement = function (tag, attrs)  {
	console.log("<" + tag + " " + JSON.stringify(attrs) + ">");
	var name = "_start_" + tag.replace(/:/g, '$');
	if (this[name]) {
		this[name](attrs);
	}
	this.text = "";
};

WAZ.XMPP.prototype.endElement = function (tag) {
	console.log("</" + tag + ">");
	var name = "_end_" + tag.replace(/:/g, '$');
	if (this[name]) {
		this[name]();
	}
};

WAZ.XMPP.prototype.characters = function (data) {
	console.log("texto: " + data);
	this.text += data;
};


WAZ.XMPP.prototype._end_challenge = function () {
	this.write(WAZ.Messages.XMPP_RESPONSE({challenge : this.text, imei : this.transport.udid, username : this.username}));
}

WAZ.XMPP.prototype._end_success = function () {
	this.onLoginSuccess();
};

WAZ.XMPP.prototype._start_presence = function (atts) {
	if (atts.status == "dirty") {
		this.write(WAZ.Messages.XMPP_PRESENCE_AVAILABLE);
	} else if (atts.from == (this.username + WAZ.XMPP.DOMAIN)) {
		// TODO: Myself presence 
	} else {
		// TODO: onPresence ?? Process presences of buddies
	}
};

WAZ.XMPP.prototype._start_notify = function (atts) {
	this.name = atts.name;
};

WAZ.XMPP.prototype._start_request = function (atts) {
	this.mode = "request";
};

WAZ.XMPP.prototype._end_body = function () {
	this.body = this.text;
};

WAZ.XMPP.prototype._end_id = function () {
	this.id = this.text;
	this.mode = "confirm-send";
};

WAZ.XMPP.prototype._end_received = function () {
	this.mode = "confirm-ack";
};

WAZ.XMPP.prototype._start_message = function (atts) {
	this.from = atts.from;
	this.id = atts.id;
};

WAZ.XMPP.prototype._end_message = function () {
	
	if (this.mode == "request" && this.body) {
		this.onMessage(this.id, this.from, this.name, this.body);
	} else if (this.mode == "confirm-send") {
		this.onMessageSended(this.id, this.from);
	} else if (this.mode == "confirm-ack") {
		this.onMessageAck(this.id, this.from);
	}
	
	// Clean context data
	this.from = undefined;
	this.id = undefined;
	this.name = undefined;
	this.mode = undefined;
	this.body = undefined;
};

WAZ.XMPP.prototype._start_iq = function (atts) {
	this.from = atts.from;
	this.type = atts.type;
};

WAZ.XMPP.prototype._end_iq = function () {
	if (this.type == "result" && this.from) {
		this.syncFuture.nest(this.onPresence(this.from));
	}
	
	// Clean context data
	this.from = undefined;
	this.type = undefined;
};
