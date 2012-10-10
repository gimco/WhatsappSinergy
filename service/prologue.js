// Needed by whatsappXMMP
if (typeof require === "undefined") {
	require = IMPORTS.require;
}
var net = require("net");

var Foundations = IMPORTS.foundations;
var AjaxCall = Foundations.Comms.AjaxCall;
var PalmCall = Foundations.Comms.PalmCall;
PalmCall.setup();
var Crypto = IMPORTS["foundations.crypto"];
var xml2json = IMPORTS["foundations.xml"].xml2json;
var DB = Foundations.Data.DB;
var TempDB = Foundations.Data.TempDB;
var Future = Foundations.Control.Future;
var _ = IMPORTS.underscore._;


var PalmAvailability = {
	ONLINE : 0,
	MOBILE : 1,
	IDLE : 2, // Also BUSY
	INVISIBLE : 3,
	OFFLINE : 4,
	PENDING : 5,
	NO_PRESENCE : 6
};

var PalmLoginState = {
	OFFLINE : "offline",
	LOGGING_ON : "logging-on",
	GETTING_BUDDIES : "retrieving-buddies",
	ONLINE : "online",
	LOGGING_OFF : "logging-off"
};

var PALM_PERSON = "com.palm.person:1";
var TRANSPORT_KIND = "com.palm.whatsapp.transport:1";
var IM_CONTACT_KIND = "com.palm.whatsapp.imcontact:1";
var IM_LOGINSTATE_KIND = "com.palm.whatsapp.imloginstate:1";
var IM_MESSAGE_KIND = "com.palm.whatsapp.immessage:1";
var IM_BUDDYSTATUS_KIND = "com.palm.whatsapp.imbuddystatus:1";
var IM_WHATSAPP_TYPE = "type_whatsapp";
//
var loginStates = [];
var xmpp = [];

