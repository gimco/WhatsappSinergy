
var WAZ = {};

//WAZ.CHECK_CONTACTS = "http://localhost/client/iphone/bbq.php";
WAZ.CHECK_CONTACTS = "https://sro.whatsapp.net/client/iphone/bbq.php";

WAZ.Register = {};

//WAZ.Register.URL = "https://r.whatsapp.net";
WAZ.Register.URL = "http://localhost";
WAZ.Register.BASE = "30820332308202f0a00302010202044c2536a4300b06072a8648ce3804030500307c310b3009060355040613025553311330110603550408130a43616c69666f726e6961311430120603550407130b53616e746120436c61726131163014060355040a130d576861747341707020496e632e31143012060355040b130b456e67696e656572696e67311430120603550403130b427269616e204163746f6e301e170d3130303632353233303731365a170d3434303231353233303731365a307c310b3009060355040613025553311330110603550408130a43616c69666f726e6961311430120603550407130b53616e746120436c61726131163014060355040a130d576861747341707020496e632e31143012060355040b130b456e67696e656572696e67311430120603550403130b427269616e204163746f6e308201b83082012c06072a8648ce3804013082011f02818100fd7f53811d75122952df4a9c2eece4e7f611b7523cef4400c31e3f80b6512669455d402251fb593d8d58fabfc5f5ba30f6cb9b556cd7813b801d346ff26660b76b9950a5a49f9fe8047b1022c24fbba9d7feb7c61bf83b57e7c6a8a6150f04fb83f6d3c51ec3023554135a169132f675f3ae2b61d72aeff22203199dd14801c70215009760508f15230bccb292b982a2eb840bf0581cf502818100f7e1a085d69b3ddecbbcab5c36b857b97994afbbfa3aea82f9574c0b3d0782675159578ebad4594fe67107108180b449167123e84c281613b7cf09328cc8a6e13c167a8b547c8d28e0a3ae1e2bb3a675916ea37f0bfa213562f1fb627a01243bcca4f1bea8519089a883dfe15ae59f06928b665e807b552564014c3bfecf492a0381850002818100d1198b4b81687bcf246d41a8a725f0a989a51bce326e84c828e1f556648bd71da487054d6de70fff4b49432b6862aa48fc2a93161b2c15a2ff5e671672dfb576e9d12aaff7369b9a99d04fb29d2bbbb2a503ee41b1ff37887064f41fe2805609063500a8e547349282d15981cdb58a08bede51dd7e9867295b3dfb45ffc6b259300b06072a8648ce3804030500032f00302c021400a602a7477acf841077237be090df436582ca2f0214350ce0268d07e71e55774ab4eacd4d071cd1efadcd635fb758707abfab437734ed8bef94";
WAZ.Register.USER_AGENT = "WhatsApp/2.8.4443 Android/2.3.7 Device/Huawei-U8120";


WAZ.Register.EXIST_URL = _.template(WAZ.Register.URL + "/v1/exist.php?cc=<%=country%>&in=<%=number%>&udid=<%=udid%>&sim=<%=country%><%=number%>");
WAZ.Register.CODE_URL = _.template(WAZ.Register.URL + "/v1/code.php?cc=<%=country%>&to=<%=country%><%=number%>&in=<%=number%>&lg=en&lc=US&mnc=000&mcc=000&method=sms&reason=self-send-not-permitted&token=<%=token%>");
WAZ.Register.REGISTER_URL = _.template(WAZ.Register.URL + "/v1/register.php?cc=<%=country%>&in=<%=number%>&udid=<%=udid%>&code=<%=code%>");
WAZ.Register.STATUS_REGEXP = /.*status=["']([^"']+)["'].*/;

WAZ.Parser = function (event) {
	this.event = event;
	this.element = false;
	this.waitingBytes = 2;
	this.buffer = new Buffer(0);
};

WAZ.Parser.tokens = [];
WAZ.Parser.tokens[0] = "VACIO";
WAZ.Parser.tokens[1] = "stream-start";
WAZ.Parser.tokens[2] = "stream-end";
WAZ.Parser.tokens[3] = null;
WAZ.Parser.tokens[4] = null;
WAZ.Parser.tokens[5] = "1";
WAZ.Parser.tokens[6] = "1.0";
WAZ.Parser.tokens[7] = "ack";
WAZ.Parser.tokens[8] = "action";
WAZ.Parser.tokens[9] = "active";
WAZ.Parser.tokens[10] = "add";
WAZ.Parser.tokens[11] = "all";
WAZ.Parser.tokens[12] = "allow";
WAZ.Parser.tokens[13] = "apple";
WAZ.Parser.tokens[14] = "audio";
WAZ.Parser.tokens[15] = "auth";
WAZ.Parser.tokens[16] = "author";
WAZ.Parser.tokens[17] = "available";
WAZ.Parser.tokens[18] = "bad-request";
WAZ.Parser.tokens[19] = "base64";
WAZ.Parser.tokens[20] = "Bell.caf";
WAZ.Parser.tokens[21] = "bind";
WAZ.Parser.tokens[22] = "body";
WAZ.Parser.tokens[23] = "Boing.caf";
WAZ.Parser.tokens[24] = "cancel";
WAZ.Parser.tokens[25] = "category";
WAZ.Parser.tokens[26] = "challenge";
WAZ.Parser.tokens[27] = "chat";
WAZ.Parser.tokens[28] = "clean";
WAZ.Parser.tokens[29] = "code";
WAZ.Parser.tokens[30] = "composing";
WAZ.Parser.tokens[31] = "config";
WAZ.Parser.tokens[32] = "conflict";
WAZ.Parser.tokens[33] = "contacts";
WAZ.Parser.tokens[34] = "create";
WAZ.Parser.tokens[35] = "creation";
WAZ.Parser.tokens[36] = "default";
WAZ.Parser.tokens[37] = "delay";
WAZ.Parser.tokens[38] = "delete";
WAZ.Parser.tokens[39] = "delivered";
WAZ.Parser.tokens[40] = "deny";
WAZ.Parser.tokens[41] = "DIGEST-MD5";
WAZ.Parser.tokens[42] = "DIGEST-MD5-1";
WAZ.Parser.tokens[43] = "dirty";
WAZ.Parser.tokens[44] = "en";
WAZ.Parser.tokens[45] = "enable";
WAZ.Parser.tokens[46] = "encoding";
WAZ.Parser.tokens[47] = "error";
WAZ.Parser.tokens[48] = "expiration";
WAZ.Parser.tokens[49] = "expired";
WAZ.Parser.tokens[50] = "failure";
WAZ.Parser.tokens[51] = "false";
WAZ.Parser.tokens[52] = "favorites";
WAZ.Parser.tokens[53] = "feature";
WAZ.Parser.tokens[54] = "field";
WAZ.Parser.tokens[55] = "free";
WAZ.Parser.tokens[56] = "from";
WAZ.Parser.tokens[57] = "g.us";
WAZ.Parser.tokens[58] = "get";
WAZ.Parser.tokens[59] = "Glass.caf";
WAZ.Parser.tokens[60] = "google";
WAZ.Parser.tokens[61] = "group";
WAZ.Parser.tokens[62] = "groups";
WAZ.Parser.tokens[63] = "g_sound";
WAZ.Parser.tokens[64] = "Harp.caf";
WAZ.Parser.tokens[65] = "http://etherx.jabber.org/streams";
WAZ.Parser.tokens[66] = "http://jabber.org/protocol/chatstates";
WAZ.Parser.tokens[67] = "id";
WAZ.Parser.tokens[68] = "image";
WAZ.Parser.tokens[69] = "img";
WAZ.Parser.tokens[70] = "inactive";
WAZ.Parser.tokens[71] = "internal-server-error";
WAZ.Parser.tokens[72] = "iq";
WAZ.Parser.tokens[73] = "item";
WAZ.Parser.tokens[74] = "item-not-found";
WAZ.Parser.tokens[75] = "jabber:client";
WAZ.Parser.tokens[76] = "jabber:iq:last";
WAZ.Parser.tokens[77] = "jabber:iq:privacy";
WAZ.Parser.tokens[78] = "jabber:x:delay";
WAZ.Parser.tokens[79] = "jabber:x:event";
WAZ.Parser.tokens[80] = "jid";
WAZ.Parser.tokens[81] = "jid-malformed";
WAZ.Parser.tokens[82] = "kind";
WAZ.Parser.tokens[83] = "leave";
WAZ.Parser.tokens[84] = "leave-all";
WAZ.Parser.tokens[85] = "list";
WAZ.Parser.tokens[86] = "location";
WAZ.Parser.tokens[87] = "max_groups";
WAZ.Parser.tokens[88] = "max_participants";
WAZ.Parser.tokens[89] = "max_subject";
WAZ.Parser.tokens[90] = "mechanism";
WAZ.Parser.tokens[91] = "mechanisms";
WAZ.Parser.tokens[92] = "media";
WAZ.Parser.tokens[93] = "message";
WAZ.Parser.tokens[94] = "message_acks";
WAZ.Parser.tokens[95] = "missing";
WAZ.Parser.tokens[96] = "modify";
WAZ.Parser.tokens[97] = "name";
WAZ.Parser.tokens[98] = "not-acceptable";
WAZ.Parser.tokens[99] = "not-allowed";
WAZ.Parser.tokens[100] = "not-authorized";
WAZ.Parser.tokens[101] = "notify";
WAZ.Parser.tokens[102] = "Offline Storage";
WAZ.Parser.tokens[103] = "order";
WAZ.Parser.tokens[104] = "owner";
WAZ.Parser.tokens[105] = "owning";
WAZ.Parser.tokens[106] = "paid";
WAZ.Parser.tokens[107] = "participant";
WAZ.Parser.tokens[108] = "participants";
WAZ.Parser.tokens[109] = "participating";
WAZ.Parser.tokens[110] = "fail";
WAZ.Parser.tokens[111] = "paused";
WAZ.Parser.tokens[112] = "picture";
WAZ.Parser.tokens[113] = "ping";
WAZ.Parser.tokens[114] = "PLAIN";
WAZ.Parser.tokens[115] = "platform";
WAZ.Parser.tokens[116] = "presence";
WAZ.Parser.tokens[117] = "preview";
WAZ.Parser.tokens[118] = "probe";
WAZ.Parser.tokens[119] = "prop";
WAZ.Parser.tokens[120] = "props";
WAZ.Parser.tokens[121] = "p_o";
WAZ.Parser.tokens[122] = "p_t";
WAZ.Parser.tokens[123] = "query";
WAZ.Parser.tokens[124] = "raw";
WAZ.Parser.tokens[125] = "receipt";
WAZ.Parser.tokens[126] = "receipt_acks";
WAZ.Parser.tokens[127] = "received";
WAZ.Parser.tokens[128] = "relay";
WAZ.Parser.tokens[129] = "remove";
WAZ.Parser.tokens[130] = "Replaced by new connection";
WAZ.Parser.tokens[131] = "request";
WAZ.Parser.tokens[132] = "resource";
WAZ.Parser.tokens[133] = "resource-constraint";
WAZ.Parser.tokens[134] = "response";
WAZ.Parser.tokens[135] = "result";
WAZ.Parser.tokens[136] = "retry";
WAZ.Parser.tokens[137] = "rim";
WAZ.Parser.tokens[138] = "s.whatsapp.net";
WAZ.Parser.tokens[139] = "seconds";
WAZ.Parser.tokens[140] = "server";
WAZ.Parser.tokens[141] = "session";
WAZ.Parser.tokens[142] = "set";
WAZ.Parser.tokens[143] = "show";
WAZ.Parser.tokens[144] = "sid";
WAZ.Parser.tokens[145] = "sound";
WAZ.Parser.tokens[146] = "stamp";
WAZ.Parser.tokens[147] = "starttls";
WAZ.Parser.tokens[148] = "status";
WAZ.Parser.tokens[149] = "stream:error";
WAZ.Parser.tokens[150] = "stream:features";
WAZ.Parser.tokens[151] = "subject";
WAZ.Parser.tokens[152] = "subscribe";
WAZ.Parser.tokens[153] = "success";
WAZ.Parser.tokens[154] = "system-shutdown";
WAZ.Parser.tokens[155] = "s_o";
WAZ.Parser.tokens[156] = "s_t";
WAZ.Parser.tokens[157] = "t";
WAZ.Parser.tokens[158] = "TimePassing.caf";
WAZ.Parser.tokens[159] = "timestamp";
WAZ.Parser.tokens[160] = "to";
WAZ.Parser.tokens[161] = "Tri-tone.caf";
WAZ.Parser.tokens[162] = "type";
WAZ.Parser.tokens[163] = "unavailable";
WAZ.Parser.tokens[164] = "uri";
WAZ.Parser.tokens[165] = "url";
WAZ.Parser.tokens[166] = "urn:ietf:params:xml:ns:xmpp-bind";
WAZ.Parser.tokens[167] = "urn:ietf:params:xml:ns:xmpp-sasl";
WAZ.Parser.tokens[168] = "urn:ietf:params:xml:ns:xmpp-session";
WAZ.Parser.tokens[169] = "urn:ietf:params:xml:ns:xmpp-stanzas";
WAZ.Parser.tokens[170] = "urn:ietf:params:xml:ns:xmpp-streams";
WAZ.Parser.tokens[171] = "urn:xmpp:delay";
WAZ.Parser.tokens[172] = "urn:xmpp:ping";
WAZ.Parser.tokens[173] = "urn:xmpp:receipts";
WAZ.Parser.tokens[174] = "urn:xmpp:whatsapp";
WAZ.Parser.tokens[175] = "urn:xmpp:whatsapp:dirty";
WAZ.Parser.tokens[176] = "urn:xmpp:whatsapp:mms";
WAZ.Parser.tokens[177] = "urn:xmpp:whatsapp:push";
WAZ.Parser.tokens[178] = "value";
WAZ.Parser.tokens[179] = "vcard";
WAZ.Parser.tokens[180] = "version";
WAZ.Parser.tokens[181] = "video";
WAZ.Parser.tokens[182] = "w";
WAZ.Parser.tokens[183] = "w:g";
WAZ.Parser.tokens[184] = "w:p:r";
WAZ.Parser.tokens[185] = "wait";
WAZ.Parser.tokens[186] = "x";
WAZ.Parser.tokens[187] = "xml-not-well-formed";
WAZ.Parser.tokens[188] = "xml:lang";
WAZ.Parser.tokens[189] = "xmlns";
WAZ.Parser.tokens[190] = "xmlns:stream";
WAZ.Parser.tokens[191] = "Xylophone.caf";
WAZ.Parser.tokens[192] = "account";
WAZ.Parser.tokens[193] = "digest";
WAZ.Parser.tokens[194] = "g_notify";
WAZ.Parser.tokens[195] = "method";
WAZ.Parser.tokens[196] = "password";
WAZ.Parser.tokens[197] = "registration";
WAZ.Parser.tokens[198] = "stat";
WAZ.Parser.tokens[199] = "text";
WAZ.Parser.tokens[200] = "user";
WAZ.Parser.tokens[201] = "username";
WAZ.Parser.tokens[202] = "event";
WAZ.Parser.tokens[203] = "latitude";
WAZ.Parser.tokens[204] = "longitude";
WAZ.Parser.tokens[205] = "true";
WAZ.Parser.tokens[206] = "after";
WAZ.Parser.tokens[207] = "before";
WAZ.Parser.tokens[208] = "broadcast";
WAZ.Parser.tokens[209] = "count";
WAZ.Parser.tokens[210] = "features";
WAZ.Parser.tokens[211] = "first";
WAZ.Parser.tokens[212] = "index";
WAZ.Parser.tokens[213] = "invalid-mechanism";
WAZ.Parser.tokens[214] = "last";
WAZ.Parser.tokens[215] = "max";
WAZ.Parser.tokens[216] = "offline";
WAZ.Parser.tokens[217] = "proceed";
WAZ.Parser.tokens[218] = "required";
WAZ.Parser.tokens[219] = "sync";
WAZ.Parser.tokens[220] = "elapsed";
WAZ.Parser.tokens[221] = "ip";
WAZ.Parser.tokens[222] = "microsoft";
WAZ.Parser.tokens[223] = "mute";
WAZ.Parser.tokens[224] = "nokia";
WAZ.Parser.tokens[225] = "off";
WAZ.Parser.tokens[226] = "pin";
WAZ.Parser.tokens[227] = "pop_mean_time";
WAZ.Parser.tokens[228] = "pop_plus_minus";
WAZ.Parser.tokens[229] = "port";
WAZ.Parser.tokens[230] = "reason";
WAZ.Parser.tokens[231] = "server-error";
WAZ.Parser.tokens[232] = "silent";
WAZ.Parser.tokens[233] = "timeout";
WAZ.Parser.tokens[234] = "lc";
WAZ.Parser.tokens[235] = "lg";
WAZ.Parser.tokens[236] = "bad-protocol";
WAZ.Parser.tokens[237] = "none";
WAZ.Parser.tokens[238] = "remote-server-timeout";
WAZ.Parser.tokens[239] = "service-unavailable";
WAZ.Parser.tokens[240] = "w:p";
WAZ.Parser.tokens[241] = "w:profile:picture";
WAZ.Parser.tokens[242] = "notification";



WAZ.Parser.prototype.parse = function (data) {
	// Add data to the buffer
	var newbuffer = new Buffer(this.buffer.length + data.length);
	this.buffer.copy(newbuffer, 0);
	data.copy(newbuffer, this.buffer.length);
	this.buffer = newbuffer;
	
	// Process elements
	while (this.buffer.length >= this.waitingBytes) {
		if (!this.element) {
			this.waitingBytes = this.readSize(true);
		} else {
			this.readElement(true);
			this.waitingBytes = 2;
		}
		this.element = !this.element;
	}
};

WAZ.Parser.prototype.read = function () {
	var data = this.buffer[0]; 
	this.buffer = this.buffer.slice(1, this.buffer.length)
	return data;
};

WAZ.Parser.prototype.readSize = function (big) {
	var size = this.read();
	if (big) {
		size = (size << 8) + this.read();
	}
	return size;
};


WAZ.Parser.prototype.readElement = function (tag)  {
	var big = true;
	var type = this.read();
	switch (type) {
	case 0xF8:
		big = false;
	case 0xF9:
		var size = this.readSize(big);
		if (tag) {
			var empty = size % 2 == 1;
			size = Math.floor((size - 1) / 2);
			var tag = this.readElement(false);
			var attrs = {};
			for (; size > 0; size--) {
				attrs[this.readElement(false)] = this.readElement(false);
			}
			this.event.startElement(tag, attrs);
			
			if (!empty) {
				this.readElement(false);
			}

			this.event.endElement(tag);
		} else {
			for(; size > 0; size--) {
				this.readElement(true);
			}
		}
		break;
		
	case 0xFA:
		return this.readElement(false) + "@" + this.readElement(false);

	case 0xFC:
		big = false;
	case 0xFD:
		var size = this.readSize(big);
		var text = this.buffer.slice(0, size).toString();
		this.event.characters(text);
		this.buffer = this.buffer.slice(size, this.buffer.length);
		return text;
		
	case 0xFE:
		return WAZ.Parser.tokens[this.read() + 245];

	default:
		return WAZ.Parser.tokens[type];
	}
};

WAZ.Messages = {};

WAZ.Messages.template = function (template) {
	return function (objs) {
		var parts = template.split(/[#}]/);
		var buffers = [];
		var size = 0;
		for(var i = 0; i < parts.length; i++) {
			if (parts[i][0] == "{") {
				var txt = objs[parts[i].substring(1)].toString();
				var pos = txt.length > 255 ? 3 : 2
				var buffer = new Buffer(pos + txt.length);
				if (pos == 2) {
					buffer[0] = 0xFC;
					buffer[1] = txt.length;
				} else {
					buffer[0] = 0xFD;
					buffer[1] = txt.length >> 8;
					buffer[2] = txt.length & 0xFF;
				}
				buffer.write(txt, pos);
				buffers.push(buffer);
				size += buffer.length;
			} else if (parts[i].length > 0) {
				var buffer = new Buffer(WAZ.Messages.b64len(parts[i]));
				buffer.base64Write(parts[i]);
				buffers.push(buffer)
				size += buffer.length;
			}
		}
		var buffer = new Buffer(size + 2);
		buffer[0] = size >> 8;
		buffer[1] = size & 0xFF;

		size = 2;
		for (i = 0; i < buffers.length; i++) {
			buffers[i].copy(buffer, size)
			size += buffers[i].length;
		}
		return buffer;
	};
};

WAZ.Messages.b64len = function (b64) {
	var len = 3 * (b64.length / 4);
	if (b64[b64.length - 1] == "=") len--;
	if (b64[b64.length - 2] == "=") len--;
	return len;
};

WAZ.Messages.XMPP_HELLO = "WA\1\1";

//<stream-start to="s.whatsapp.net" resource="Android-2.6.8879" />
WAZ.Messages.XMPP_STREAM = WAZ.Messages.template("+AUBoIqE#{clientid}")({clientid : "Android-2.6.8879"}); 

//<stream:features><receipt_acks /></stream:features>
WAZ.Messages.XMPP_FEATURES = WAZ.Messages.template("+AKW+AH4AX4=")();


//<auth xmlns="urn:ietf:params:xml:ns:xmpp-sasl" mechanism="DIGEST-MD5-1" />
WAZ.Messages.XMPP_AUTH = WAZ.Messages.template("+AUPvadaKg==")();

WAZ.Messages.XMPP_RESPONSE_TEMPLATE = _.template("realm=\"s.whatsapp.net\",response=<%=response%>,nonce=\"<%=nonce%>\",digest-uri=\"xmpp/s.whatsapp.net\",cnonce=\"<%=cnonce%>\",qop=auth,username=\"<%=username%>\",nc=00000001");
WAZ.Messages.XMPP_RESPONSE = function(obj) { // challenge, imei, username
	var nonce = Base64.decode(obj.challenge).match(/^nonce="([^"]+)"/)[1];
	var cnonce = Math.random().toString(36).substring(9);
	
	var password = Crypto.MD5.hex_md5(obj.imei.split("").reverse().join(""));
	console.log(password);
	// Si se suplanta el IMEI y se activó en NokiaS40 cambiar el calculo:
//	password = password.replace(/../g, function(s) {
//		var n = parseInt(s, 16);
//		if (n > 128) {
//			n = -1 - (n ^ 0xFF); 
//		}
//		n += 128;
//		return n.toString(16); 
//	});
	
	var p1 = Crypto.MD5.b64_md5(obj.username + ":s.whatsapp.net:" + password) //);
	var p2 = ':'+nonce+':'+cnonce;
	var p3 = new Buffer(16 + p2.length);
	p3.base64Write(p1);
	p3.write(p2, 16);
	p3.charCodeAt = function(i) { return this[i]}
	p3 = Crypto.MD5.hex_md5(p3);
	
	var p4 = Crypto.MD5.hex_md5("AUTHENTICATE:xmpp/s.whatsapp.net");
	password = p3 + ":" + nonce + ":00000001:" + cnonce + ":auth:" + p4
	response = Crypto.MD5.hex_md5(password);
	
	response = WAZ.Messages.XMPP_RESPONSE_TEMPLATE({ response : response, nonce : nonce, cnonce : cnonce, username : obj.username });
	response = Base64.encode(response);
	
	return WAZ.Messages.template("+ASGvac=#{response}")({response:response});
};

//<presence type="unvailable" name="bruno" />
WAZ.Messages.XMPP_PRESENCE_UNVAILABLE = WAZ.Messages.template("+AV0oqNh#{name}");

//<iq id="1" type="get"><query xmlns="jabber:iq:privacy"><list name="default" /></query></iq>
WAZ.Messages.XMPP_PRIVACY = WAZ.Messages.template("+AZIQwWiOvgB+AR7vU34AfgDVWEk")();

//<iq id="2" type="get" to="s.whatsapp.net"><config xmlns="urn:xmpp:whatsapp:push" /></iq>
WAZ.Messages.XMPP_PUSH = WAZ.Messages.template("+AhIQ/wBMqI6oIr4AfgDH72x")();

//<presence type="available" />
WAZ.Messages.XMPP_PRESENCE_AVAILABLE = WAZ.Messages.template("+AN0ohE=")();

//<presence type="subscribe" to="34661043897@s.whatsapp.net"></presence>
WAZ.Messages.XMPP_PRESENCE_SUBSCRIBE = WAZ.Messages.template("+AV0opig+g==#{dest}ig==");

//<iq id="3" type="get" to="34661043897@s.whatsapp.net"><query xmlns="jabber:iq:last" /></iq>
WAZ.Messages.XMPP_QUERY_LAST = WAZ.Messages.template("+AhIQw==#{id}ojqg+g==#{dest}ivgB+AN7vUw=");

//<message to="3466043897@s.whatsapp.net" type="chat" id="1326374195-2">
//<x xmlns="jabber:x:event"><server /></x>
//<body>Ya he descrifado el protocolo jua jua jua jua</body>
//</message>
WAZ.Messages.XMPP_MESSAGE = WAZ.Messages.template("+AhdoPo=#{dest}iqIbQw==#{id}+AL4BLq9T/gB+AGM+AIW#{txt}");
		
//<message to="34661043897@s.whatsapp.net" type="chat" id="1326374195-1">
//<ack xmlns="urn:xmpp:receipts" type="delivered" />
//</message>
WAZ.Messages.XMPP_MESSAGE_ACK = WAZ.Messages.template("+AhdoPo=#{dest}iqIbQw==#{id}+AH4BQe9raIn");

//<message "to="34661375934@s.whatsapp.net" type":"chat" id":"1326365085-8">
//<received "xmlns":"urn:xmpp:receipts" />
//</message>
WAZ.Messages.XMPP_MESSAGE_RECEIVED = WAZ.Messages.template("+AhdoPo=#{dest}iqIbQw==#{id}+AH4A3+9rQ==");

