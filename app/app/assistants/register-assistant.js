function RegisterAssistant(model) {
	this.model = model;
	this.model.code = "";
}

RegisterAssistant.prototype.setup = function() {
	
	this.buttonAttributes = {
		disabledProperty: 'disabled',
		labelProperty: 'label',
		type: Mojo.Widget.activityButton
	};
	this.buttonModel = {
		label : "Confirm",
		disabled: false
	};
	
	this.controller.setupWidget('code', { modelProperty : "code" }, this.model);
	this.controller.setupWidget('confirmButton', this.buttonAttributes, this.buttonModel);
	
	this.confirm = this.confirm.bind(this);
	this.controller.listen('confirmButton', Mojo.Event.tap, this.confirm);
};

RegisterAssistant.prototype.confirm = function(event) {
	this.buttonModel.disabled = true;
	this.buttonModel.label = "Registering";
	this.controller.modelChanged(this.buttonModel);
	this.controller.get("confirmButton").mojo.activate();

	var future = PalmCall.call("palm://com.palm.service.whatsapp", "registerNumber", this.model);
	future.then(this, function (future) {
		this.controller.stageController.popScene(future.result.registered);
	});
};
