var onCapabilitiesChangedAssistant = function(future) {};

onCapabilitiesChangedAssistant.prototype.run = function(response) {  
	var args = this.controller.args;
	console.log("onCapabilitiesChangedAssistant args: " + JSON.stringify(args));
	
	response.result = { returnValue : true };
};
