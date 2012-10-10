var onDeleteAssistant = function(future) {};

onDeleteAssistant.prototype.run = function(response) {  
	var args = this.controller.args;
	console.log("onDeleteAssistant args: " + JSON.stringify(args));
	
	response.nest(DB.del(queryFromAccountId(TRANSPORT_KIND, args.accountId)));
	response.nest(DB.del(queryFromAccountId(IM_CONTACT_KIND, args.accountId)));
	response.nest(DB.del(queryFromAccountId(IM_LOGINSTATE_KIND, args.accountId)));
	response.nest(TempDB.del(queryFromAccountId(IM_BUDDYSTATUS_KIND, args.accountId)));
};
