
var sendMessageAssistant = function(response){};

//Hack to activity works
sendMessageAssistant.prototype.complete = function(activity) {
	return true; 
};

sendMessageAssistant.prototype.run = function(response) {
	var args = this.controller.args;
	console.log("sendMessageAssistant args: " + JSON.stringify(args));

	if (args.$activity && args.$activity.activityId) {
		PalmCall.call("palm://com.palm.activitymanager/",  "complete", {
			activityId : args.$activity.activityId
		});
	}

	// Search for pending messages
	var future = DB.find({
		"from": IM_MESSAGE_KIND,
		"where": [
			{"op":"=","prop":"status","val":"pending"},
			{"op":"=","prop":"folder","val":"outbox"}
			]
	}).then(function (future) {
		// For each message
		for(var i = 0; i < future.result.results.length; i++) {
			var msg = future.result.results[i];
			msg._rev = undefined;
			var username = msg.to[0].addr;
			var query = {
					"from":TRANSPORT_KIND,
					"where": [
				          {"prop" : "username", "op" : "=", "val" : msg.from.addr}
				     ]
				};
			var f = DB.find(query);
			f.then(function(f) {
				console.log(JSON.stringify(f.result));
				if (f.result.results.length > 0) {
					var transport = f.result.results[0];
					// Check loginstate and state
					if (xmpp[transport.accountId]) {
						console.log("XMMP encontrado " + JSON.stringify(msg));
						var dest = msg.to[0].addr.split("@")[0];
						console.log("Enviando mensaje");
						xmpp[transport.accountId].sendMessage(msg.localTimestamp, dest, msg.messageText);
						// Wait for message confirmation from server
						msg.status = "delayed";
					} else {
						// xmpp don't exists!!!!!! Sure to go offline
						f.nest(changeLoginState(transport.accountId, PalmLoginState.OFFLINE, PalmAvailability.OFFLINE));
						msg.status = "failed";
					}
				} else {
					// Establecer estado mensaje mal
					msg.status = "failed";
				}
				f.nest(DB.merge([ msg ]));
			});
			future.nest(f);
		}
		future.result = { returnValue : true };
	});
	
	response.nest(future);
	response.nest(createSendMessageActivity ());
};

function createSendMessageActivity () {
	return PalmCall.call("palm://com.palm.activitymanager/",  "create", {
		"start": true,
		"replace":true,
		"activity": {
			"name": "Whatsapp pending messages watch",
			"description": "Watch for changes to the immessage",
			"type": {
	          	"foreground": true,
	          	"power":true,
	          	"powerDebounce":true,
	          	"explicit":true,
	          	"persist" : true
	        },
	  //       "requirements": {
			//     "internet": true
			// },
	        "trigger": {
				"method": "palm://com.palm.db/watch",
				"key": "fired",
				"params": {
					"subscribe": true,
					"query": {
						"from": "com.palm.whatsapp.immessage:1",
						"where": [
							{"op":"=","prop":"status","val":"pending"},
							{"op":"=","prop":"folder","val":"outbox"}
							]
					}
				}
			},
			"callback": {
				"method": "palm://com.palm.service.whatsapp/sendMessage",
				"params": {}
			}
		}
	});
}
