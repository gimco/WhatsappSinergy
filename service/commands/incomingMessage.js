
var incomingMessageAssistant = function(future) {};

incomingMessageAssistant.prototype.run = function(response) {  
	var args = this.controller.args;
	console.log("incomingMessageAssistant args: " + JSON.stringify(args));
	
	response.result = { returnValue : true };
};
