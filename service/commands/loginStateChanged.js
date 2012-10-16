var loginStateChangedAssistant = function(future) {};

loginStateChangedAssistant.prototype.complete = function(activity) {
	return true;
};

loginStateChangedAssistant.prototype.run = function(response) {
	var args = this.controller.args;
	console.log("loginStateChangedAssistant args: " + JSON.stringify(args));

	if (args.$activity && args.$activity.activityId) {
		PalmCall.call("palm://com.palm.activitymanager/",  "complete", {
			activityId : args.$activity.activityId
		});
	}

	var loginState = {};
	var transport = {};
	
	var future = DB.find({"from" : IM_LOGINSTATE_KIND});
	future.then(function (future) {
		if (future.result.results && future.result.results.length <= 0) {
			future.result = { returnValue : false };
			return;
		}
		console.log(JSON.stringify(future.result));
		// TODO: Here we're only get the first result ...
		loginState = future.result.results[0];

		future.nest(DB.find(queryFromAccountId(TRANSPORT_KIND, loginState.accountId)));
		// Analyze loginstate changes
		future.then(function (future) {
			transport = future.result.results[0];

			// Update the loginState cached.
			var oldLoginState = loginStates[loginState.accountId] || {availability:null,state:null};
			loginStates[loginState.accountId] = loginState;
			
			// Create XMPP object if necesary. We can recover the object by accoundId and by username
			xmpp[loginState.accountId] = xmpp[loginState.accountId] || new WAZ.XMPP(transport);
			
			// what's happened?
			if (loginState.state == PalmLoginState.OFFLINE
					&& loginState.availability != PalmAvailability.OFFLINE
					&& loginState.availability != PalmAvailability.NO_PRESENCE
				||
				oldLoginState.state == null && loginState.state != PalmLoginState.OFFLINE) {
				
				console.log("Needs to login");
				xmpp[loginState.accountId].login();
				
			} else if (loginState.state != PalmLoginState.OFFLINE
					&& loginState.availability == PalmAvailability.OFFLINE) {
				
				console.log("Needs to logout");
				xmpp[loginState.accountId].logout();
				
//		} else if (loginState.state == PalmLoginState.GETTING_BUDDIES
//				&& loginState.availability != PalmAvailability.OFFLINE
//				&& loginState.availability != PalmAvailability.NO_PRESENCE
//				&& (oldLoginState.state == PalmLoginState.OFFLINE 
//						|| oldLoginState.state == PalmLoginState.LOGGING_ON)) {
//			
//			console.log("Needs to get buddies");
				
			} else if (loginState.availability != oldLoginState.availability) {
				
				console.log("Availability changed");
				
			} else if (loginState.customMessage != oldLoginState.customMessage) {
				console.log("Status message changed!");
				//tuenti.setStatus(transport.sessionId, loginState.customMessage);
			}
			
			// Recreate activity
			future.nest(createLoginStateActivity(loginState));
		});
	});

	response.nest(future);
	return;
};

function createLoginStateActivity(loginState) {
	 var f = DB.find(queryFromAccountId (IM_LOGINSTATE_KIND, loginState.accountId));
	 f.then(function(f) {
	 	var rev = f.result.results[0]._rev;
		f.nest(PalmCall.call("palm://com.palm.activitymanager/",  "create", {
			"start": true,
			"replace" : true,
			"activity": {
				"name": "Whatsapp loginstate",
				"description": "Watch for changes to the imloginstate",
				"type": {
		          	"explicit":true,
		          	"power":true,
		          	"foreground": true,
		          	"persist" : true
		        },
//		        "requirements": {
//		        	"internet":true
//		        },
				"trigger": {
					"method": "palm://com.palm.db/watch",
					"key": "fired",
					"params": {
						"subscribe": true,
						"query": {
							"from": IM_LOGINSTATE_KIND,
							"where": [{"prop":"_rev","op": ">","val":rev}]
						}
					}
				},
				"callback": {
					"method": "palm://com.palm.service.whatsapp/loginStateChanged",
					"params": {}
				}
			}
		}));
	});
	return f;
}
