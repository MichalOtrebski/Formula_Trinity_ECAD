/*
<!-- ---------------------------------------------------------------------- 	-->
<!-- Cadence Design Systems											   			-->
<!-- (c) 2019 Cadence Design Systems, Inc. All rights reserved.					-->
<!-- This work may not be copied, modified, re-published, uploaded, 			-->
<!-- executed, or distributed in any way, in any medium, whether in 			-->
<!-- whole or in part, without prior written permission from Cadence 			-->
<!-- Design Systems, Inc.														-->
<!-- ---------------------------------------------------------------------- 	-->
*/
"use strict";

// Global variables
var compStress;
var compCount;
var lowCount;
var moderateCount;
var highCount;
var overCount;
var frozenCount;
var safeDevCountData;
var moderateDevCountData;
var highDevCountData;
var overDevCountData;
var frozenDevCountData;
var safeSelected;
var moderateSelected;
var overSelected;
var rangeSlider;
var reliabilityDashboardApp;
var summaryDonut;
var analyzedDesignDonut;
var unAnalyzedDesignDonut;
var analyzedDevicesStackedBar;
var unAnalyzedDevicesStackedBar;
var mtbfSensitivityStackedBar;
var activeTemperature;
var mode = "STRESS";
var none = "NA";
var dumpPathVal = "";
var unanalyzedDevice;

var displayCategories = ["Low_Stressed", "Moderately_Stressed", "Highly_Stressed", "Over_Stressed", "Beyond_Minimum_Temp", "Unanalyzed"];
var skippedDisplayCategories = [];
var color_range = ["#1b9e77", "#e6ab02", "#e85d04", "#e41a1c", "#1f78b4", "#9ea396"];
var skip_color_range = ["#1f78b4", "#a6cee3"];

var localizeOnInit = false;
var locale = "en";
var localeFont = "";

var ICStr = "IC";
var MechanicalStr = "Mechanical";
var ConnectorStr = "Connector";
var DCDCLDOStr = "DC-DC/LDO";

function localize(language, font) {
	stdformatter = new Intl.NumberFormat(language, standardoption);
	scientificformatter = new Intl.NumberFormat(language, scientificoption);
	i18next.changeLanguage(language);

	if (language != "en") {
		var body = document.body;
		body.style.fontFamily = font;
	}

	var electricalStressTab = document.querySelector(".navigationtabs>li>a");
	electricalStressTab.innerHTML = getTranslatedString('feature1title');
	var designsummaryTitle = document.querySelector("#donutTitle");
	designsummaryTitle.innerHTML = getTranslatedString('designsummarytitle');
	var devicesummaryTitle = document.querySelector("#barTitle");
	devicesummaryTitle.innerHTML = getTranslatedString('devicesummarytitle');
	var searchInput = document.querySelector(".form-control");
	searchInput.placeholder = getTranslatedString('searchplaceholder');
	var disclaimerTitle = document.querySelector("#disclaimertitle");
	disclaimerTitle.innerHTML = getTranslatedString('disclaimertitle');
	var disclaimerText = document.querySelector("#disclaimertext");
	disclaimerText.innerHTML = getTranslatedString('disclaimertext');
	var showpeakValue = document.querySelector("#showpeakval");
	showpeakValue.innerHTML = getTranslatedString('showpeakval');
	var querysyncTitle = document.querySelector("#querysynctitle");
	if (querysyncTitle) {
		querysyncTitle.innerHTML = getTranslatedString('querysynctitle');
	}
	var infosynccheckTitle = document.querySelector("#infosyncchecktitle");
	if (infosynccheckTitle) {
		infosynccheckTitle.innerHTML = getTranslatedString('infosyncchecktitle');
	}
	var triggerSyncButton = document.querySelector("#triggerSyncBtn");
	if (triggerSyncButton) {
		triggerSyncButton.innerHTML = getTranslatedString('triggerSyncBtn');
	}
	var cancelQuerySyncButton = document.querySelector("#cancelQuerySyncBtn");
	if (cancelQuerySyncButton) {
		cancelQuerySyncButton.innerHTML = getTranslatedString('cancelQuerySyncBtn');
	}
	var okSyncCheckButton = document.querySelector("#okSyncCheckBtn");
	if (okSyncCheckButton) {
		okSyncCheckButton.innerHTML = getTranslatedString('okSyncCheckBtn');
	}
	var compRefdes = document.querySelector("#componentdiv");
	if(compRefdes){
		var displayCompRefdes = getRefdes();
		compRefdes.innerHTML = displayCompRefdes ? (getTranslatedString('component') + displayCompRefdes): "";
	}
	var analyzedText = document.querySelector("#analyzedtext");
	if(analyzedText){
		analyzedText.innerHTML = getTranslatedString('analyzed');
	 }
	var ofText = document.querySelector("#oftext");
	if(ofText){
		ofText.innerHTML = getTranslatedString('filtertext2');
	}
	var deviceText = document.querySelector("#devicetext");
	if(deviceText){
		deviceText.innerHTML = getTranslatedString('devices');
	}
	var queryIsDesignReadOnlyTitle = document.querySelector("#queryisdesignreadonlytitle");
	if (queryIsDesignReadOnlyTitle) {
		queryIsDesignReadOnlyTitle.innerHTML = getTranslatedString('queryisdesignreadonlytitle');
	}
	var devicetypeheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(1)>div");
	if (devicetypeheader) {
		var deviceheadertext = getTranslatedString('devtypeheader');
		
		devicetypeheader.textContent = deviceheadertext;
		devicetypeheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(1)");
		devicetypeheader.dataset['title'] = deviceheadertext;
		devicetypeheader.dataset['titleText'] = deviceheadertext;
		devicetypeheader.attributes['data-title'].nodeValue = deviceheadertext;
		devicetypeheader.attributes['data-title'].value = deviceheadertext;
		devicetypeheader.attributes['data-title'].textContent = deviceheadertext;
	}

	var comprefdesheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(2)>div");
	if (comprefdesheader) {
		var comprefdesheadertext = getTranslatedString('comprefdesheader');
		
		comprefdesheader.textContent = comprefdesheadertext;
		comprefdesheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(2)");
		comprefdesheader.dataset['title'] = comprefdesheadertext;
		comprefdesheader.dataset['titleText'] = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].nodeValue = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].value = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].textContent = comprefdesheadertext;
	}

	var paramnameheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(3)>div");
	if (paramnameheader) {
		var paramnameheadertext = getTranslatedString('paramnameheader');
		
		paramnameheader.textContent = paramnameheadertext;
		paramnameheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(3)");
		paramnameheader.dataset['title'] = paramnameheadertext;
		paramnameheader.dataset['titleText'] = paramnameheadertext;
		paramnameheader.attributes['data-title'].nodeValue = paramnameheadertext;
		paramnameheader.attributes['data-title'].value = paramnameheadertext;
		paramnameheader.attributes['data-title'].textContent = paramnameheadertext;
	}

	var deratedmaxheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(4)>div");
	if (deratedmaxheader) {
		var detaredmaxheadertext = getTranslatedString('deratedmaxvalheader');
		
		deratedmaxheader.textContent = detaredmaxheadertext;
		deratedmaxheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(4)");
		deratedmaxheader.dataset['title'] = detaredmaxheadertext;
		deratedmaxheader.dataset['titleText'] = detaredmaxheadertext;
		deratedmaxheader.attributes['data-title'].nodeValue = detaredmaxheadertext;
		deratedmaxheader.attributes['data-title'].value = detaredmaxheadertext;
		deratedmaxheader.attributes['data-title'].textContent = detaredmaxheadertext;
	}

	var deratingfactorheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(5)>div");
	if (deratingfactorheader) {
		var deratingfactorheadertext = getTranslatedString('deratingfactorheader');
		
		deratingfactorheader.textContent = deratingfactorheadertext;
		deratingfactorheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(5)");
		deratingfactorheader.dataset['title'] = deratingfactorheadertext;
		deratingfactorheader.dataset['titleText'] = deratingfactorheadertext;
		deratingfactorheader.attributes['data-title'].nodeValue = deratingfactorheadertext;
		deratingfactorheader.attributes['data-title'].value = deratingfactorheadertext;
		deratingfactorheader.attributes['data-title'].textContent = deratingfactorheadertext;
	}

	var estimatedvalueheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(6)>div");
	if (estimatedvalueheader) {
		var estimatedvalueheadertext = getTranslatedString('estimatedvalueheader');
		
		estimatedvalueheader.textContent = estimatedvalueheadertext;
		estimatedvalueheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(6)");
		estimatedvalueheader.dataset['title'] = estimatedvalueheadertext;
		estimatedvalueheader.dataset['titleText'] = estimatedvalueheadertext;
		estimatedvalueheader.attributes['data-title'].nodeValue = estimatedvalueheadertext;
		estimatedvalueheader.attributes['data-title'].value = estimatedvalueheadertext;
		estimatedvalueheader.attributes['data-title'].textContent = estimatedvalueheadertext;
	}
	var estimatedpeakvalueheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(7)>div");
	if (estimatedpeakvalueheader) {
		var estimatedpeakvalueheadertext = getTranslatedString('estimatedpeakvalueheader');
		
		estimatedpeakvalueheader.textContent = estimatedpeakvalueheadertext;
		estimatedpeakvalueheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(7)");
		estimatedpeakvalueheader.dataset['title'] = estimatedpeakvalueheadertext;
		estimatedpeakvalueheader.dataset['titleText'] = estimatedpeakvalueheadertext;
		estimatedpeakvalueheader.attributes['data-title'].nodeValue = estimatedpeakvalueheadertext;
		estimatedpeakvalueheader.attributes['data-title'].value = estimatedpeakvalueheadertext;
		estimatedpeakvalueheader.attributes['data-title'].textContent = estimatedpeakvalueheadertext;
	}

	var estimatedstressheader = document.querySelector("#maindataTable>table>thead>tr>th:last-child>div");
	if (estimatedstressheader) {
		var estimatedstressheadertext = getTranslatedString('estimatedstressheader');
		
		estimatedstressheader.textContent = estimatedstressheadertext;
		estimatedstressheader = document.querySelector("#maindataTable>table>tbody>tr>td:last-child");
		estimatedstressheader.dataset['title'] = estimatedstressheadertext;
		estimatedstressheader.dataset['titleText'] = estimatedstressheadertext;
		estimatedstressheader.attributes['data-title'].nodeValue = estimatedstressheadertext;
		estimatedstressheader.attributes['data-title'].value = estimatedstressheadertext;
		estimatedstressheader.attributes['data-title'].textContent = estimatedstressheadertext;
	}

	devicetypeheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(1)>div");
	if (devicetypeheader) {
		deviceheadertext = getTranslatedString('devtypeheader');
		
		devicetypeheader.textContent = deviceheadertext;
		devicetypeheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(1)");
		devicetypeheader.dataset['title'] = deviceheadertext;
		devicetypeheader.dataset['titleText'] = deviceheadertext;
		devicetypeheader.attributes['data-title'].nodeValue = deviceheadertext;
		devicetypeheader.attributes['data-title'].value = deviceheadertext;
		devicetypeheader.attributes['data-title'].textContent = deviceheadertext;
	}
	comprefdesheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(2)>div");
	if (comprefdesheader) {
		comprefdesheadertext = getTranslatedString('comprefdesheader');
		
		comprefdesheader.textContent = comprefdesheadertext;
		comprefdesheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(2)");
		comprefdesheader.dataset['title'] = comprefdesheadertext;
		comprefdesheader.dataset['titleText'] = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].nodeValue = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].value = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].textContent = comprefdesheadertext;
	}

	var subcircuitnumheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(3)>div");
	if (subcircuitnumheader) {
		var subcircuitnumheadertext = getTranslatedString('subcircuitnumheader');
		
		subcircuitnumheader.textContent = subcircuitnumheadertext;
		subcircuitnumheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(3)");
		subcircuitnumheader.dataset['title'] = subcircuitnumheadertext;
		subcircuitnumheader.dataset['titleText'] = subcircuitnumheadertext;
		subcircuitnumheader.attributes['data-title'].nodeValue = subcircuitnumheadertext;
		subcircuitnumheader.attributes['data-title'].value = subcircuitnumheadertext;
		subcircuitnumheader.attributes['data-title'].textContent = subcircuitnumheadertext;
	}

	var reasonheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(4)>div");
	if (reasonheader) {
		var reasonheadertext = getTranslatedString('reasonheader');
		
		reasonheader.textContent = reasonheadertext;
		reasonheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(4)");
		reasonheader.dataset['title'] = reasonheadertext;
		reasonheader.dataset['titleText'] = reasonheadertext;
		reasonheader.attributes['data-title'].nodeValue = reasonheadertext;
		reasonheader.attributes['data-title'].value = reasonheadertext;
		reasonheader.attributes['data-title'].textContent = reasonheadertext;
	}

	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()) {
		var appScope = angElement.scope();
		appScope.analyzedMenuOptions[0].text = getTranslatedString("highlightcomponentmenutext");
		appScope.analyzedMenuOptions[1].text = getTranslatedString("dehighlightcomponentmenutext");
		appScope.analyzedMenuOptions[2].text = getTranslatedString("highlightsubcircuitmenutext");
		appScope.analyzedMenuOptions[3].text = getTranslatedString("dehighlightsubcircuitmenutext");
		appScope.analyzedMenuOptions[4].text = getTranslatedString("configcontroltooltip");
		appScope.unanalyzedMenuOptions[0].text = getTranslatedString("highlightcomponentmenutext");
		appScope.unanalyzedMenuOptions[1].text = getTranslatedString("dehighlightcomponentmenutext");
		appScope.unanalyzedMenuOptions[2].text = getTranslatedString("highlightsubcircuitmenutext");
		appScope.unanalyzedMenuOptions[3].text = getTranslatedString("dehighlightsubcircuitmenutext");
		appScope.unanalyzedMenuOptions[4].text = getTranslatedString("configcontroltooltip");
	}
	var tooltipcountcell = document.querySelector("#mainsummary-donut .donuttooltip div.counttext");
	if (tooltipcountcell)
		tooltipcountcell.innerHTML = getTranslatedString('counttext');
	var tooltippercentcell = document.querySelector("#mainsummary-donut .donuttooltip div.percentagetext");
	if (tooltippercentcell)
		tooltippercentcell.innerHTML = getTranslatedString('percentagetext');

	tooltipcountcell = document.querySelector("#altsummary-donut .donuttooltip div.counttext");
	if (tooltipcountcell)
		tooltipcountcell.innerHTML = getTranslatedString('counttext');
	tooltippercentcell = document.querySelector("#altsummary-donut .donuttooltip div.percentagetext");
	if (tooltippercentcell)
		tooltippercentcell.innerHTML = getTranslatedString('percentagetext');
	refreshAll();
	localizeOnInit = true;
}

function getStressData() {
	for (var i = 0; i < jsondata.length; ++i) {
		if (activeTemperature == jsondata[i]["OpTemp"]) {
			return jsondata[i]["ElectricalStressResults"];
		}
	}
}

function getRefdes() {
		return jsondata[0]["refdes"];
}

function getUnanalyzedData() {
	for (var i = 0; i < jsondata.length; ++i) {
		if (activeTemperature == jsondata[i]["OpTemp"]) {
			return jsondata[i]["Unanalyzed"];
		}
	}
	return;
}

function computeDonutData() {
	return { "Low": lowCount, "Moderate": moderateCount, "High": highCount, "Over": overCount, "Frozen": frozenCount };
}

function totalAnalyzedDevicesCount() {
	return lowCount + moderateCount + highCount + overCount + frozenCount;
}

function computeAltDonutData() {
	var unanalyzeddata = getUnanalyzedData();
	var otherDevicesCount = 0;
	var icDevicesCount = 0;
	var mechanicalDevicesCount = 0;
	var connectorDevicesCount = 0;
	var unknownDevicesCount = 0;

	for (var i = 0; i < unanalyzeddata.length; i++) {
		if (unanalyzeddata[i]["Device"] === "Unknown") { unknownDevicesCount++; }
		else if (unanalyzeddata[i]["Device"] === "IC") { icDevicesCount++; }
		else if (unanalyzeddata[i]["Device"] === "Mechanical") { mechanicalDevicesCount++; }
		else if (unanalyzeddata[i]["Device"] === "Connector") { connectorDevicesCount++; }
		else { otherDevicesCount++; }
	}
	var unanalyzedDeviceSummary = {};
	if (otherDevicesCount) unanalyzedDeviceSummary["Ignored"] = otherDevicesCount;
	if (unknownDevicesCount) unanalyzedDeviceSummary["Unknown"] = unknownDevicesCount;
	if (icDevicesCount) unanalyzedDeviceSummary["IC"] = icDevicesCount;
	if (mechanicalDevicesCount) unanalyzedDeviceSummary["Mechanical"] = mechanicalDevicesCount;
	if (connectorDevicesCount) unanalyzedDeviceSummary["Connectors"] = connectorDevicesCount;
	return unanalyzedDeviceSummary;
}

function computeUnanalyzedSummaryColorRange() {
	var unanalyzeddata = getUnanalyzedData();
	var otherDevicesCount = 0;
	var icDevicesCount = 0;
	var mechanicalDevicesCount = 0;
	var connectorDevicesCount = 0;
	var unknownDevicesCount = 0;
	var colorrange = [];
	for (var i = 0; i < unanalyzeddata.length; i++) {
		if (unanalyzeddata[i]["Device"] === "Unknown") { unknownDevicesCount++; }
		else if (unanalyzeddata[i]["Device"] === "IC") { icDevicesCount++; }
		else if (unanalyzeddata[i]["Device"] === "Mechanical") { mechanicalDevicesCount++; }
		else if (unanalyzeddata[i]["Device"] === "Connector") { connectorDevicesCount++; }
		else { otherDevicesCount++; }
	}
	if (otherDevicesCount) colorrange.push("#1f78b4");
	if (unknownDevicesCount) colorrange.push("#a6cee3");
	if (icDevicesCount) colorrange.push("#b2df8a");
	if (mechanicalDevicesCount) colorrange.push("#33a02c");
	if (connectorDevicesCount) colorrange.push("#fb9a99");
	return colorrange;
}

function computeStressLevels() {
	compStress = {};
	var minimumtemp;
	var stressjsondata = getStressData()
	for (var i = 0; i < stressjsondata.length; i++) {
		var rmsval = Number(stressjsondata[i]["RMSPercentage"]);
		var peakval = Number(stressjsondata[i]["PeakPercentage"]);
		var component = stressjsondata[i]["Component"];
		var sstresslevel = stressjsondata[i]["SafeLevel"];
		var hstresslevel = stressjsondata[i]["OverLevel"];
		var ostresslevel = 100.00;
		if (rmsval < sstresslevel) {
			if (!compStress.hasOwnProperty(component)) {
				compStress[component] = "SafeStress";
			}
		} else if (rmsval > ostresslevel) {
			compStress[component] = "OverStress";
		} else if (rmsval > hstresslevel) {
			if (!compStress.hasOwnProperty(component)) {
				compStress[component] = "HighStress";
			}
			else {
				if (compStress[component] === "SafeStress" || compStress[component] === "ModerateStress")
					compStress[component] = "HighStress";
			}
		} else if (!compStress.hasOwnProperty(component)) {
			compStress[component] = "ModerateStress";
		} else if (compStress[component] === "SafeStress") {
			compStress[component] = "ModerateStress";
		}
		
		if (stressjsondata[i]["ParameterCategory"] == "Temperature" ) {
			if(!stressjsondata[i]["RMSMeasured"].includes(" \u2103"))
				stressjsondata[i]["RMSMeasured"]  +=  " \u2103";
			if (!stressjsondata[i]["RMSMax"].includes(" \u2103"))
				stressjsondata[i]["RMSMax"] += " \u2103";	

			stressjsondata[i]["PeakMeasured"] = "NA";
		}
		if (!stressjsondata[i]["PeakMeasured"] || stressjsondata[i]["PeakMeasured"] === ""){
			stressjsondata[i]["PeakMeasured"] = "NA";
		}

		for (var j = 0; j < negativetempjsondata.length; ++j) {
			if (component === negativetempjsondata[j].Name) {
				minimumtemp = negativetempjsondata[j].Tmin;
				if (activeTemperature <= minimumtemp)
					compStress[component] = "minimumTemp";
				break;
			}
		}
	}
	const values = Object.values(compStress);
	lowCount = 0, moderateCount = 0, overCount = 0, highCount = 0, frozenCount = 0;
	for (const value of values) {
		if (value == "SafeStress") { lowCount++; }
		else if (value == "OverStress") { overCount++; }
		else if (value == "ModerateStress") { moderateCount++; }
		else if (value == "HighStress") { highCount++; }
		else { frozenCount++; }
	}

	for (var i = 0; i < stressjsondata.length; i++) {
		var component = stressjsondata[i]["Component"];
		switch (compStress[component]) {
			case "SafeStress":
				stressjsondata[i]["StressCategory"] = "Low";
				break;
			case "ModerateStress":
				stressjsondata[i]["StressCategory"] = "Moderate";
				break;
			case "HighStress":
				stressjsondata[i]["StressCategory"] = "High";
				break;
			case "OverStress":
				stressjsondata[i]["StressCategory"] = "Over";
				break;
			default: {
				stressjsondata[i]["StressCategory"] = "Frozen";
				stressjsondata[i]["RMSMeasured"] = none;
				stressjsondata[i]["RMSPercentage"] = none;
				stressjsondata[i]["PeakMeasured"]=none;
				break;
			}
		}
	}
}

function computeSummary() {
	compCount = 0;
	var compSet = new Set();
	var safeDevCnt = {};
	var moderateDevCnt = {};
	var highDevCnt = {};
	var overDevCnt = {};
	var frozenDevCnt = {};				   
	var stressjsondata = getStressData()
	for (var i = 0; i < stressjsondata.length; i++) {
		var component = stressjsondata[i]["Component"];
		var device = stressjsondata[i]["Device"];
		if (!compSet.has(component)) {
			compSet.add(component);
			switch (compStress[component]) {
				case "SafeStress":
					if (!safeDevCnt.hasOwnProperty(device)) {
						safeDevCnt[device] = 1;
					} else {
						safeDevCnt[device]++;
					}
					break;
				case "ModerateStress":
					if (!moderateDevCnt.hasOwnProperty(device)) {
						moderateDevCnt[device] = 1;
					} else {
						moderateDevCnt[device]++;
					}
					break;
				case "HighStress":
					if (!highDevCnt.hasOwnProperty(device)) {
						highDevCnt[device] = 1;
					} else {
						highDevCnt[device]++;
					}
					break;
				case "OverStress":
					if (!overDevCnt.hasOwnProperty(device)) {
						overDevCnt[device] = 1;
					} else {
						overDevCnt[device]++;
					}
					break;
				default:
					if (!frozenDevCnt.hasOwnProperty(device)) {
						frozenDevCnt[device] = 1;
					} else {
						frozenDevCnt[device]++;
					}
					break;
			}
		}
	}
	compCount = compSet.length;

	safeDevCountData = [];
	moderateDevCountData = [];
	highDevCountData = [];
	overDevCountData = [];
	frozenDevCountData = [];

	Object.entries(safeDevCnt).forEach(([key, value]) => safeDevCountData.push({ "Device": key, "Count": value }));
	safeDevCountData.sort((a, b) => (a.Device > b.Device) ? 1 : ((b.Device > a.Device) ? -1 : 0));

	Object.entries(moderateDevCnt).forEach(([key, value]) => moderateDevCountData.push({ "Device": key, "Count": value }));
	moderateDevCountData.sort((a, b) => (a.Device > b.Device) ? 1 : ((b.Device > a.Device) ? -1 : 0));

	Object.entries(highDevCnt).forEach(([key, value]) => highDevCountData.push({ "Device": key, "Count": value }));
	highDevCountData.sort((a, b) => (a.Device > b.Device) ? 1 : ((b.Device > a.Device) ? -1 : 0));

	Object.entries(overDevCnt).forEach(([key, value]) => overDevCountData.push({ "Device": key, "Count": value }));
	overDevCountData.sort((a, b) => (a.Device > b.Device) ? 1 : ((b.Device > a.Device) ? -1 : 0));

	Object.entries(frozenDevCnt).forEach(([key, value]) => frozenDevCountData.push({ "Device": key, "Count": value }));
	frozenDevCountData.sort((a, b) => (a.Device > b.Device) ? 1 : ((b.Device > a.Device) ? -1 : 0));

	return compSet.size;
}

function computeAltStackedBarData() {
	let deviceData = [];
	let barCountData = [];
	let unanalyzeddata = getUnanalyzedData();
	let totalDevCount = 0;
	for (var i = 0; i < unanalyzeddata.length; i++) {
		var device = unanalyzeddata[i]["Device"];
		if ((device != "Unknown") &&
			(device != "IC") &&
			(device != "Mechanical") &&
			(device != "Connector")) {
			if (!deviceData.hasOwnProperty(device))
				deviceData[device] = 1;
			else
				deviceData[device]++;
			totalDevCount++;
		}
	}
	Object.entries(deviceData).forEach(([key, value]) => barCountData.push({ "Key": key, "StartCount": 0, "TotalCount": value }));
	barCountData.sort(function (a, b) { return (b["TotalCount"] - a["TotalCount"]); }); // Sort descending

	let outlierCountData = [];
	// 1. First keep not more than 7 devices.
	if (barCountData.length > 7) {
		for (let i = barCountData.length - 1; i >= 7; --i) {
			outlierCountData.push({ "Key": barCountData[i]["Key"], "StartCount": barCountData[i]["StartCount"], "TotalCount": barCountData[i]["TotalCount"] });
			barCountData.splice(i, 1);
		}
	}
	// 2. Now remove the devices that are truly outliers and bars cannot be drawn for those.
	for (let i = barCountData.length - 1; i >= 0; --i) {
		if (barCountData[i]["TotalCount"] / totalDevCount < 0.02) {
			outlierCountData.push({ "Key": barCountData[i]["Key"], "StartCount": barCountData[i]["StartCount"], "TotalCount": barCountData[i]["TotalCount"] });
			barCountData.splice(i, 1);
		}
	}
	outlierCountData.sort(function (a, b) { return -1 * (b["TotalCount"] - a["TotalCount"]); }); // Sort ascending

	return {
		barCount: barCountData,
		outlierCount: outlierCountData
	};
}

function computeStackedBarData() {
	let barCountData = [];
	let unanalyzeddata = getUnanalyzedData();
	let UnknownDevCount = 0;
	for (var i = 0; i < unanalyzeddata.length; i++)
	{
		var device = unanalyzeddata[i]["Device"];
		if (device === "Unknown" )
			UnknownDevCount++;
	}									  
	for (let i = 0; i < safeDevCountData.length; i++) {
		barCountData.push({ "Key": safeDevCountData[i]["Device"], "Low_StressedCount": safeDevCountData[i]["Count"], "Moderately_StressedCount": 0, "Highly_StressedCount": 0, "Over_StressedCount": 0, "Beyond_Minimum_TempCount": 0, "UnanalyzedCount": 0 });
	}
	for (let i = 0; i < moderateDevCountData.length; i++) {
		let devicefound = false;
		for (let j = 0; j < barCountData.length; j++) {
			if (barCountData[j]["Key"] == moderateDevCountData[i]["Device"]) {
				devicefound = true;
				barCountData[j]["Moderately_StressedCount"] = moderateDevCountData[i]["Count"];
				break;
			}
		}
		if (!devicefound) {
			barCountData.push({ "Key": moderateDevCountData[i]["Device"], "Low_StressedCount": 0, "Moderately_StressedCount": moderateDevCountData[i]["Count"], "Highly_StressedCount": 0, "Over_StressedCount": 0, "Beyond_Minimum_TempCount": 0, "UnanalyzedCount": 0  });
		}
	};
	for (let i = 0; i < highDevCountData.length; i++) {
		let devicefound = false;
		for (let j = 0; j < barCountData.length; j++) {
			if (barCountData[j]["Key"] == highDevCountData[i]["Device"]) {
				devicefound = true;
				barCountData[j]["Highly_StressedCount"] = highDevCountData[i]["Count"];
				break;
			}
		}
		if (!devicefound) {
			barCountData.push({ "Key": highDevCountData[i]["Device"], "Low_StressedCount": 0, "Moderately_StressedCount": 0, "Highly_StressedCount": highDevCountData[i]["Count"], "Over_StressedCount": 0, "Beyond_Minimum_TempCount": 0 , "UnanalyzedCount": 0 });
		}
	};
	for (let i = 0; i < overDevCountData.length; i++) {
		let devicefound = false;
		for (let j = 0; j < barCountData.length; j++) {
			if (barCountData[j]["Key"] == overDevCountData[i]["Device"]) {
				devicefound = true;
				barCountData[j]["Over_StressedCount"] = overDevCountData[i]["Count"];
				break;
			}
		}
		if (!devicefound) {
			barCountData.push({ "Key": overDevCountData[i]["Device"], "Low_StressedCount": 0, "Moderately_StressedCount": 0, "Highly_StressedCount": 0, "Over_StressedCount": overDevCountData[i]["Count"], "Beyond_Minimum_TempCount": 0, "UnanalyzedCount": 0  });
		}
	};
	for (let i = 0; i < frozenDevCountData.length; i++) {
		let devicefound = false;
		for (let j = 0; j < barCountData.length; j++) {
			if (barCountData[j]["Key"] == frozenDevCountData[i]["Device"]) {
				devicefound = true;
				barCountData[j]["Beyond_Minimum_TempCount"] = frozenDevCountData[i]["Count"];
				break;
			}
		}
		if (!devicefound) {
			barCountData.push({ "Key": frozenDevCountData[i]["Device"], "Low_StressedCount": 0, "Moderately_StressedCount": 0, "Highly_StressedCount": 0, "Over_StressedCount": 0, "Beyond_Minimum_TempCount": frozenDevCountData[i]["Count"], "UnanalyzedCount": 0 });
		}
	};
	let totalDevCount = 0;
	for (let i = 0; i < barCountData.length; i++) {
		let totalCnt = barCountData[i]["Low_StressedCount"] + barCountData[i]["Moderately_StressedCount"] + barCountData[i]["Highly_StressedCount"] + barCountData[i]["Over_StressedCount"] + barCountData[i]["Beyond_Minimum_TempCount"];
		barCountData[i]["TotalCount"] = totalCnt;
		totalDevCount += totalCnt;
	}
	let unanalyzedDeviceCount = {};
	for (var j = 0; j < unanalyzeddata.length; j++)
	{
		if(unanalyzeddata[j]["Device"] === "Unknown") continue;
		if(unanalyzedDeviceCount[unanalyzeddata[j]["Device"]])
		{
			unanalyzedDeviceCount[unanalyzeddata[j]["Device"]] +=1;
		}
		else{
			unanalyzedDeviceCount[unanalyzeddata[j]["Device"]]=1;
		}
				
	}
	for (const device in unanalyzedDeviceCount) 
	{
		let deviceFound = false;
		for (let i = 0; i < barCountData.length; i++) {
		if(device == barCountData[i]["Key"]){
			barCountData[i]["UnanalyzedCount"] = unanalyzedDeviceCount[device];
			barCountData[i]["TotalCount"] = barCountData[i]["TotalCount"] + unanalyzedDeviceCount[device];
			deviceFound=true;
			break;
		}	
		}
		if(!deviceFound	)
			barCountData.push({ "Key": device, "Low_StressedCount": 0, "Moderately_StressedCount": 0, "Highly_StressedCount": 0, "Over_StressedCount": 0, "Beyond_Minimum_TempCount": 0, "UnanalyzedCount": unanalyzedDeviceCount[device], "TotalCount": unanalyzedDeviceCount[device] });
	}
	barCountData.sort(function (a, b) { return (b["TotalCount"] - a["TotalCount"]); }); // Sort descending
	if(UnknownDevCount){
	barCountData.push({ "Key": "Unknown", "Low_StressedCount": 0, "Moderately_StressedCount": 0, "Highly_StressedCount": 0, "Over_StressedCount": 0, "Beyond_Minimum_TempCount": 0, "UnanalyzedCount": UnknownDevCount, "TotalCount": UnknownDevCount });
	totalDevCount += UnknownDevCount;	
	}											  
	/* Now remove the outliers */
	let outlierCountData = [];
	// 1. First keep not more than 7 devices.
	if (barCountData.length > 7) {
		for (let i = barCountData.length - 1; i >= 7; --i) {
			outlierCountData.push({ "Key": barCountData[i]["Key"], "Low_StressedCount": barCountData[i]["Low_StressedCount"], "Moderately_StressedCount": barCountData[i]["Moderately_StressedCount"], "Highly_StressedCount": barCountData[i]["Highly_StressedCount"], "Over_StressedCount": barCountData[i]["Over_StressedCount"], "Beyond_Minimum_TempCount": barCountData[i]["Beyond_Minimum_TempCount"], "UnanalyzedCount": barCountData[i]["UnanalyzedCount"], "TotalCount": barCountData[i]["TotalCount"] });
			barCountData.splice(i, 1);
		}
	}
	// 2. Now remove the devices that are truly outliers and bars cannot be drawn for those.
	for (let i = barCountData.length - 1; i >= 0; --i) {
		if (barCountData[i]["TotalCount"] / totalDevCount < 0.02) {
			outlierCountData.push({ "Key": barCountData[i]["Key"], "Low_StressedCount": barCountData[i]["Low_StressedCount"], "Moderately_StressedCount": barCountData[i]["Moderately_StressedCount"], "Highly_StressedCount": barCountData[i]["Highly_StressedCount"], "Over_StressedCount": barCountData[i]["Over_StressedCount"], "Beyond_Minimum_TempCount": barCountData[i]["Beyond_Minimum_TempCount"], "UnanalyzedCount": barCountData[i]["UnanalyzedCount"], "TotalCount": barCountData[i]["TotalCount"] });
			barCountData.splice(i, 1);
		}
	}
	outlierCountData.sort(function (a, b) { return -1 * (b["TotalCount"] - a["TotalCount"]); }); // Sort ascending
	return {
		barCount: barCountData,
		outlierCount: outlierCountData
	};
}

function drawTemperatureTabs() {
	var tempdivElem = document.querySelector("#temperaturetabs");
	if (tempdivElem) {
		var isFirst = true;
		var index = 0;
		for (var i = 0; i < jsondata.length; ++i) {
			var newItem = document.createElement("a");
			newItem.setAttribute('href', '#');
			if (isFirst == true) {
				newItem.setAttribute('class', 'active');
				isFirst = false;
			}
			newItem.innerHTML = jsondata[i]["OpTemp"] + "&nbsp;&#8451;";
			newItem.style.display = "inline";
			tempdivElem.appendChild(newItem);
			index++;
		}
		firstVisibleTemperatureIndex = 0;
		lastVisibleTemperatureIndex = index - 1;
	}
	redrawTemperatureTabs(); // Show/hide based on width available
}

function drawDeviceTables() {

	var emptyAnalyzedTableElem = document.getElementById("empty-main-table");
	emptyAnalyzedTableElem.style.display = "none";
	var emptyUnanalyzedTableElem = document.getElementById("empty-alt-table");
	emptyUnanalyzedTableElem.style.display = "none";

	reliabilityDashboardApp.controller("deviceStressController", function ($scope, $filter, NgTableParams, ngTableEventsChannel) {
		$scope.colhide = false;
		$scope.toggleColumn = function () {
			$scope.colhide = !$scope.colhide;
			if ($scope.colhide && $scope.showEstimatedPeakValueInfoPopup) {
				document.getElementById('estimatedPeakValueTitle').innerHTML = getTranslatedString('infobartextheader');
				document.getElementById('estimatedpeakvaluetext').innerHTML = getTranslatedString('estimatedPeakValuetext');
				document.getElementById('estimatedpeakvaluetextid').innerHTML = getTranslatedString('estimatedpeakvaluetextid');
				document.getElementById('estimatedPeakValueDiv').style.display = 'block';
				addClass('estimatedPeakValueDiv', 'fadingIn');
			}
		}
		$scope.showEstimatedPeakValueInfoPopup = true;
		$scope.handleEstimatedPeakValueInfoPopup = function () {
			$scope.showEstimatedPeakValueInfoPopup = !$scope.showEstimatedPeakValueInfoPopup;
		}
		$scope.filtermode = false;
		$scope.highlightcompmode = true;
		$scope.resetStressLevelEnabled = 0;
		$scope.status = { isopen: false };
		$scope.toggleDropdown = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.status.isopen = !$scope.status.isopen;
		};

	$scope.onAfterReloadData = function(){
		setTimeout(function(){
			document.body.style.cursor = 'default';
			if(!localizeOnInit)
				localize(locale, localeFont);
		}, 0);
	}

		ngTableEventsChannel.onAfterReloadData($scope.onAfterReloadData, $scope);

		$scope.analyzedData = getStressData();
		$scope.unanalyzedData = getUnanalyzedData();
		$scope.unanalyzedDevicesCount = getUnanalyzedData().length;
		$scope.totalDevicesCount = totalAnalyzedDevicesCount() + $scope.unanalyzedDevicesCount;
		$scope.filteredData = [];
		$scope.doughnutSelection = [];
		$scope.barChartSelection = [];
		$scope.globalSearch = '';
		$scope.searchText = "";
		$scope.collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
		$scope.selectedId = null;
		$scope.selectedComponent = null;
		$scope.barLimit = 25;
		$scope.increaseLimit = function () {
			$scope.barLimit += 25;
		}
		
		$scope.handleMouseEnterEvent = function () {
			var tabletooltipelem = document.querySelector(".tabledatatooltip");
			tabletooltipelem.style.display = 'inline-block';

		}
		$scope.handleMouseLeaveEvent = function () {
			var tabletooltipelem = document.querySelector(".tabledatatooltip");
			tabletooltipelem.style.display = 'none';
		}
		$scope.handleMouseOverEvent = function (columnname, $event) {
			var tooltipcontent = "";
			if (columnname === 'Device') {
				tooltipcontent = getTranslatedString('devicetypecoltooltippart1') + this.row["Device"] + getTranslatedString('devicetypecoltooltippart2');
			} else if (columnname === 'Component') {
				switch (this.row["StressCategory"]) {
					case "Low":
						tooltipcontent += getTranslatedString('comprefdescoltooltippart2');
						break;
					case "Moderate":
						tooltipcontent += getTranslatedString('comprefdescoltooltippart3');
						break;
					case "Over":
						tooltipcontent += getTranslatedString('comprefdescoltooltippart4');
						break;
					case "Frozen":
						tooltipcontent += getTranslatedString('comprefdescoltooltippart5');
						break;
				};
				tooltipcontent += "\n" + getTranslatedString('invalidvaluetoolttippart1') + this.row["Component"] + getTranslatedString('invalidvaluetoolttippart2');
			} else if (columnname === 'Parameter') {
				tooltipcontent = getTranslatedString('paramcoltooltippart1') + this.row["Parameter"];
				var unitsMsg = "";
				var descriptionMsg = "";
				var param = this.row["Parameter"];
				for (var i = 0; i < paramsjsondata.length; ++i) {
					if (paramsjsondata[i].Name == param) {
						var unitsMsg;
						switch (paramsjsondata[i].Unit) {
							case "Amp":
								unitsMsg = "\n" + getTranslatedString('paramcoltooltippart4') + "Amperes";
								break;
							case "V":
								unitsMsg = "\n" + getTranslatedString('paramcoltooltippart4') + "Volts";
								break;
							case "W":
								unitsMsg = "\n" + getTranslatedString('paramcoltooltippart4') + "Watts";
								break;
							case "C":
								unitsMsg = "\n" + getTranslatedString('paramcoltooltippart4') + "Celsius";
								break;
							default:
								unitsMsg = "\n" + getTranslatedString('paramcoltooltippart4') + paramsjsondata[i].Unit;
								break;
						}
						descriptionMsg = "\n" + getTranslatedString('paramcoltooltippart2') + paramsjsondata[i].Description;
						tooltipcontent += descriptionMsg;
						tooltipcontent += unitsMsg;
					}
				}
			} else if (columnname === 'RMSMax') {
				tooltipcontent = getTranslatedString('maxrmscoltooltippart1') + this.row["RMSMax"];
			} else if (columnname === 'RMSDerating') {
				var deratingfactor = this.row["RMSDerating"] / 100;
				deratingfactor = deratingfactor.toPrecision(2);
				tooltipcontent = getTranslatedString('deratingfactorcoltooltip');
			} else if (columnname === 'RMSMeasured') {
				var rmsMeasured = this.row["RMSMeasured"];
				if (rmsMeasured === none)
					tooltipcontent = getTranslatedString('rmsmescoltooltippart2');
				else
					tooltipcontent = getTranslatedString('rmsmescoltooltippart1') + rmsMeasured;// "The estimated RMS value of " + this.row["Parameter"] + " is " + this.row["RMSMeasured"];
			} else if (columnname === 'RMSPercentage') {
				var paramStress = "Safe";
				var rmsPercentage;
				if (this.row["RMSPercentage"] === none)
					tooltipcontent = getTranslatedString('rmsperccoltooltippart8');
				else {
					rmsPercentage = valueformatter.format(this.row["RMSPercentage"]);
					if (this.row["RMSPercentage"] > 999)
						rmsPercentage = 1000;
					if (this.row["RMSPercentage"] < 1)
						rmsPercentage = 0;
					if (this.row["RMSPercentage"] > this.row["OverLevel"]) { paramStress = "Over"; } else if (this.row["RMSPercentage"] > this.row["SafeLevel"]) { paramStress = "Moderate"; }

					tooltipcontent = getTranslatedString('rmsperccoltooltippart1') + rmsPercentage;
					tooltipcontent += "%";
					tooltipcontent += "\n " + getTranslatedString('rmsperccoltooltippart2') + this.row["SafeLevel"] + "% " + getTranslatedString('rmsperccoltooltippart3') + this.row["OverLevel"] + "%";
					switch (paramStress) {
						case "Safe":
							tooltipcontent += "\n" + getTranslatedString('rmsperccoltooltippart4');
							break;
						case "Moderate":
							tooltipcontent += "\n" + getTranslatedString('rmsperccoltooltippart5');
							break;
						case "Over":
							tooltipcontent += "\n" + getTranslatedString('rmsperccoltooltippart6');
							break;
					}
				}
			} else if (columnname === 'Reason') {
				tooltipcontent = getTranslatedString('unanalyzedreasontooltip');
			}
			var tabletooltipelem = document.querySelector(".tabledatatooltip");
			tabletooltipelem.innerHTML = tooltipcontent;
			tabletooltipelem.style.top = $event.clientY + 20 + 'px';
			tabletooltipelem.style.left = $event.clientX + 20 + 'px';
		}

		$scope.refreshTable = function () {
			var tableelem;
			var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
			var showpeakValue = document.querySelector("#tablecolsummary");
			if (showpeakValue) {
				if (togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
					showpeakValue.style.display = 'none';
				else
					showpeakValue.style.display = 'block';
			}
			if (togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
				tableelem = document.getElementById("alttable");
			else
				tableelem = document.getElementById("maindataTable");
			var displaystate = tableelem.style.display;
			tableelem.style.display = 'none';
			if (togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
				$scope.unanalyzedtableParams.reload();
			else
				$scope.analyzedtableParams.reload();
			tableelem.style.display = displaystate;
		}
		$scope.singleClickAction = function (row) {
			$scope.selectedId = this.$id;
			$scope.selectedComponent = row.Component;
		}
		$scope.isSelected = function () {
			if ($scope.selectedId === this.$id) {
				return true;
			}
			return false;
		}

		$scope.doubleClickAction = function (row) {
			var Component = row.Component;
			for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
				if (Component === canonicalpathsjsondata[i].Name) {
					if ($scope.highlightcompmode) {
						var hostFunction = "sdaReliability::crossprobeComponent";
						var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].Name + "\" 0";
						callTcl(hostFunction, params, null);
					} else {
						var hostFunction = "sdaReliability::crossprobeComponent";
						var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].Name + "\" 1";
						callTcl(hostFunction, params, null);
					}
					break;
				}
			}
		}

		

		// Implement the global filter for the controller's device stress table data
		$scope.filter = function () {

			var analyzeddata = true;
			var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
			if (togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
				analyzeddata = false;

			var data;
			if (analyzeddata)
				data = $scope.analyzedData;
			else
				data = $scope.unanalyzedData;

			$scope.filteredData = [];
			var chart_filter_results = [];

			// 1. Apply the chart based filters first
			if ($scope.doughnutSelection.length != 0) { // 1a. Apply the design summary filters here
				for (var k = 0; k < $scope.doughnutSelection.length; ++k) {
					for (var j = 0; j < data.length; ++j) {
						if (analyzeddata) {
							if (data[j].StressCategory == $scope.doughnutSelection[k]) {
								chart_filter_results.push(data[j]);
							}
						} else {
							if (-1 !== $scope.doughnutSelection[k].indexOf(data[j].Device))
								chart_filter_results.push(data[j]);
							if (-1 !== $scope.doughnutSelection[k].indexOf("Ignored")) {
								if (data[j].Device !== "IC" &&
									data[j].Device !== "Mechanical" &&
									data[j].Device !== "Connector" &&
									data[j].Device !== "Unknown")
									chart_filter_results.push(data[j]);
							}
						}
					}
				}
			} else if ($scope.barChartSelection.length != 0) { // 1b. Apply the device summary filters here
				for (var j = 0; j < data.length; ++j) {
					for (var k = 0; k < $scope.barChartSelection.length; ++k) {
						if ($scope.barChartSelection[k].includes(data[j].Device) && $scope.barChartSelection[k].includes(data[j].StressCategory)) {
							chart_filter_results.push(data[j]);
							break;
						}
					}
				}
			}


			// 1c. If nothing was selected in charts filter, then just copy the data assuming everything is selected
			if (chart_filter_results.length == 0) {
				chart_filter_results = angular.copy(data);
			}

			// 2. Apply global search filters now
			var searchText = $scope.searchText;
			var tokens = [];
			if (searchText.length > 0) {
				tokens = searchText.split(/\s+/);
			}
			var regExPatterns = [];
			for (var j = 0; j < tokens.length; ++j) {
				try { regExPatterns[j] = new RegExp(tokens[j], 'i'); } catch (e) { regExPatterns[j] = new RegExp(/.*/); }
			}
			var searchProperties = ["Device", "Component", "StressCategory", "Parameter", "ParameterCategory", "RMSMax", "RMSMeasured", "PeakMeasured", "RMSPercentage","Reason","SubcktNum"];
			var global_filter_results = [];
			for (var i = 0; i < chart_filter_results.length; ++i) {
				if (tokens.length > 0) {
					if ($scope.filtermode == false) {
						var match = false;
						var rowdata = chart_filter_results[i];
						for (var k = 0; k < searchProperties.length; ++k) {
							var prop = searchProperties[k];
							if (rowdata.hasOwnProperty(prop)) {
								for (var j = 0; j < regExPatterns.length; ++j) {
									if (regExPatterns[j].test(rowdata[prop])) { // A token matched, set the flag to true and break
										match = true;
										break;
									}
								}
							}
							if (match) {
								break;
							}
						}
						if (match) { // A token matched, add the row
							global_filter_results.push(rowdata);
						}
					} else {
						var match = false;
						var matchcount = 0;
						var rowdata = chart_filter_results[i];
						for (var j = 0; j < regExPatterns.length; ++j) {
							for (var k = 0; k < searchProperties.length; ++k) {
								var prop = searchProperties[k];
								if (rowdata.hasOwnProperty(prop)) {
									if (regExPatterns[j].test(rowdata[prop])) { // A token matched, record it
										matchcount++;
										break;
									}
								}
							}
						}
						if (matchcount == tokens.length) // Every token was found in the row
							match = true;
						if (match) { // A token matched, add the row
							global_filter_results.push(rowdata);
						}
					}
				} else { // No token to match, just add the row
					global_filter_results.push(chart_filter_results[i]);
				}

			}

			//	Now use build-in angular filter for column filter					
			var column_filter_results = [];
			if (analyzeddata) {
				var orderBy = $scope.analyzedtableParams.orderBy();
				column_filter_results = $scope.analyzedtableParams.filter() ? $filter('filter')(global_filter_results, $scope.analyzedtableParams.filter()) : global_filter_results;
				column_filter_results = $scope.analyzedtableParams.sorting() ? $filter('orderBy')(column_filter_results, orderBy, false, $scope.localeSensitiveComparator) : column_filter_results;
				$scope.analyzedtableParams.total(column_filter_results.length);
				$scope.filteredData = column_filter_results;
			} else {
				var orderBy = $scope.unanalyzedtableParams.orderBy();
				column_filter_results = $scope.unanalyzedtableParams.filter() ? $filter('filter')(global_filter_results, $scope.unanalyzedtableParams.filter()) : global_filter_results;
				column_filter_results = $scope.unanalyzedtableParams.sorting() ? $filter('orderBy')(column_filter_results, orderBy, false, $scope.localeSensitiveComparator) : column_filter_results;
				$scope.unanalyzedtableParams.total(column_filter_results.length);
				$scope.filteredData = column_filter_results;
			}
			if (analyzeddata) {
				if ($scope.filteredData.length == 0)
					emptyAnalyzedTableElem.style.display = "block";
				else
					emptyAnalyzedTableElem.style.display = "none";
			} else {
				if ($scope.filteredData.length == 0)
					emptyUnanalyzedTableElem.style.display = "block";
				else
					emptyUnanalyzedTableElem.style.display = "none";
			}

			if ($scope.filteredData.length != data.length || $scope.doughnutSelection.length || $scope.doughnutSelection.length || $scope.searchText) {
				var clearfilterelem = document.getElementById('filtercontrol');
				if (clearfilterelem) {
					clearfilterelem.classList.add('enableclearfilter');
				}
			}
			else {
				var clearfilterelem = document.getElementById('filtercontrol');
				if (clearfilterelem) {
					clearfilterelem.classList.remove('enableclearfilter');
				}
			}
			var tablesummaryelem = document.getElementById('tablesummary');
			if (tablesummaryelem)
				tablesummaryelem.innerHTML = getTranslatedString('filtertext1') + $scope.filteredData.length + getTranslatedString('filtertext2') + data.length + getTranslatedString('filtertext3');
			return true;
		}

		// Implement the menu options and their handlers
		$scope.analyzedMenuOptions = [
			{
				text: getTranslatedString('highlightcomponentmenutext'),
				click: function ($itemScope, $event, modelValue, text, $li) {
					var Component = $itemScope.row.Component;
					for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
						if (Component === canonicalpathsjsondata[i].Name) {
							var hostFunction = "sdaReliability::crossprobeComponent";
							var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].Name + "\" 0";
							callTcl(hostFunction, params, null);
							break;
						}
					}
				}
			},
			{
				text: getTranslatedString('dehighlightcomponentmenutext'),
				click: function ($itemScope, $event, modelValue, text, $li) {
					var Component = $itemScope.row.Component;
					for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
						if (Component === canonicalpathsjsondata[i].Name) {
							var hostFunction = "sdaReliability::crossprobeComponent";
							var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].Name + "\" 1";
							callTcl(hostFunction, params, null);
							break;
						}
					}
				}
			},
			{
				hasTopDivider: true,
				text: getTranslatedString('highlightsubcircuitmenutext'),
				enabled: function ($itemScope) {
					var comp = $itemScope.row.Device;
					if (comp === ICStr || comp === DCDCLDOStr || comp === MechanicalStr || comp === ConnectorStr )
						return false;
					else
						return true;
				},
				click: function ($itemScope, $event, modelValue, text, $li) {
					var Component = $itemScope.row.Component;
					var params = " ";
					var compSPaths = "\"";
					var netSPaths = "\"";
					var compNames = "\"";
					var netNames = "\"";
					var first = true;
					for (var j = 0; j < subcircuitsjsondata.length; j++) {
						if (subcircuitsjsondata[j].Components.includes(Component)) {
							for (var k = 0; k < subcircuitsjsondata[j].Components.length; k++) {
								var CompElem = subcircuitsjsondata[j].Components[k];
								for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
									if (CompElem === canonicalpathsjsondata[i].Name) {
										if (!first) {
											compSPaths += ",";
											compNames += ",";
										}
										compSPaths += canonicalpathsjsondata[i].CanonicalPath;
										compNames += canonicalpathsjsondata[i].Name;
										first = false;
										break;
									}
								}
							}
							for (var k = 0; k < subcircuitsjsondata[j].Nets.length; k++) {
								var NetElem = subcircuitsjsondata[j].Nets[k];
								for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
									if (NetElem === canonicalpathsjsondata[i].Name) {
										if (!first) {
											netSPaths += ",";
											netNames += ",";
										}
										netSPaths += canonicalpathsjsondata[i].CanonicalPath;
										netNames += canonicalpathsjsondata[i].Name;
										first = false;
										break;
									}
								}
							}
							break;
						}
					}
					compSPaths += "\"";
					netSPaths += "\"";
					compNames += "\"";
					netNames += "\"";
					params += compSPaths + " " + compNames + " " + netSPaths + " " + netNames + " 0";
					var hostFunction = "sdaReliability::crossprobeSubcircuit";
					callTcl(hostFunction, params, null);
				}
			},
			{
				text: getTranslatedString('dehighlightsubcircuitmenutext'),
				enabled: function ($itemScope) {
					var comp = $itemScope.row.Device;
					if (comp === ICStr || comp === DCDCLDOStr || comp === MechanicalStr || comp === ConnectorStr )
						return false;
					else
						return true;
				},
				click: function ($itemScope, $event, modelValue, text, $li) {
					var Component = $itemScope.row.Component;
					var params = " ";
					var compSPaths = "\"";
					var netSPaths = "\"";
					var compNames = "\"";
					var netNames = "\"";
					var first = true;
					for (var j = 0; j < subcircuitsjsondata.length; j++) {
						if (subcircuitsjsondata[j].Components.includes(Component)) {
							for (var k = 0; k < subcircuitsjsondata[j].Components.length; k++) {
								var CompElem = subcircuitsjsondata[j].Components[k];
								for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
									if (CompElem === canonicalpathsjsondata[i].Name) {
										if (!first) {
											compSPaths += ",";
											compNames += ",";
										}
										compSPaths += canonicalpathsjsondata[i].CanonicalPath;
										compNames += canonicalpathsjsondata[i].Name;
										first = false;
										break;
									}
								}
							}
							for (var k = 0; k < subcircuitsjsondata[j].Nets.length; k++) {
								var NetElem = subcircuitsjsondata[j].Nets[k];
								for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
									if (NetElem === canonicalpathsjsondata[i].Name) {
										if (!first) {
											netSPaths += ",";
											netNames += ",";
										}
										netSPaths += canonicalpathsjsondata[i].CanonicalPath;
										netNames += canonicalpathsjsondata[i].Name;
										first = false;
										break;
									}
								}
							}
							break;
						}
					}
					compSPaths += "\"";
					netSPaths += "\"";
					compNames += "\"";
					netNames += "\"";
					params += compSPaths + " " + compNames + " " + netSPaths + " " + netNames + " 1";
					var hostFunction = "sdaReliability::crossprobeSubcircuit";
					callTcl(hostFunction, params, null);
				}
			},
			{
				hasTopDivider: true,
				text: getTranslatedString('configcontroltooltip'),
				click: function ($itemScope, $event, modelValue, text, $li) {
					$scope.selectedId = $itemScope.id;
					$scope.selectedComponent = $itemScope.row.Component;
					clickConfigControl();
				}
			}
		];

		$scope.unanalyzedMenuOptions = [
			{
				text: 'Highlight Component',
				click: function ($itemScope, $event, modelValue, text, $li) {
					var Component = $itemScope.row.Component;
					for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
						if (Component === canonicalpathsjsondata[i].Name) {
							var hostFunction = "sdaReliability::crossprobeComponent";
							var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].Name + "\" 0";
							callTcl(hostFunction, params, null);
							break;
						}
					}
				}
			},
			{
				text: 'Dehighlight Component',
				click: function ($itemScope, $event, modelValue, text, $li) {
					var Component = $itemScope.row.Component;
					for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
						if (Component === canonicalpathsjsondata[i].Name) {
							var hostFunction = "sdaReliability::crossprobeComponent";
							var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].Name + "\" 1";
							callTcl(hostFunction, params, null);
							break;
						}
					}
				}
			},
			{
				hasTopDivider: true,
				text: getTranslatedString('highlightsubcircuitmenutext'),
				enabled: function ($itemScope) {
					var comp = $itemScope.row.Device;
					if (comp === ICStr || comp === DCDCLDOStr || comp === MechanicalStr || comp === ConnectorStr )
						return false;
					else
						return true;
				},
				click: function ($itemScope, $event, modelValue, text, $li) {
					var Component = $itemScope.row.Component;
					var params = " ";
					var compSPaths = "\"";
					var netSPaths = "\"";
					var compNames = "\"";
					var netNames = "\"";
					var first = true;
					for (var j = 0; j < subcircuitsjsondata.length; j++) {
						if (subcircuitsjsondata[j].Components.includes(Component)) {
							for (var k = 0; k < subcircuitsjsondata[j].Components.length; k++) {
								var CompElem = subcircuitsjsondata[j].Components[k];
								for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
									if (CompElem === canonicalpathsjsondata[i].Name) {
										if (!first) {
											compSPaths += ",";
											compNames += ",";
										}
										compSPaths += canonicalpathsjsondata[i].CanonicalPath;
										compNames += canonicalpathsjsondata[i].Name;
										first = false;
										break;
									}
								}
							}
							for (var k = 0; k < subcircuitsjsondata[j].Nets.length; k++) {
								var NetElem = subcircuitsjsondata[j].Nets[k];
								for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
									if (NetElem === canonicalpathsjsondata[i].Name) {
										if (!first) {
											netSPaths += ",";
											netNames += ",";
										}
										netSPaths += canonicalpathsjsondata[i].CanonicalPath;
										netNames += canonicalpathsjsondata[i].Name;
										first = false;
										break;
									}
								}
							}
							break;
						}
					}
					compSPaths += "\"";
					netSPaths += "\"";
					compNames += "\"";
					netNames += "\"";
					params += compSPaths + " " + compNames + " " + netSPaths + " " + netNames + " 0";
					var hostFunction = "sdaReliability::crossprobeSubcircuit";
					callTcl(hostFunction, params, null);
				}
			},
			{
				text: getTranslatedString('dehighlightsubcircuitmenutext'),
				enabled: function ($itemScope) {
					var comp = $itemScope.row.Device;
					if (comp === ICStr || comp === DCDCLDOStr || comp === MechanicalStr || comp === ConnectorStr )
						return false;
					else
						return true;
				},
				click: function ($itemScope, $event, modelValue, text, $li) {
					var Component = $itemScope.row.Component;
					var params = " ";
					var compSPaths = "\"";
					var netSPaths = "\"";
					var compNames = "\"";
					var netNames = "\"";
					var first = true;
					for (var j = 0; j < subcircuitsjsondata.length; j++) {
						if (subcircuitsjsondata[j].Components.includes(Component)) {
							for (var k = 0; k < subcircuitsjsondata[j].Components.length; k++) {
								var CompElem = subcircuitsjsondata[j].Components[k];
								for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
									if (CompElem === canonicalpathsjsondata[i].Name) {
										if (!first) {
											compSPaths += ",";
											compNames += ",";
										}
										compSPaths += canonicalpathsjsondata[i].CanonicalPath;
										compNames += canonicalpathsjsondata[i].Name;
										first = false;
										break;
									}
								}
							}
							for (var k = 0; k < subcircuitsjsondata[j].Nets.length; k++) {
								var NetElem = subcircuitsjsondata[j].Nets[k];
								for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
									if (NetElem === canonicalpathsjsondata[i].Name) {
										if (!first) {
											netSPaths += ",";
											netNames += ",";
										}
										netSPaths += canonicalpathsjsondata[i].CanonicalPath;
										netNames += canonicalpathsjsondata[i].Name;
										first = false;
										break;
									}
								}
							}
							break;
						}
					}
					compSPaths += "\"";
					netSPaths += "\"";
					compNames += "\"";
					netNames += "\"";
					params += compSPaths + " " + compNames + " " + netSPaths + " " + netNames + " 1";
					var hostFunction = "sdaReliability::crossprobeSubcircuit";
					callTcl(hostFunction, params, null);
				}
			},
			{
				hasTopDivider: true,
				text: getTranslatedString('configcontroltooltip'),
				click: function ($itemScope, $event, modelValue, text, $li) {
					$scope.selectedId = $itemScope.id;
					$scope.selectedComponent = $itemScope.row.Component;
					clickConfigControl();
				}
			}
		];

		$scope.analyzedtableParams = new NgTableParams(
			{
				count: $scope.filteredData.length,
				sorting: { 'RMSPercentage': 'desc' }
			},
			{
				counts: [],
				dataset: $scope.analyzedData,
				getData: function (params) {
					document.body.style.cursor = 'progress';
					$scope.filter(); // Apply global filter
					return $scope.filteredData;
				}
			}
		);

		$scope.unanalyzedtableParams = new NgTableParams(
			{
				count: $scope.filteredData.length,
				sorting: { 'Device': 'asc' }
			},
			{
				counts: [],
				dataset: $scope.unanalyzedData,
				getData: function (params) {
					document.body.style.cursor = 'progress';
					$scope.filter(); // Apply global filter
					return $scope.filteredData;
				}
			}
		);

		$scope.localeSensitiveComparator = function (v1, v2) {
 			var val1 = v1.value;
 			var val2 = v2.value;
 
 			if (typeof val1 === 'string' && typeof val2 === 'string')
 			{
 				if (val1.includes(' ') && val2.includes(' '))
 				{
 					var comparableA = getComparableValue(val1);
 					var comparableB = getComparableValue(val2);
 
 					if (comparableA.value === comparableB.value) {
	 					var priorityA = unitPriority[comparableA.unit] || 0;
 						var priorityB = unitPriority[comparableB.unit] || 0;
 						return priorityA - priorityB;
	 				}
	 	 			return comparableA.value < comparableB.value ? -1 : 1;
		 		}
			  	if (v1.value === 'NA' && v2.value === 'NA') return 0;
			 	if (v1.value === 'NA') return 1;
		 		if (v2.value === 'NA') return -1;
	 			if (v1.value === v2.value)
				{
					return 0;
				}
				else {
					return $scope.collator.compare(v1.value, v2.value);
				}
			}
			// If number, compare by value
			if (v1.type === 'number' || v2.type === 'number') {
				if (v1.value === v2.value) {
					return 0;
				} else {
					return (v1.value < v2.value) ? -1 : 1;
				}
			}
			// Else just compare by index
			return (v1.index < v2.index) ? -1 : 1;
		};
		
		$scope.getDefaultValueIconDisplay = function(){
							if(this.row["USE_DEFAULT"] === 0)
								return "none";
						};

		$scope.getGradient = function (temp, value) {
			if (temp === none) {
				backgroundimage = `linear-gradient(to right, #1f78b4, #1f78b4, #1f78b4)`;
				return backgroundimage;
			}
			var backgroundimage;
			var startRed = 27;
			var startGreen = 158;
			var startBlue = 119;
			var middleRed = 230;
			var middleGreen = 171;
			var middleBlue = 2;
			var finalRed = 228;
			var finalGreen = 26;
			var finalBlue = 28;
			var stopRed;
			var stopGreen;
			var stopBlue;
			var startCol = `rgb(${startRed},${startGreen},${startBlue})`;
			if (value < 50) {
				var stopRed = Math.round(startRed + ((value / 50) * (middleRed - startRed)));
				var stopGreen = Math.round(startGreen + ((value / 50) * (middleGreen - startGreen)));
				var stopBlue = middleBlue;

				var stopCol = `rgb(${stopRed},${stopGreen},${stopBlue})`;
				backgroundimage = `linear-gradient(to right, ${startCol} 0%, ${stopCol} 100%)`;
			}
			else {
				var middleCol = `rgb(${middleRed},${middleGreen},${middleBlue})`;
				var stopRed = Math.round(middleRed + (((value - 50) / 50) * (finalRed - middleRed)));
				var stopGreen = Math.round(middleGreen + (((value - 50) / 50) * (finalGreen - middleGreen)));
				var stopBlue = finalBlue;
				var stopCol = `rgb(${stopRed},${stopGreen},${stopBlue})`;
				backgroundimage = `linear-gradient(to right, ${startCol} 0%, ${middleCol} 50%, ${stopCol} 100%)`;
			}
			return backgroundimage;
		};
		
		$scope.getStressCategoryColor = function () {
			var stresscolor = 'white';
			switch (this.row["StressCategory"]) {
				case "Low":
					stresscolor = '#1b9e77';
					break;
				case "Moderate":
					stresscolor = '#e6ab02';
					break;
				case "High":
					stresscolor = '#e85d04';
					break;
				case "Over":
					stresscolor = '#e41a1c';
					break;
				case "Frozen":
					stresscolor = '#1f78b4';
					break;
			};
			return stresscolor;
		};
	});

	reliabilityDashboardApp.filter('range', function () {
		return function (value) {
			if (value === none)
				value = 100.0;
			if (typeof value !== 'undefined') {
				if (value < 0.0) value = 0.0;
				if (value > 100.0) value = 100.0;
			}
			return value;
		}
	});
	reliabilityDashboardApp.filter('exponential', function () {
		return function (value) {
			if (typeof value !== 'undefined') {
				var val;
				if (value < 1 || value > 100) {
					val = value.toExponential(3);
					var number = val.split('e');
					var num = scientificformatter.format(parseFloat(number[0]));
					val = num + "e" + number[1];
				}
				else {
					val = stdformatter.format(value);
				}
				return val;
			}
			return value;
		}
	});
	reliabilityDashboardApp.filter('valueformat', function () {
		return function (value) {
			if (value === none)
				return none;
			if (typeof value !== 'undefined') {
				var val = value;
				if (val < 1)
					val = 0;
				if (val > 999)
					val = 1000;

				val = valueformatter.format(val);
				return val;
			}
			return value;
		}
	});

	reliabilityDashboardApp.filter('fixed', function () {
		return function (value) {
			if (value === none)
				return none;
			if (typeof value !== 'undefined') {
				var val = value.toPrecision();
				val = stdformatter.format(val);
				if (val == -0.0000)
					return val.replace("-", "");
				return val;
			}
			return value;
		}
	});
}

function getChartHeaderText() {
	var doughnutChartText = getTranslatedString("designsummarytitle");
	var barChartText = getTranslatedString("devicesummarytitle");
	var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
	if (togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed")) {
		doughnutChartText = getTranslatedString("designsummarytitle");
		barChartText = getTranslatedString("devicesummarytitle");
	}
	document.getElementById("donutTitle").innerHTML = doughnutChartText;
	document.getElementById("barTitle").innerHTML = barChartText;
}

function refreshData() {
	computeStressLevels();
	var nosOfComps = computeSummary();
	return nosOfComps;
}

function refreshDashboardTable() {
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()) {
		var appScope = angElement.scope();
		appScope.analyzedData = getStressData();
		appScope.unanalyzedData = getUnanalyzedData();
	}


	var tablerefreshtriggerelem = document.getElementById('refreshStressTableTrigger');
	if (tablerefreshtriggerelem) { tablerefreshtriggerelem.click(); }

}

function refreshAll() {
	resetBarSelections();
	disableBarFilterResetButton();
	resetDonutSelections();
	disableDonutFilterResetButton();
	refreshData();
	refreshDashboardTable();
	refreshMainSummaryDonut();
	refreshMainStackedBar();
	refreshAltSummaryDonut();
	refreshAltStackedBar();
	var clearfilterelem = document.getElementById('filtercontrol');
	if (clearfilterelem) {
		clearfilterelem.classList.remove('enableclearfilter');
	}
}

function getToolTip(controlButton) {
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()) {
		var appScope = angElement.scope();
		switch (controlButton.currentTarget.id) {
			case "checkstalecontrol": {
				appScope.dynamicTooltipText = getTranslatedString('checkstalecontroltooltip');
				break;
			}
			case "configcontrol": {
				appScope.dynamicTooltipText = getTranslatedString('configcontroltooltip');
				break;
			}
			case "synccontrol": {
				appScope.dynamicTooltipText = getTranslatedString('synccontroltooltip');
				break;
			}
			case "filtercontrol": {
				var clearfilterelem = document.getElementById('filtercontrol');
				if (clearfilterelem) {
					if (clearfilterelem.classList.contains('enableclearfilter'))
						appScope.dynamicTooltipText = getTranslatedString('filtercontroltooltip2');
					else
						appScope.dynamicTooltipText = getTranslatedString('filtercontroltooltip1');
				}
				break;
			}
			case "searchmodecontrol": {
				appScope.dynamicTooltipText = getTranslatedString('searchmodetooltip');
				break;
			}
			case "chartvisibilitycontrol": {
				appScope.dynamicTooltipText = getTranslatedString('togglechartstooltip');
				break;
			}
			case "tablevisibilitycontrol": {
				appScope.dynamicTooltipText = getTranslatedString('toggletabletooltip');
				break;
			}
			case "viewvisibilitycontrol": {
				appScope.dynamicTooltipText = getTranslatedString('toggleviewtooltip');
				break;
			}
			case "disclaimervisibilitycontrol": {
				appScope.dynamicTooltipText = getTranslatedString('improvetooltip');
				break;
			}
			case "exportformatoption": {
				appScope.dynamicTooltipText = getTranslatedString('exporttooltip');
				break;
			}
		}
	}
}

function drawAll() {
	reliabilityDashboardApp = angular.module("reliabilityDashboardApp", ["ngTable", "ui.bootstrap", "ui.bootstrap.buttons", "ui.bootstrap.contextMenu", "ui.bootstrap.dropdown", "infinite-scroll"]);
	if (jsondata.length != 0) {
		var opTemp = jsondata[0]["OpTemp"];
		setActiveTemperature(opTemp);
	}
	refreshData();

	if (document.getElementById("temperatureselection")) { drawTemperatureTabs(); }
	var tablevcelem = document.getElementById('tablevisibilitycontrol');
	if (tablevcelem) { tablevcelem.classList.add('showtable'); } // Set the button state to showtable 
	var chartvcelem = document.getElementById('chartvisibilitycontrol');
	if (chartvcelem) { chartvcelem.classList.add('showchart'); } // Set the button state of show chart

	if (document.getElementById("mainsummary-donut")) {
		var donutData = computeDonutData();
		mainDonut = drawSummaryDonut(donutData,
			'#mainsummary-donut',
			{ "Low": getTranslatedString("Low"), "Moderate": getTranslatedString("Moderate"), "High": getTranslatedString("High"), "Over": getTranslatedString("Over"), "Frozen": getTranslatedString("Beyond Minimum Temp")},
			[getTranslatedString("maindonutregion"), getTranslatedString("count"), getTranslatedString("pct")],
			{
				titles: {
					"Low": getTranslatedString("lowdonuttooltiptitle"), "Moderate": getTranslatedString("moderatedonuttooltiptitle"), "High": getTranslatedString("highdonuttooltiptitle"), "Over": getTranslatedString("overdonuttooltiptitle"), "Frozen": getTranslatedString("frozendonuttooltiptitle")} },
			color_range,
			getTranslatedString("analyzeddevicestxt"),
			'#contentContainer');
	}
	if (document.getElementById("altsummary-donut")) {
		var altdonutData = computeAltDonutData();
		altDonut = drawSummaryDonut(altdonutData,
			'#altsummary-donut',
			{ "Ignored": getTranslatedString("Ignored Devices"), "Unknown": getTranslatedString("Unknown Devices"), "IC": getTranslatedString("ICs"), "Mechanical": getTranslatedString("Mechanical Devices"), "Connectors": getTranslatedString("Connectors") },
			[getTranslatedString("reason"), getTranslatedString("count"), getTranslatedString("pct")],
			{ titles: { "Ignored": getTranslatedString("ignoreddonuttooltiptitle"), "Unknown": getTranslatedString("unknowndonuttooltiptitle"), "IC": getTranslatedString("icdonuttooltiptitle"), "Mechanical": getTranslatedString("mechanicaldonuttooltiptitle"), "Connectors": getTranslatedString("connectorsdonuttooltiptitle") } },
			computeUnanalyzedSummaryColorRange(),
			getTranslatedString("devicesskipped"),
			'#contentContainer');
	}
	if (document.getElementById("mainsummary-stacked-bar"))
	{
		var data = computeStackedBarData();
		mainStackedBar = drawStackedBar(data,
			'#mainsummary-stacked-bar',
			["Low_StressedCount", "Moderately_StressedCount", "Highly_StressedCount", "Over_StressedCount", "Beyond_Minimum_TempCount","UnanalyzedCount"],
			{
				createtooltip: function (elementid) {
					createTooltipBar(elementid, displayCategories);
				},
				initializetooltip: function (elementid, d) {
					var summary = " " + getTranslatedString("stresssummary");
					if(d.data.Key === "Unknown" || d.data.Key === "Unrecognized")
						var totalposttext = " " + getTranslatedString("analyzed");
					else
						var totalposttext = "(s) " + getTranslatedString("analyzed");
					initializeTooltipBar(elementid, d, summary, totalposttext, displayCategories);
				},
				showtooltip: function (elementid, d) {
					showTooltipBar(elementid, d);
				},
				hidetooltip: function (elementid) {
					hideTooltipBar(elementid);
				}
			},
			{
				createtooltip: function (elementid, outlierCountData) {
					createtooltipoutlier(elementid, outlierCountData, displayCategories);
				},
				initializetooltip: function (elementid, outlierCountData) {
					initializetooltipoutlier(elementid, outlierCountData, displayCategories);
				},
				showtooltip: function (elementid) {
					showtooltipoutlier(elementid);
				},
				hidetooltip: function (elementid) {
					hidetooltipoutlier(elementid);
				}
			},
			color_range,
			-20,
			"Key",
			"TotalCount",
			[getTranslatedString("analyzeddevicestxt")],
			"",
			function (d) {
				var key;
				if (d[1] <= d.data.Low_StressedCount) {
					key = "Low";
				} else if (d[1] <= (d.data.Low_StressedCount + d.data.Moderately_StressedCount)) {
					key = "Moderate";
				} else if (d[1] <= (d.data.Low_StressedCount + d.data.Moderately_StressedCount + d.data.Highly_StressedCount)) {
					key = "High";
				} else if (d[1] <= (d.data.Low_StressedCount + d.data.Moderately_StressedCount + d.data.Highly_StressedCount + d.data.Over_StressedCount)) {
					key = "Over";
				} else if (d[1] <= d.data.TotalCount) {
					key = "Beyond_Minimum_Temp";
				}
				
				if(d.stackKey === "UnanalyzedCount"){
					key = "Unanalyzed";
				}
						   
				return d.data.Key + ":" + key;
			},
			'#contentContainer');
	}
	
	if (document.getElementById("altsummary-stacked-bar")) {
		var data = computeAltStackedBarData();
		altStackedBar = drawStackedBar(data,
			'#altsummary-stacked-bar',
			["TotalCount", "StartCount"],
			{
				createtooltip: function (elementid) {
					createTooltipBar(elementid, skippedDisplayCategories);
				},
				initializetooltip: function (elementid, d) {
					var summary = " " + getTranslatedString('summarytitle');
					var totalposttext = "(s) " + getTranslatedString("notanalyzed");
					initializeTooltipBar(elementid, d, summary, totalposttext, skippedDisplayCategories);
				},
				showtooltip: function (elementid, d) {
					showTooltipBar(elementid, d);
				},
				hidetooltip: function (elementid) {
					hideTooltipBar(elementid);
				}
			},
			{
				createtooltip: function (elementid, outlierCountData) {
					createtooltipoutlier(elementid, outlierCountData, skippedDisplayCategories);
				},
				initializetooltip: function (elementid, outlierCountData) {
					initializetooltipoutlier(elementid, outlierCountData, skippedDisplayCategories);
				},
				showtooltip: function (elementid) {
					showtooltipoutlier(elementid);
				},
				hidetooltip: function (elementid) {
					hidetooltipoutlier(elementid);
				}
			},
			skip_color_range,
			-20,
			"Key",
			"TotalCount",
			[getTranslatedString("devicesskipped")],
			"",
			function (d) {
				var key;
				return d.data.Key + ":" + key;
			},
			'#contentContainer');
	}
	if (document.getElementById("maindataTable")) { drawDeviceTables(); }
	initializeViews();
}

function exportPDF() {
	var hostFunction = "sdaReliability::exportReliabilityDashboardAsPdf";
	var params = " ";
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()) {
		var appScope = angElement.scope();
		var showPeakVal = appScope.colhide;
		var refdes = getRefdes();
		if(refdes)
			params = ` {-showPeakValue ${showPeakVal} -dumpPath ${dumpPathVal} -refdes ${refdes}} `;
		else
			params = ` {-showPeakValue ${showPeakVal} -dumpPath ${dumpPathVal}} `;
	}
	//	params += 50 + " " + 70; // No need to pass these as they will be ignored
	callTcl(hostFunction, params, null);
}

function exportCSV() {
	var hostFunction = "sdaReliability::exportReliabilityDashboardAsCsv";
	var params = " ";
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()) {
		var appScope = angElement.scope();
		var showPeakVal = appScope.colhide;
			var refdes = getRefdes();
		if(refdes)
			params = ` {-showPeakValue ${showPeakVal} -dumpPath ${dumpPathVal} -refdes ${refdes}} `;
		else
			params = ` {-showPeakValue ${showPeakVal} -dumpPath ${dumpPathVal}} `;
	}
	
	callTcl(hostFunction, params, null);
}

function setResultStale() {
	addClass('syncicon', 'ripple');
	document.getElementById('infosyncchecktext').innerHTML = getTranslatedString('resultstaletext');
	document.getElementById('infoSyncCheckDiv').style.display = 'block';
	addClass('infoSyncCheckDiv', 'fadingIn');
	removeClass('checkstalecontrol', 'stalecontrolactive');
}

function setResultNotStale() {
	removeClass('syncicon', 'ripple');
	document.getElementById('infosyncchecktext').innerHTML = getTranslatedString('resultnotstaletext');
	document.getElementById('infoSyncCheckDiv').style.display = 'block';
	addClass('infoSyncCheckDiv', 'fadingIn');
	removeClass('checkstalecontrol', 'stalecontrolactive');
}

function syncCheckOK() {
	removeClass('infoSyncCheckDiv', 'fadingIn');
	document.getElementById('infoSyncCheckDiv').style.display = 'none';
}
function closeEstimatedPeakValue() {
	removeClass('estimatedPeakValueDiv', 'fadingIn');
	document.getElementById('estimatedPeakValueDiv').style.display = 'none';
}

function clickCheckIfStale() {
	document.body.style.cursor = 'progress';
	addClass('checkstalecontrol', 'stalecontrolactive');
	setTimeout(checkAppDataStale, 500); // Run with 1s delay so that repaint happens.
	document.body.style.cursor = 'default';
}

function checkAppDataStale(){
	var refdes = getRefdes();
	if(refdes)
	{
		var hostFunction = "sdaReliability::isIncrementalStressDataStale";
		var params = refdes;
	}
	else
	{	
		var hostFunction = "sdaReliability::isElectricalStressDataStale";
		var params = "";
	}
    callTcl(hostFunction, params);
}

function clickConfigControl() {
	addClass('configcontrol', 'configcontrolactive');
	getDesignReadOnlyStatus(function(currentReadOnlyStatus) {
		if(currentReadOnlyStatus==='1'){
			getDesignReadOnlyReason(function(currentReadOnlyReason) {
		if(currentReadOnlyReason!=="ReadOnlyByStressSettings"){
			document.getElementById('queryIsDesignReadOnlytext').innerHTML = getTranslatedString('readonlyreason');
			document.getElementById('queryIsDesignReadOnly').style.display = 'block';
			addClass('queryIsDesignReadOnly', 'fadingIn');
		}else{
			setTimeout(runElectricalStressConfig, 300);
			removeClass('configcontrol', 'configcontrolactive');
		}
	});
		}else{
			setTimeout(runElectricalStressConfig, 300);
			removeClass('configcontrol', 'configcontrolactive');
		}
	});
}

function deactivateConfigControl() {
	removeClass('configcontrol', 'configcontrolactive');
}

function clickSyncControl() {
	addClass('synccontrol', 'syncactive');
	getDesignReadOnlyStatus(function(currentReadOnlyStatus) {
		if(currentReadOnlyStatus==='1'){
			document.getElementById('queryIsDesignReadOnlytext').innerHTML = getTranslatedString('readonlyreason');
			document.getElementById('queryIsDesignReadOnly').style.display = 'block';
			addClass('queryIsDesignReadOnly', 'fadingIn');
			}
		else{
			var synciconelem = document.getElementById('syncicon');
			if (synciconelem){
				if (synciconelem.classList.contains("ripple")) {
					document.getElementById('querysynctext').innerHTML = getTranslatedString('needsynctext');
				} else {
					document.getElementById('querysynctext').innerHTML = getTranslatedString('donotneedsynctext');
				}
			}
			document.getElementById('querySyncDiv').style.display = 'block';
			addClass('querySyncDiv', 'fadingIn');
			
		}
	});	
}

function cancelSync() {
	removeClass('synccontrol', 'syncactive');
	removeClass('querySyncDiv', 'fadingIn');
	document.getElementById('querySyncDiv').style.display = 'none';
}

function cancelActive() {
	removeClass('synccontrol', 'syncactive');
	removeClass('configcontrol', 'configcontrolactive');
	removeClass('queryIsDesignReadOnly', 'fadingIn');
	document.getElementById('queryIsDesignReadOnly').style.display = 'none';
}

function triggerSync() {
	removeClass('querySyncDiv', 'fadingIn');
	document.getElementById('querySyncDiv').style.display = 'none';
	setTimeout(runElectricalStress, 500); // Run with 1s delay so that dialog goes away.
}

function runElectricalStress() {
	//	removeClass('syncicon','ripple');
	document.body.style.cursor = 'progress';
	var refdes = getRefdes();
	if(refdes)
	{
		var hostFunction = "::sdaReliability::runEOSOnInterfaceDevices";
		var params = refdes  + " 1" + " ELECTRICAL_STRESS_RESULT_" + refdes.toUpperCase() ;
	}
	else{
		var hostFunction = "::sdaReliability::runElectricalStress";
		var params = "1";
	}
	callTcl(hostFunction, params, null);
	removeClass('synccontrol', 'syncactive');
	document.body.style.cursor = 'default';
}

function runElectricalStressConfig() {
	document.body.style.cursor = 'progress';
	var settingsCommand = "sdaReliability::electricalStressPreferences";
	var params = "";
	var selCompSPath = "";
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()) {
		var appScope = angElement.scope();
		var Component = appScope.selectedComponent;
		if (Component) {
			for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
				if (Component === canonicalpathsjsondata[i].Name) {
					selCompSPath = canonicalpathsjsondata[i].CanonicalPath;
					break;
				}
			}
		}
	}
	if (selCompSPath === "") {
		params = "\"-display\"";
	} else {
		params = "\"-spath " + selCompSPath + "\"";
	}

	settingsCommand = settingsCommand + " " + params;
	params = ""; selCompSPath = "";
	//CCMPR03193342---sdaReliability::electricalStressPreferences is wrapped in cps::contectCall because when .brd is opened, context is switched to backend. For launching settings we need to be on schematic page context.
	var hostFunction = "cps::contextCall SCH PAGE {" + settingsCommand + "}";
	callTcl(hostFunction, params, null);
	removeClass('configcontrol', 'configcontrolactive');

	if (angElement && angElement.scope())
		appScope.selectedComponent = null;

	document.body.style.cursor = 'default';
}

getChartHeaderText();
drawAll();

// Now the document is ready... Set the page content as visible and loading element as invisible
onReady(function () {
	if (document.getElementById("disclaimervisibilitycontrol")) {
		document.getElementById("disclaimervisibilitycontrol").onclick = function () {
			addClass('disclaimervisibilitycontrol', 'disclaimeractive');
			document.getElementById('modaldisclaimerDiv').style.display = 'block';
			addClass('modaldisclaimerDiv', 'fadingIn');
		}
	}
	if (document.getElementById("closeDisclaimerBtn")) {
		document.getElementById("closeDisclaimerBtn").onclick = function () {
			removeClass('disclaimervisibilitycontrol', 'disclaimeractive');
			removeClass('modaldisclaimerDiv', 'fadingIn');
			document.getElementById('modaldisclaimerDiv').style.display = 'none';
		}
	}
	if (document.getElementById("synccontrol")) {
		document.getElementById("synccontrol").onclick = clickSyncControl;
		document.getElementById("synccontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("closeQuerySyncBtn")) {
		document.getElementById("closeQuerySyncBtn").onclick = cancelSync;
	}
	if (document.getElementById("closeQueryIsDesignReadOnlyBtn")) {
		document.getElementById("closeQueryIsDesignReadOnlyBtn").onclick = cancelActive;
	}
	
	if (document.getElementById("cancelQuerySyncBtn")) {
		document.getElementById("cancelQuerySyncBtn").onclick = cancelSync;
	}
	if (document.getElementById("triggerSyncBtn")) {
		document.getElementById("triggerSyncBtn").onclick = triggerSync;
	}
	if (document.getElementById("checkstalecontrol")) {
		document.getElementById("checkstalecontrol").onclick = clickCheckIfStale;
		document.getElementById("checkstalecontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("okSyncCheckBtn")) {
		document.getElementById("okSyncCheckBtn").onclick = syncCheckOK;
	}
	if (document.getElementById("closeInfoSyncCheckBtn")) {
		document.getElementById("closeInfoSyncCheckBtn").onclick = syncCheckOK;
	}
	if (document.getElementById("closeEstimatedPeakValueBtn")) {
		document.getElementById("closeEstimatedPeakValueBtn").onclick = closeEstimatedPeakValue;
	}
	if (document.getElementById("closeEstimatedPeakValueOkBtn")) {
		document.getElementById("closeEstimatedPeakValueOkBtn").onclick = closeEstimatedPeakValue;
	}
	if (document.getElementById("configcontrol")) {
		document.getElementById("configcontrol").onclick = clickConfigControl;
		document.getElementById("configcontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("searchmodecontrol")) {
		document.getElementById("searchmodecontrol").onclick = clickFilterModeControl;
		document.getElementById("searchmodecontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("filtercontrol")) {
		document.getElementById("filtercontrol").onclick = clickClearFilterControl;
		document.getElementById("filtercontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("chartvisibilitycontrol")) {
		document.getElementById("chartvisibilitycontrol").onclick = clickChartVisibilityControl;
		document.getElementById("chartvisibilitycontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("tablevisibilitycontrol")) {
		document.getElementById("tablevisibilitycontrol").onclick = clickTableVisibilityControl;
		document.getElementById("tablevisibilitycontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("viewvisibilitycontrol")) {
		document.getElementById("viewvisibilitycontrol").onclick = toggleChartsView;
		document.getElementById("viewvisibilitycontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("disclaimervisibilitycontrol")) {
		document.getElementById("disclaimervisibilitycontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("exportformatoption")) {
		document.getElementById("exportformatoption").onmouseover = getToolTip;
	}

	var temptabs = document.querySelectorAll("#temperaturetabs>a");
	if (temptabs) {
		for (var i = 0; i < temptabs.length; ++i) {
			var tempelem = temptabs[i];
			tempelem.onclick = function () {
				// Get the currently active temperature tab
				var activetemptab = document.querySelector("#temperaturetabs>a.active");
				if ((activetemptab == this)) { return; }
				// Remove active class from active tab and hide it's contents
				activetemptab.classList.remove("active");
				// Make this tab active
				this.classList.add("active");
				var activeTemp = this.text.replace(/[^\x00-\x7F]/g, "");
				setActiveTemperature(activeTemp);
				setTimeout(function () {
					var designsummaryelem = document.querySelector("#donutsummary-card");
					designsummaryelem.classList.add("opacitytransition");
					var devicesummaryelem = document.querySelector("#stackedBarsummary-card");
					devicesummaryelem.classList.add("opacitytransition");
					var devicetableelem = document.querySelector("#dashboardtable");
					devicetableelem.classList.add("opacitytransition");
					document.body.style.cursor = 'progress';
				}, 0);
				setTimeout(function () {
					refreshAll();
					var searchelem = document.querySelector(".form-control");
					if (searchelem.value) {
						var clearfilterelem = document.getElementById('filtercontrol');
						if (clearfilterelem) {
							clearfilterelem.classList.add('enableclearfilter');
						}
					} else {
						var clearfilterelem = document.getElementById('filtercontrol');
						if (clearfilterelem) {
							clearfilterelem.classList.remove('enableclearfilter');
						}
					}
				}, 100);
				setTimeout(function () {
					var designsummaryelem = document.querySelector("#donutsummary-card");
					designsummaryelem.classList.remove("opacitytransition");
					var devicesummaryelem = document.querySelector("#stackedBarsummary-card");
					devicesummaryelem.classList.remove("opacitytransition");
					var devicetableelem = document.querySelector("#dashboardtable");
					devicetableelem.classList.remove("opacitytransition");
					document.body.style.cursor = 'default';
				}, 300);
			}
		}
	}

	window.addEventListener("resize", redrawTemperatureTabs);
	window.addEventListener("resize", resizecharts);

	initUI();
	setupLocale(locale, localeFont);
	var loadingelem = document.getElementById('loading');
	loadingelem.style.opacity = 0;
	loadingelem.classList.add('hidden');
	var contentelem = document.getElementById('content');
	contentelem.style.opacity = 1;
	if (isresultstale) {
		addClass('syncicon', 'ripple');
	}
});
