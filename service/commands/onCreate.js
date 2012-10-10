var onCreateAssistant = function(future) {};

onCreateAssistant.prototype.run = function(response) {  
	var args = this.controller.args;
	console.log("onCreateAssistant args: " + JSON.stringify(args));
	
    // Save the whatsapp configuration
    var transport = {
		_kind : TRANSPORT_KIND,
		"accountId" : args.accountId,
		"username" : args.config.country + "" + args.config.number, 
		"country" : args.config.country,
		"number" : args.config.number,
		"udid" : args.config.udid,
	};
    response.nest(DB.put([transport]));
};

