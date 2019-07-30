sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/Dialog"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, Dialog) {
	"use strict";

	return Controller.extend("com.baba.dsd.topupZDSD_TOPUP.controller.Main", {
		//it will call on first hit 
		onInit: function () {
			//	var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSD_TOPUP_SRV/");
			var oModel = new JSONModel();
			var oTable = this.getView().byId("tab");
			oTable.setModel(oModel);

			var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSDO_TOPUP_SRV/", true);

			// keeps the search state
			this._aTableSearchState = [];
			// Model used to manipulate control states
			// var oViewModel = new JSONModel({
			// 	worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
			// 	shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
			// 	shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
			// 	shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
			// 	tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
			// 	tableBusyDelay: 0
			// });
			var oViewModel = new JSONModel();
			this.getView().setModel(oViewModel, "worklistView");

			this.getView().byId("oSelect").setModel(oModel1);
			this.byId("DATE").setDateValue(new Date());
			this.oSearchField = this.getView().byId("NMATNR");

			// Get User ID
			if (sap.ushell.Container) {
				this.sUser = sap.ushell.Container.getService("UserInfo").getId();
			}
			if (this.sUser) {
				this.byId("oSelect").setSelectedKey(this.sUser);
			}
		},

		onAddS: function (oEvent) { //sear by Material dialog
			var that = this;
			var oView = that.getView();

			var oTable = that.getView().byId("tab");
			// Get the table Model
			var oModel = oTable.getModel();
			// Get Items of the Table
			var aItems = oTable.getItems(oModel); //All rows  

			if (aItems.length <= 0) {
				sap.m.MessageToast.show("No data in the list");

			} else {

				var oDialog = oView.byId("MDialog");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(oView.getId(), "com.baba.dsd.topupZDSD_TOPUP.view.MDialog", this);
					// connect dialog to view (models, lifecycle)
					oView.addDependent(oDialog);
				}
				oDialog.setTitle("Add/Search Material");
				oDialog.open(that);
			}

		},

		onNew: function () {
			var that = this;

			var bname = that.getView().byId("oSelect").getSelectedKey();
			var date = that.getView().byId("DATE").getValue();

			if (bname === "" || date === "") {
				sap.m.MessageToast.show("Route user or date can not be blank");
			} else {
				var oView = that.getView();
				var oDialog = oView.byId("MulDialog");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(oView.getId(), "com.baba.dsd.topupZDSD_TOPUP.view.MulDialog", this);
					// connect dialog to view (models, lifecycle)
					oView.addDependent(oDialog);
				}

				var oBusy = new sap.m.BusyDialog();
				that.onBusyS(oBusy);

				var oModelt = new JSONModel();
				this.getView().byId("table1").setModel(oModelt);

				var oModel = that.getView().byId("table1").getModel();
				var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSDO_TOPUP_SRV/", true);
				var itemData = oModel.getProperty("/data");
				var data;
				oModel.setData({
					modelData: data
				});

				//************************filter Date*******************************************//

				var PLFilters = [];
				var dateFormatc = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyyMMdd"
				});

				var oDatec = dateFormatc.format(new Date(date));

				// bname = "'"+bname+"'";
				// oDatec = "'"+oDatec+"'";

				PLFilters.push(new sap.ui.model.Filter({
					path: "KUNNR",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: bname
				}));

				PLFilters.push(new sap.ui.model.Filter({
					path: "DATE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: oDatec
				}));

				oModel1.read("/SOLISTSet", {
					filters: PLFilters,
					success: function (oData, oResponse) {
						var res = [];
						res = oData.results;

						if (res.length > 0) {
							for (var iRowIndex = 0; iRowIndex < res.length; iRowIndex++) {
								var itemRow = {
									VBELN: res[iRowIndex].VBELN,
									ERNAM: res[iRowIndex].ERNAM,
									ERDAT: res[iRowIndex].ERDAT,
									ERZET: res[iRowIndex].ERZET
								};

								if (typeof itemData !== "undefined" && itemData.length > 0) {
									itemData.push(itemRow);
								} else {
									itemData = [];
									itemData.push(itemRow);
								}

							}
						}

						// // Set Model
						oModel.setData({
							data: itemData
						});
						oModel.refresh(true);
						// Reset table selection in UI5
						that.onBusyE(oBusy);
						//************************get values from backend based on filter Date*******************************************//

						oDialog.setTitle("Existing Requests");
						oDialog.open();

					},
					error: function (oResponse) {
						// var oMsg = JSON.parse(oResponse.responseText);
						// jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageToast.show("No Stock Order Found");
						that.onBusyE(oBusy);
					}
				});

			}

		},

		handleClose: function () {
			var that = this;
			that.byId("MulDialog").destroy();

		},

		onMCloseDialog: function () {
			var that = this;
			// var oTable = this.byId("table");
			// oTable.getBinding("items").refresh();
			var MAXLOAD1 = that.getView().byId("MAX_LOAD1").getValue();
			that.getView().byId("MAX_LOAD").setValue(MAXLOAD1);

			that.onCal(3);
			that.byId("MDialog").destroy();
		},

		onClr: function (event) {
			var that = this;
			//************************set blank values to table*******************************************//
			var oModel = that.getView().byId("tab").getModel();
			var data;
			var noData = oModel.getProperty("/data");
			oModel.setData({
				modelData: noData
			});
			oModel.setData({
				modelData: data
			});
			that.getView().byId("TOUR").setValue();
			that.getView().byId("CUMWT1").setValue();
			that.getView().byId("SUMCAR").setValue();
			that.getView().byId("SUMPC").setValue();
			that.getView().byId("MAX_LOAD").setValue();
			that.getView().byId("MAX_LOAD1").setValue();
			//************************set blank values to table*******************************************//
		},

		onSearch: function (event) {
			var item = event.getParameter("suggestionItem");
			if (item) {
				sap.m.MessageToast.show(item.getText() + " selected");
			}

			var input1 = item.getText().split(" - ");
			var input = input1[0];

			var flg = "";
			var oTable = this.byId("tab");
			var oModel = oTable.getModel();
			var aItems = oModel.oData.data; //All rows  

			if (input !== "") {
				if (aItems === undefined) {
					sap.m.MessageToast.show("No Item to search");
				} else {
					for (var iRowIndex1 = 0; iRowIndex1 < aItems.length; iRowIndex1++) {
						if (aItems[iRowIndex1].MATNR === input) {
							flg = "X";
							break;
						}
					}
				}

				if (flg === "X") {
					// this.getView().byId("NMATNR").setValue(input);
					var aTableSearchState = [];
					var sQuery = input; //oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("MATNR", FilterOperator.Contains, sQuery)];
						//new Filter("MATNR", FilterOperator.Contains, sQuery.toUpperCase())
					}
					this._applySearch(aTableSearchState);
				} else {
					sap.m.MessageToast.show("Item doesn't exit in list");
				}
			} else {
				sQuery = input; //oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("MATNR", FilterOperator.Contains, sQuery)];
					//new Filter("MATNR", FilterOperator.Contains, sQuery.toUpperCase())
				}
				this._applySearch(aTableSearchState);
			}
		},

		onSuggest: function (event) {
			//////add
			var oView = this.getView();
			oView.setModel(this.oModel);
			this.oSearchField = oView.byId("searchField");
			//////add

			var sQuery = event.getParameter("suggestValue");
			var aFilters = [];
			if (sQuery) {
				aFilters = new Filter({
					filters: [
						new Filter("MATNR", FilterOperator.Contains, sQuery),
						new Filter("MATNR", FilterOperator.Contains, sQuery.toUpperCase()),
						new Filter("MAKTX", FilterOperator.Contains, sQuery),
						new Filter("MAKTX", FilterOperator.Contains, sQuery.toUpperCase())

					],
					and: false
				});
			}

			this.oSearchField.getBinding("suggestionItems").filter(aFilters);
			this.oSearchField.suggest();
		},

		onBusyS: function (oBusy) {
			oBusy.open();
			oBusy.setBusyIndicatorDelay(40000);
		},

		onBusyE: function (oBusy) {
			oBusy.close();
		},

		onDate: function (oControlEvent) {
			var that = this;
			//var value = oControlEvent.getSource().getProperty('value');
			// var value = that.getView().byId("DATE")._lastValue;

			this._refreshList(oControlEvent);

			var value = this.getView().byId("DATE")._lastValue;

			var user = that.getView().byId("oSelect").getSelectedKey();

			if (value === "" || user === "") {
				sap.m.MessageToast.show("Date and User is required");
			} else {

				//date format
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyyMMdd"
				});
				var ovalue = dateFormat.format(new Date(value));
				//date format

				//sap.ui.core.BusyIndicator.show(400);
				var oBusy = new sap.m.BusyDialog();
				that.onBusyS(oBusy);

				//************************set blank values to table*******************************************//
				var oTable = that.getView().byId("tab");
				var oModel = that.getView().byId("tab").getModel();
				var data;
				var noData = oModel.getProperty("/data");
				oModel.setData({
					modelData: noData
				});
				oModel.setData({
					modelData: data
				});
				that.getView().byId("TOUR").setValue();
				// oTable.setModel(oModel);
				// oModel.refresh(true);
				//************************set blank values to table*******************************************//

				//************************get values from backend based on filter Date*******************************************//
				var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSDO_TOPUP_SRV/", true);
				that.getView().setModel(oModel1);
				var itemData = oModel.getProperty("/data");

				//************************filter Date*******************************************//
				var PLFilters = [];
				PLFilters.push(new sap.ui.model.Filter({
					path: "DATE",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: ovalue
				}));
				PLFilters.push(new sap.ui.model.Filter({
					path: "UNAME",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: user
				}));

				oModel1.read("/InputSet", {
					filters: PLFilters,
					success: function (oData, oResponse) {
						var res = [];
						var CUMWT1 = 0;
						res = oData.results;

						if (res.length > 0) {
							for (var iRowIndex = 0; iRowIndex < res.length; iRowIndex++) {
								var itemRow = {
									MATNR: res[iRowIndex].MATNR,
									UOM: res[iRowIndex].UOM,
									MAKTX: res[iRowIndex].MAKTX,
									WEIGHT_PER_UOM: res[iRowIndex].WEIGHT_PER_UOM,
									CUMWT: res[iRowIndex].CUMWT,
									QUAN_VANO: res[iRowIndex].QUAN_VAN,
									QUAN_VAN: res[iRowIndex].QUAN_VAN,
									QUAN_TOP: res[iRowIndex].QUAN_TOP,
									QUAN_TARGET: res[iRowIndex].QUAN_TARGET
								};

								CUMWT1 = CUMWT1 + Number(res[iRowIndex].WEIGHT);

								if (iRowIndex === 0) {
									var MAX_LOAD = res[iRowIndex].MAX_LOAD;
									var SUMCAR = res[iRowIndex].SUMCAR;
									var SUMPC = res[iRowIndex].SUMPC;
									//var CUMWT1 = res[iRowIndex].CUMWT;
									that.getView().byId("MAX_LOAD").setValue(MAX_LOAD);
									that.getView().byId("SUMCAR").setValue(SUMCAR);
									that.getView().byId("SUMPC").setValue(SUMPC);
									that.getView().byId("TOUR").setValue(res[iRowIndex].TOUR_ID);
									that.getView().byId("MAX_LOAD1").setValue(MAX_LOAD);
								}

								if (typeof itemData !== "undefined" && itemData.length > 0) {
									itemData.push(itemRow);
								} else {
									itemData = [];
									itemData.push(itemRow);
								}

							}
						}

						CUMWT1 = CUMWT1.toFixed(3);
						that.getView().byId("CUMWT1").setValue(CUMWT1);

						// // Set Model
						oModel.setData({
							data: itemData
						});
						oModel.refresh(true);
						// Reset table selection in UI5
						oTable.removeSelections(true);
						//************************get values from backend based on filter Date*******************************************//
						//sap.ui.core.BusyIndicator.hide();
						that.onBusyE(oBusy);

					},
					error: function (oResponse) {
						that.onBusyE(oBusy);
						var oMsg = JSON.parse(oResponse.responseText);
						jQuery.sap.require("sap.m.MessageBox");
						sap.m.MessageToast.show(oMsg.error.message.value);

					}
				});
			}
		},

		//onUpdateF callfrom Table view Onupdatefinished - it call after table binded the data
		onUpdateF: function (oEvent) {

			// var oTable = this.getView().byId("tab");
			// // Get the table Model
			// var oModel = oTable.getModel();
			// // Get Items of the Table
			// var aItems = oTable.getItems(oModel);

			// if (aItems.length > 0) {
			// 	var l_cumwt = aItems[0].getCells()[3].getValue(); //title as title as declared, get CUMWT value for 1st row"
			// 	//	this.getView().byId("CUMWT1").setValue(l_cumwt);
			// }
			// this.onTick();
		},

		onTick: function () {
			var oTable = this.getView().byId("tab");
			var aItems = oTable.getItems(); //All rows  
			var oModel = oTable.getModel();

			if (aItems.length > 0) {
				for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
					// if (aItems[iRowIndex]._bGroupHeader === false) {
					// var l_matnr = oModel.getProperty("MATNR", aItems[iRowIndex].getBindingContext());
					// if (l_matnr !== "" && l_matnr !== undefined && l_matnr !=== null ) {
					var l_matnr = oModel.getProperty("MATNR", aItems[iRowIndex].getBindingContext());
					var l_comp = oModel.getProperty("UOM", aItems[iRowIndex].getBindingContext());
					if (l_comp === "PC") {
						aItems[iRowIndex].getCells()[7].setEditable(false);
					} else if (l_comp === "BOX") {
						aItems[iRowIndex].getCells()[7].setEditable(true);
					}
					// }
				}
			}

		},

		onDchk: function (oEvent) {
			var value = oEvent.getSource().getProperty('value');
			var nval = Number(value);
			if (value === "") {
				this.byId("FETV").setValue(0);
			} else if (nval < 0) {
				this.byId("FETV").setValue(0);
			} else {
				var input1 = value.split(".");
				var input = input1[0];

				var convval = Number(input).toFixed(0);
				this.byId("FETV").setValue(convval);

			}
		},

		//Indivisual change of item of table 
		onChange: function (oControlEvent) {
			var value = Number(oControlEvent.getSource().getProperty('value'));

			var valueState = isNaN(value) ? "Error" : "Success";
			oControlEvent.getSource().setValueState(valueState);

			if (valueState === "Success") {
				var oRow = oControlEvent.getSource().getParent();
				var NUM_DECIMAL_PLACES = 0; //commented on 26.03

				// var NUM_DECIMAL_PLACES = 0; //added on 26.03

				var flg = "";
				var aCells = oRow.getCells();
				for (var i = 7; i < aCells.length; i++) {
					//var colVal_top = Number(parseInt(aCells[i].getValue()));
					// var colVal_tar = aCells[i]._lastValue;

					// var colVal_tar = Number(aCells[i]._lastValue).toFixed(NUM_DECIMAL_PLACES); //commented

					var input1 = aCells[i]._lastValue.split("."); //added
					var input = input1[0]; //added   
					var colVal_tar = Number(input); //added  

					var colVal_van = aCells[i - 2]._lastValue;
					var colVal_top = aCells[i - 1]._lastValue;
					var colVal_vano = aCells[i - 3]._lastValue;

					var uom = aCells[i - 6].getText();

					var val_tar = Number(colVal_tar);
					var val_vano = Number(colVal_vano);
					var val_van = Number(colVal_van);
					var val_top = Number(colVal_top);

					// if (uom === "PC") {
					// 	if (val_tar < val_vano) { //5 >6
					// 		flg = "X";
					// 		colVal_tar = Number(val_top) + Number(val_van);
					// 		MessageBox.error("Target Qty for PCs cannot be below Van Qty.Kindly request loader during Loading process");
					// 	}
					// }

					if (val_tar < val_vano) { //5 >6
						flg = "X";
						colVal_tar = Number(val_top) + Number(val_van);
						if (uom === "PC") {
							MessageBox.error("Target Qty for PCs cannot be below Van Qty.Kindly request loader during Loading process");
						} else if (uom === "BOX") {
							MessageBox.error("Target Qty for Boxs cannot be below Van Qty.Kindly request loader during Loading process");
						}
					}

					if (flg === "") {
						//start added 26.03
						if (val_tar < 0) {
							colVal_tar = "0";
						}
						//end added 26.03

						if (colVal_tar === "" || colVal_tar === "0" || colVal_tar === "0.000") {
							var colVal_tar0 = "0";
							// colVal_tar0 = Number(colVal_tar0).toFixed(NUM_DECIMAL_PLACES);
							colVal_tar0 = Number(colVal_tar0);
							aCells[i].setValue(colVal_tar0);
							aCells[i - 1].setValue(colVal_tar0);
							aCells[i - 2].setValue(colVal_tar0);
							colVal_tar = Number(colVal_tar);
						}
						// if (colVal_tar <= colVal_van || colVal_tar <= colVal_vano) {
						// 	colVal_top = "0";
						// 	colVal_top = parseInt(colVal_top);
						// 	aCells[i - 1].setValue(colVal_top);
						// 	colVal_tar = parseInt(colVal_tar);
						// 	aCells[i - 2].setValue(colVal_tar);
						// } else {
						// 	colVal_tar = parseInt(colVal_tar);
						// 	colVal_van = parseInt(colVal_van);
						// 	colVal_top = colVal_tar - colVal_van;
						// 	aCells[i - 1].setValue(colVal_top);
						// }

						if (val_tar >= val_vano) { //20 >=6
							colVal_top = Number(val_tar) - Number(val_vano);
							aCells[i - 1].setValue(colVal_top);
							aCells[i - 2].setValue(colVal_vano);
						} else {
							colVal_top = "0";
							aCells[i - 1].setValue(colVal_top);
							colVal_van = Number(colVal_tar);
							aCells[i - 2].setValue(colVal_van);

						}
					}

					aCells[i].setValue(colVal_tar);
				}

				this.onCal(3);

			}
		},

		onAdd: function () {
			var that = this;

			var MAXLOAD1 = that.getView().byId("MAX_LOAD1").getValue();
			// var MAXLOAD = that.getView().byId("MAX_LOAD").getValue();
			that.getView().byId("MAX_LOAD").setValue(MAXLOAD1);
			// var oMatnr = that.getView().byId("searchField").getValue();

			var input0 = that.getView().byId("searchField").getValue();
			var input1 = input0.split(" - ");
			var oMatnr = input1[0];
			var val = that.getView().byId("FETV").getValue();

			var user = that.getView().byId("oSelect").getSelectedKey();
			var box = that.getView().byId("BOXD").getSelected();
			var pc = that.getView().byId("PCD").getSelected();
			if (box === true) {
				var uom = "BOX";
			} else if (pc === true) {
				uom = "PC";
			}

			var oTable = that.getView().byId("tab");
			// Get the table Model
			var oModel = oTable.getModel();
			// Get Items of the Table
			var aItems = oTable.getItems(oModel); //All rows  

			if (oMatnr === "") {
				sap.m.MessageToast.show("Please provide new Material to add");
			} else if (aItems.length <= 0) {
				sap.m.MessageToast.show("No data in the list");
			} else {
				for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
					//var l_material = aItems[iRowIndex].getCells()[0].getTitle(); //title as title as declared"

					if (aItems[iRowIndex]._bGroupHeader === false) {
						var mattext = aItems[iRowIndex].getCells()[0].getText(); //title as title as declared"
						var l_mat = [],
							l_material;
						l_mat = mattext.split("-");
						l_material = l_mat[0];

						var cuom = aItems[iRowIndex].getCells()[1].getText();

						if (l_material === oMatnr && uom === cuom) {
							var oFlg = "X";
							sap.m.MessageToast.show("Material & UOM already there in the list");
							break;
						}
					}
				}

				if (oFlg === undefined) {
					var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSDO_TOPUP_SRV/", true);
					that.getView().setModel(oModel1);
					var itemData = oModel.getProperty("/data");

					//************************filter Date*******************************************//
					var PLFilters = [];
					PLFilters.push(new sap.ui.model.Filter({
						path: "MATNR",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oMatnr
					}));

					PLFilters.push(new sap.ui.model.Filter({
						path: "UNAME",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: user
					}));

					PLFilters.push(new sap.ui.model.Filter({
						path: "UOM",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: uom
					}));

					var oBusy = new sap.m.BusyDialog();
					that.onBusyS(oBusy);

					oModel1.read("/InputSet", {
						filters: PLFilters,
						success: function (oData, oResponse) {
							var res = [];
							res = oData.results;

							var max = that.getView().byId("MAX_LOAD").getValue();

							if (res.length > 0) {
								for (var iRowIndex = 0; iRowIndex < res.length; iRowIndex++) {
									var itemRow = {
										MATNR: res[iRowIndex].MATNR,
										UOM: res[iRowIndex].UOM,
										MAKTX: res[iRowIndex].MAKTX,
										WEIGHT_PER_UOM: res[iRowIndex].WEIGHT_PER_UOM,
										CUMWT: res[iRowIndex].CUMWT,
										QUAN_VANO: res[iRowIndex].QUAN_VAN,
										QUAN_VAN: res[iRowIndex].QUAN_VAN,
										QUAN_TOP: val,
										QUAN_TARGET: val //res[iRowIndex].QUAN_TARGET
									};

									if (typeof itemData !== "undefined" && itemData.length > 0) {
										itemData.push(itemRow);
									} else {
										itemData = [];
										itemData.push(itemRow);
									}

								}
							}

							// // Set Model
							oModel.setData({
								data: itemData
							});
							oModel.refresh(true);
							//************************get values from backend based on filter Date*******************************************//
							//sap.ui.core.BusyIndicator.hide();
							that.getView().byId("searchField").setValue("");
							that.getView().byId("FETV").setValue("");

							that.onCal(3);
							that.onBusyE(oBusy);
							sap.m.MessageToast.show("New Material " + oMatnr + " added in the list");
						},
						error: function (oResponse) {
							that.onBusyE(oBusy);
							var oMsg = JSON.parse(oResponse.responseText);
							jQuery.sap.require("sap.m.MessageBox");
							sap.m.MessageToast.show(oMsg.error.message.value);

						}
					});
				}

			}
		},

		onCal: function (NUM_DECIMAL_PLACES) {
			var update_wt = 0;

			var oTable = this.getView().byId("tab");
			// Get the table Model
			var oModel = oTable.getModel();
			// Get Items of the Table
			// var aItems = oTable.getItems(oModel);
			var aItems = oModel.oData.data; //All rows  

			var oMatnrcar = 0,
				oQtytarcar = 0,
				oMatnrpc = 0,
				oQtytarpc = 0;

			for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
				// var l_qtyvan = oModel.getProperty("WEIGHT_PER_UOM", aItems[iRowIndex].getBindingContext());
				// var l_qtyvan = aItems[iRowIndex].getCells()[2].getText();
				// var l_qtytop = aItems[iRowIndex].getCells()[6].getValue();
				// var l_wtperuom = aItems[iRowIndex].getCells()[3].getValue();
				var l_matnr = aItems[iRowIndex].MATNR;
				if (l_matnr !== null && l_matnr !== undefined) {
					var l_wtperuom = aItems[iRowIndex].WEIGHT_PER_UOM;
					var l_qtytop = aItems[iRowIndex].QUAN_TOP;
					var l_qtyvan = aItems[iRowIndex].QUAN_VAN;

					var colVal_sum = Number(l_qtyvan) + Number(l_qtytop); //sum of van and top of that item
					var sum_val = Number(colVal_sum) * Number(l_wtperuom);
					update_wt = Number(update_wt) + Number(sum_val);

					// var l_uom = aItems[iRowIndex].getCells()[1].getText();
					var l_uom = aItems[iRowIndex].UOM;
					if (l_uom === "BOX") {
						oMatnrcar = oMatnrcar + 1;
						// oQtytarcar = oQtytarcar + Number(aItems[iRowIndex].getCells()[7].getValue());
						oQtytarcar = oQtytarcar + Number(aItems[iRowIndex].QUAN_TARGET);
					} else if (l_uom === "PC") {
						oMatnrpc = oMatnrpc + 1;
						// oQtytarpc = oQtytarpc + Number(aItems[iRowIndex].getCells()[7].getValue());
						oQtytarpc = oQtytarpc + Number(aItems[iRowIndex].QUAN_TARGET);
					}
				}

			} //end of for

			var sumcar = oQtytarcar + "/" + oMatnrcar;
			var sumpc = oQtytarpc + "/" + oMatnrpc;
			//	var CUMWT = this.getView().byId("CUMWT1");
			update_wt = Number(update_wt).toFixed(NUM_DECIMAL_PLACES);
			// CUMWT.setValue(update_wt);
			this.getView().byId("CUMWT1").setValue(update_wt);
			this.getView().byId("SUMCAR").setValue(sumcar);
			this.getView().byId("SUMPC").setValue(sumpc);
		},

		onRef: function (oEvent, SMAT) {
			var aTableSearchState = [];
			this._applySearch(aTableSearchState);
		},

		onPri: function (ord) {
			var that = this;
			var kunnr = this.getView().byId("oSelect").getSelectedKey();
			var date = that.getView().byId("DATE")._lastValue;
			var flg = "";

			if (flg === "") {
				var url = "/sap/opu/odata/sap/ZDSDO_TOPUP_SRV/PRINTSet(VBELN='" + ord + "',KUNNR='" + kunnr + "')/$value";
				sap.m.URLHelper.redirect(url, true);
			}
		},

		onSaveL: function (oControlEvent) {
			var that = this;
			var savep = "";
			var loc = "X";

			MessageBox.warning(
				"Only VAN Quantity will be saved. Top Up quantity will be discarded. Continue to save Load Back?", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function (sAction) {
						if (sAction === "OK") {
							that.onSave(oControlEvent, savep, loc);
						}
					}
				}
			);
		},

		onSaveP: function (oControlEvent) {
			var savep = "X";
			var loc = "";
			this.onSave(oControlEvent, savep, loc);
		},

		//Save button
		onSave: function (oControlEvent, savep, loc) {
			this._refreshList(oControlEvent);
			var that = this;

			var val;
			var oTable = that.getView().byId("tab");
			// Get the table Model
			var oModel = oTable.getModel();
			// Get Items of the Table
			var aItems = oTable.getItems(oModel); //All rows  
			var aContexts = oTable.getSelectedContexts(); //selected rows marked with checkbox
			var oCumwt1 = Number(that.getView().byId("CUMWT1").getValue());
			var oMax_load = Number(that.getView().byId("MAX_LOAD").getValue());
			var wcheck = this.getView().byId("DISABLE_WCHECK").getSelected();
			if (wcheck !== true && oCumwt1 > oMax_load) {
				sap.m.MessageToast.show("Cumulative Weight " + oCumwt1 + " can not be greater than Max Load " + oMax_load);
			} else {
				if (aItems.length > 0) {
					// var alen = oModel.oData.data; //All rows  
					var len = 0;

					for (var i = 0; i < aItems.length; i++) {
						if (aItems[i]._bGroupHeader === false) {
							len = Number(len) + 1;
						}
					}

					// if (aContexts.length !== aItems.length) {
					if (aContexts.length !== len) {
						sap.m.MessageToast.show("Not all lines confirmed");
					} else {

						var oBusy = new sap.m.BusyDialog();
						that.onBusyS(oBusy);

						var oDate = that.getView().byId("DATE")._lastValue;

						var dateFormatc = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "yyyy-MM-dd"
						});

						var oDatec = dateFormatc.format(new Date(oDate));
						oDate = oDatec;

						//////////////////////////////////////////////////////////////////////////////////////////////////
						//not required - we do date comparsion in Odata
						// var today = new Date();
						// //date format
						// var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						// 	pattern: "yyyyMMdd"
						// });
						// var ovaluec = dateFormat.format(new Date(today)); //current date
						// var ovalueg = dateFormat.format(new Date(oDate)); // given date

						// var dateFormatc = sap.ui.core.format.DateFormat.getDateInstance({
						// 	pattern: "yyyy-MM-dd"
						// });
						// if (ovaluec > ovalueg) {
						// 	var oDatec = dateFormatc.format(new Date(today));
						// } else {
						// 	oDatec = dateFormatc.format(new Date(oDate));
						// }
						// oDate = oDatec;
						//////////////////////////////////////////////////////////////////////////////////////////////////

						var user = that.getView().byId("oSelect").getSelectedKey();

						//	var oModel1 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZDSD_TOPUP_SRV/", true);
						var oModel1 = that.getView().getModel();

						///////////////////////////////new logic commented/////////////////////////////////////////////////////							
						oModel1.setUseBatch(true);
						// return back from SAP-Backend to Firoi and show success or error
						var mParameters = {
							success: function (oEntry, oResponse) {
								that.onBusyE(oBusy);
							},
							error: function (oResponse) {
								var oMsg = JSON.parse(oResponse.responseText);

								var oSev = oMsg.error.innererror.errordetails[0].severity;
								if (oSev === "success") {
									oTable.removeSelections(true);
									// var sBtn = that.getView().byId("button1");
									// var sBtn1 = that.getView().byId("button4");
									// var sBtn2 = that.getView().byId("button12");
									// var sBtn3 = that.getView().byId("button15");
									// if (sBtn.getVisible()) {
									// 	sBtn.setVisible(false);
									// }
									// if (sBtn1.getVisible()) {
									// 	sBtn1.setVisible(false);
									// }
									// if (sBtn2.getVisible()) {
									// 	sBtn2.setVisible(false);
									// }
									// if (sBtn3.getVisible()) {
									// 	sBtn3.setVisible(false);
									// }
									that.onClr();

								}
								jQuery.sap.require("sap.m.MessageBox");
								if (oSev === "success") {
									var msg = "Data submitted.SO:" + oMsg.error.message.value;
									sap.m.MessageToast.show(msg);
								} else {
									sap.m.MessageToast.show(oMsg.error.message.value);
								}

								that.onBusyE(oBusy);

								if (oSev === "success") {
									if (savep === "X") {
										if (val === undefined) {
											that.onPri(oMsg.error.message.value);
											val = "X";
										}
									}
								}

							}
						};
						///////////////////////////////new logic commented/////////////////////////////////////////////////////

						//Create Body
						//var requestBody = {};

						for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {

							if (aItems[iRowIndex]._bGroupHeader === false) {
								var mattext = aItems[iRowIndex].getCells()[0].getText(); //title as title as declared"
								var l_mat = [],
									l_material;
								l_mat = mattext.split("-");
								l_material = l_mat[0];
								var l_uom = aItems[iRowIndex].getCells()[1].getText(); //text as text as declared"
								var l_wtperuom = aItems[iRowIndex].getCells()[2].getValue();
								//var l_dates    = aItems[iRowIndex].getCells()[3].getValue();

								var l_qtyvan = aItems[iRowIndex].getCells()[5].getValue();
								var l_qtytop = aItems[iRowIndex].getCells()[6].getValue();
								var l_qtytar = aItems[iRowIndex].getCells()[7].getValue(); //value as input as declared"

								//var l_cdates = dateFormat.format(new Date(l_dates));

								var tour_id = that.getView().byId("TOUR").getValue();

								var oEntry = {};
								oEntry.MATNR = l_material;
								oEntry.UOM = l_uom;
								// oEntry.ORD_DATE = oDate;
								oEntry.QUAN_TARGET = l_qtytar;
								oEntry.QUAN_VAN = l_qtyvan;
								if (loc === "X") {
									oEntry.QUAN_TOP = "0";
								} else {
									oEntry.QUAN_TOP = l_qtytop;
								}

								oEntry.WEIGHT_PER_UOM = l_wtperuom;
								oEntry.UNAME = user;
								oEntry.TOUR_ID = tour_id;

								///////////////////////////////new logic commented/////////////////////////////////////////////////////
								var sVal = "/InputSet(DATE='" + oDate + "',MATNR='" + l_material + "',UOM='" + l_uom + "',UNAME='" + user + "')";

								///////////
								mParameters.changeSetId = "changeset ";
								oModel1.update(sVal, oEntry, mParameters);
								////////////
								///////////////////////////////new logic commented/////////////////////////////////////////////////////

							}
						} //end of for

						///////////////////////////////new logic commented/////////////////////////////////////////////////////
						//	Finally, submit all the batch changes 
						oModel1.submitChanges({
							chageSetId: mParameters,
							success: function () {},
							error: function () {}
						});
						///////////////////////////////new logic commented/////////////////////////////////////////////////////							
					}
				} else {
					sap.m.MessageToast.show("No Data for Posting");
				}
			}

		},

		_refreshList: function (oEvent) {
			var aTableSearchState = [];
			this._applySearch(aTableSearchState);
		},

		_applySearch: function (aTableSearchState) {
				var oTable = this.byId("tab"),
					oViewModel = this.getView().getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (aTableSearchState !== undefined) {
					if (aTableSearchState.length !== 0) {
						oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
					}
				}
			}
			/////////////////////////////////////////////////////
	});
});