var registerNumberAssistant = function(future) {};

registerNumberAssistant.prototype.run = function(response) {  
	var args = this.controller.args;
	console.log("registerNumberAssistant args: " + JSON.stringify(args));

	var registerUrl = WAZ.Register.REGISTER_URL(args);
	console.log("Whatsapp calling: " + registerUrl);
	var future = AjaxCall.get(registerUrl, { headers : { "User-Agent" : WAZ.Register.USER_AGENT }});
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
				future.result = makeError("Can't register number, server return " + status[1]);
			} else {
				future.result = makeError("Can't register number, unexpected response from server " + future.result.responseText);
			}
		} else {
			future.result = makeError("Can't register number, server return code " + future.result.status);
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
