function CheckAssistant(template) {
	this.template = template.initialTemplate; 
	this.model = {
		country : "",
		number : "",
		udid : ""
	};
};

CheckAssistant.prototype.setup = function() {
	
	this.buttonAttributes = {
		disabledProperty: 'disabled',
		labelProperty: 'label',
		type: Mojo.Widget.activityButton
	};
	this.buttonModel = {
		label : "Confirm",
		disabled : false
	};
	
	this.controller.setupWidget('country', { label: "Country", choices: WHATSAPP_COUNTRY_LIST, modelProperty : "country"}, this.model);
	this.controller.setupWidget('number', { modelProperty : "number" }, this.model);
	this.controller.setupWidget('confirmButton', this.buttonAttributes, this.buttonModel);
	
	this.confirm = this.confirm.bind(this);
	this.controller.listen('confirmButton', Mojo.Event.tap, this.confirm);
};

CheckAssistant.prototype.activate = function(ok) {
	this.buttonModel.disabled = false;
	this.buttonModel.label = "Confirm";
	this.controller.modelChanged(this.buttonModel);
	this.controller.get("confirmButton").mojo.deactivate();

	if (ok == undefined) return;
	// If model filled, call confirm
	if (ok) {
		this.confirm();
	} else {
		// Error on registering!
	}
};

CheckAssistant.prototype.confirm = function(event) {
//	this.controller.get("spinner").mojo.start();
	this.buttonModel.disabled = true;
	this.buttonModel.label = "Checking number";
	this.controller.modelChanged(this.buttonModel);
	this.controller.get("confirmButton").mojo.activate();
	
	// Calculate a udid
	var future = PalmCall.call("palm://com.palm.preferences/systemProperties", "Get",
			{"key":"com.palm.properties.nduid"}).then(this, function(future){
		if(future.result.returnValue) {
			this.model.udid = Crypto.MD5.hex_md5(future.result["com.palm.properties.nduid"]);
			
			future.nest(PalmCall.call("palm://com.palm.service.whatsapp", "checkNumber", this.model));
		}
	});
	future.then(this, function(future) {
		if (future.result.returnValue && !future.result.error && future.result.registered) {
			var result = {
				template : this.template, //template.initialTemplate,
				defaultResult : {
					result : {
						config : this.model,
						returnValue : true
					}
				},
				username : this.model.country + this.model.number
			}
			this.controller.stageController.popScene(result);			
		} else if (future.result.returnValue && !future.result.error && !future.result.registered) {
			this.controller.stageController.pushScene("register", this.model);
		} else {
			this.buttonModel.disabled = false;
			this.buttonModel.label = "Confirm";
			this.controller.modelChanged(this.buttonModel);
			this.controller.get("confirmButton").mojo.deactivate();

			var errorMsg = "Unexpected error";
			if (future.result.error) {
				errorMsg = future.result.errorMsg;
			}
			
			this.controller.showAlertDialog({
				title: "Error",
				message: errorMsg,
				onChoose: function(o) {},
				choices: [
				    {label: $L("Ok"), value:"ok", type:'affirmative'}
				]
			});
		}
	});
};

