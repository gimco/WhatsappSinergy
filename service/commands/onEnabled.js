var onEnabledAssistant = function(future) {
};

onEnabledAssistant.prototype.run = function(response) {
	var args = this.controller.args;
	console.log("onEnabledAssistant args: " + JSON.stringify(args));

	if (args.enabled) {
		var future = DB.find(queryFromAccountId (TRANSPORT_KIND, args.accountId));
		future.then(function(future) {
			var transport = future.result.results[0];

			loginStates[args.accountId] = {
				"_kind" : IM_LOGINSTATE_KIND,
				"accountId" : args.accountId,
				"serviceName" : IM_WHATSAPP_TYPE,
				"state" : PalmLoginState.OFFLINE,
				"availability" : PalmAvailability.ONLINE
			};
			return DB.put([ loginStates[args.accountId] ]);
		});
		response.nest(future);
	} else {
		loginStates[args.accountId] = null;
		response.nest(TempDB.del(queryFromAccountId(IM_BUDDYSTATUS_KIND, args.accountId)));
		response.nest(DB.del(queryFromAccountId(IM_CONTACT_KIND, args.accountId)));
		response.nest(DB.del(queryFromAccountId(IM_LOGINSTATE_KIND, args.accountId)));
	}
};
