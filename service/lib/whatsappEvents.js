
WAZ.XMPP.prototype.onLoggingOn = function() {
	changeLoginState(this.transport.accountId, PalmLoginState.LOGGING_ON);
};

WAZ.XMPP.prototype.onLoginSuccess = function() {
	changeLoginState(this.transport.accountId, PalmLoginState.ONLINE);
	
	// Get all person and calcule mobile phone numbers
	var future = DB.find({ from : PALM_PERSON });
	future.then(this, function(future) {
		var phones = [];
		_.each(future.result.results, function (person, index, list) {
			_.each(person.phoneNumbers, function (phoneNumber, index, list) {
				console.log(JSON.stringify(phoneNumber));
				if (phoneNumber && phoneNumber.type && phoneNumber.type == "type_mobile") {
					phoneNumber = phoneNumber.value;
					// Only numbers
					phoneNumber = phoneNumber.replace(/./g, function(o) { return /\d|\+/.test(o) ? o : ""});
					// TODO: Better control country codes
					phoneNumber = phoneNumber.replace(new RegExp("^(00|\\+)" + this.transport.country), "");
					phones.push(phoneNumber);
				}
			}, this);
		}, this);
		
		console.log("Update buddies status");
		var body = "cc=" +  this.transport.country + "&me=" + this.transport.number;
		body = phones.reduce(function (rest, phoneNumber) {  return rest + "&u[]=" + phoneNumber}, body);
		future.nest(AjaxCall.post(WAZ.CHECK_CONTACTS, body, { headers : { "User-Agent" : WAZ.Register.USER_AGENT }}));
	});
	future.then(this, function(future) {
		if (future.result.status == 200) {
			console.log(JSON.stringify(future.result.responseText));
			// Sometimes the end of the CDATA is not recognized by xml2json! bad format xml? :S
			var status = xml2json(future.result.responseText.replace(/]] >/g, "]]>"));
			console.log(JSON.stringify(status));
			_.each([].concat(status.statusreport.s), function(contact) {
				if (contact.u != "1") {
					console.log("Creando " + contact.jid + " - " + JSON.stringify(contact));
					this.syncFuture.nest(this.onPresence(contact.jid, null, contact.$t));
				}
			}, this);
		}
		future.result = { returnValue : true };
	});
};

WAZ.XMPP.prototype.onOffline = function() {
	changeLoginState(this.transport.accountId, PalmLoginState.OFFLINE);
	// Marcando cuenta como offline!
};

WAZ.XMPP.prototype.onPresence = function(id, name, status) {
	var phonenumber = "+" + id.split('@')[0];
	if (!name) name = phonenumber;
	if (!status) status = "";
	
	// TODO: How to get the avatar?
	
	// Check for IM_CONTACT_KIND
	var future = DB.find(queryFromAccountId(IM_CONTACT_KIND, this.transport.accountId,
		{"prop" : "remoteId", "op" : "=", "val" : id}));
	future.then(this, function(future) {
		if (future.result.results.length == 0) {
			// Create contact
			var contact = {
				_kind : IM_CONTACT_KIND,
				accountId : this.transport.accountId,
				remoteId : id,
				name : {
					givenName : name
				},
				phoneNumbers : [ {
					value : phonenumber,
					type	: "type_mobile"
				}],
				ims : [ {
					label : "WHATSAPP",
					value : id,
					type : IM_WHATSAPP_TYPE
				}]
			};
			console.log("Creating contact " + id + ": " + JSON.stringify(contact));
			future.nest(DB.put([ contact ]));
		} else {
			future.result = { returnValue : true };
		}
	});
	
	// Check for IM_BUDDYSTATUS_KIND
	future.nest(TempDB.find(queryFromAccountId(IM_BUDDYSTATUS_KIND, this.transport.accountId,
			{"prop" : "username", "op" : "=", "val" : id})).then(this, function(future) {
		if (future.result.results.length == 0) {
			// Create buddy
			var buddy = {
				_kind : IM_BUDDYSTATUS_KIND,
				accountId : this.transport.accountId,
				serviceName : IM_WHATSAPP_TYPE,
				group : "whatsapp",
				username : id,
				presence : id,
				availability : PalmAvailability.ONLINE,
				status : status
			};
			console.log("Creating buddy " + id + ": " + JSON.stringify(buddy));
			future.nest(TempDB.put([ buddy ]));
		} else if (status.length > 0) {
			var buddy = future.result.results[0];
			buddy.status = status;
			buddy.availability = PalmAvailability.ONLINE;
			future.nest(TempDB.merge([ buddy ]));
			
		} else {
			future.result = { returnValue : true };
		}		
	}));
	
	return future;	
}

WAZ.XMPP.prototype.onMessage = function(id, from, name, msg) {
	console.log("onMessage " + id + " - " + from + " - " + name + " - " + msg);
	
	// Check if buddy exists
	var future = this.onPresence(from, name);
	msg = msg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	
	var timestamp = new Date().getTime();
	future.nest(DB.put([{
		_kind : IM_MESSAGE_KIND,
		from : { addr :  from },
		folder : "inbox",
		status : "successful",
		serviceName : IM_WHATSAPP_TYPE,
		timestamp : timestamp,
		localTimestamp : timestamp,
		messageText : msg
	}]).then(this, function(future) {
		
		this.write(WAZ.Messages.XMPP_MESSAGE_RECEIVED({dest : from.split('@')[0], id : id}));
		console.log("Enviando ACK " + from + " - " + id);
		future.result = { returnValue : true };
	}));
	
	this.syncFuture.nest(future);
};


WAZ.XMPP.prototype.onMessageSended = function(id, from) {
	console.log("Confirmación de mensaje enviado " + id + " : " + from);

	this.syncFuture.then(function(future) {
		console.log("Buscando el mensaje para confirmarlo " + id)
		var f = DB.find({
			from : IM_MESSAGE_KIND,
			where : [
			         {prop : "folder", op : "=", val : "outbox"},
			         {prop : "localTimestamp", op : "=", val : parseInt(id) },
			         {prop : "status", op : "=", val : "delayed"}]
		});
		f.then(function(f) {
			if (f.result.results && f.result.results.length > 0) {
				console.log("Encontrado mensajes, marcándolo como confirmado");
				var msg = f.result.results[0];
				msg.status =  "successful";
				msg.ack = false;
				f.nest(DB.merge([ msg ]));
			}
		});
		future.nest(f);
	});
};

WAZ.XMPP.prototype.onMessageAck = function(id, from) {
	console.log("El destinatario ha recibo el mensaje " + id + " " + from);
	this.syncFuture.then(this, function(f) {
		var future = DB.find({
			from : IM_MESSAGE_KIND,
			where : [{prop : "localTimestamp", op : "=", val : parseInt(id) }, {prop : "ack", op : "=", val : false }]
		});
		future.then(this, function(future) {
			if (future.result.results && future.result.results.length > 0) {
				var dest = from.split("@")[0];
				console.log("Enviado ACK " + id + " - " + dest);
				this.write(WAZ.Messages.XMPP_MESSAGE_ACK({id : id, dest : dest }));
				
				console.log("Agregar marca al mensaje ...");
				var msg = future.result.results[0];
				msg.messageText =  "* " + msg.messageText;
				msg.ack = true;
				future.nest(DB.merge([ msg ]));
			}
		});
		f.nest(future);
	});
};
