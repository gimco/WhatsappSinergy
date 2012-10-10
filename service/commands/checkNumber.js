var checkNumberAssistant = function(future) {};

checkNumberAssistant.prototype.run = function(response) {  
	var args = this.controller.args;
	console.log("checkNumberAssistant args: " + JSON.stringify(args));
	
	args.udid = Crypto.MD5.hex_md5(args.udid.split("").reverse().join(""));

	var existUrl = WAZ.Register.EXIST_URL(args);
	console.log("Whatsapp calling: " + existUrl);
	var future = AjaxCall.get(existUrl, { headers : { "User-Agent" : WAZ.Register.USER_AGENT }});
	future.then(function (future) {
		console.log("Whatsapp response: " + JSON.stringify(future.result));
		if (future.result.status == 200) {
			var status = future.result.responseText.match(WAZ.Register.STATUS_REGEXP);
			if (status && status[1] == "ok") {
				future.result = {
						error : false,
						registered : true
				};
			} else if (status) {
				args.token = Crypto.MD5.hex_md5(WAZ.Register.BASE + args.number);
				var requestCodeUrl = WAZ.Register.CODE_URL(args);
				console.log("Whatsapp calling: " + requestCodeUrl);
				future.nest(AjaxCall.get(requestCodeUrl, { headers : { "User-Agent" : WAZ.Register.USER_AGENT }}));
				future.then(function(future) {
					console.log("Whatsapp response: " + JSON.stringify(future.result));
					if (future.result.status == 200) {
						var status = future.result.responseText.match(WAZ.Register.STATUS_REGEXP);
						if (status && status[1] == "ok") {
							future.result = {
									error : false,
									registered : false
							};
						} else if (status) {
							future.result = makeError("Can't register number, server return " + status[1]);
						} else {
							future.result = makeError("Can't register number, unexpected response from server " + future.result.responseText);
						}
					} else {
						future.result = makeError("Can't register number, server return code " + future.result.status);
					}
				});
			} else {
				future.result = makeError("Error checking number, unexpected response from server  " + future.result.responseText);
			}
		} else {
			future.result = makeError("Error checking number, server return code " + future.result.status);
		}
	});

	response.nest(future);
	response.then(function (response) {
		if (response.exception) {
			response.result = makeError("Unexpected error!: " + response.exception.message);
		} else {
			response.result = response.result;
		}
	});
};

