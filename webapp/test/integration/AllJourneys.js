/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"com/baba/ZDSD_TOPUP_CLONE/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/baba/ZDSD_TOPUP_CLONE/test/integration/pages/View1",
	"com/baba/ZDSD_TOPUP_CLONE/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.baba.ZDSD_TOPUP_CLONE.view.",
		autoWait: true
	});
});