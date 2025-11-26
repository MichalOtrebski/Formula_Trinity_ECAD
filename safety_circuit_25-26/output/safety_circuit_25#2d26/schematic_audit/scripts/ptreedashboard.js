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
var dashboardApp;
var categories_selected = [];
var PassCount;
var FailCount;
var powerRail;
var failedPowerRail;
var dataSet;
var mode = "PTREE";
var dumpPathVal="";			  
var na = "NA";
var brdFileName = "";
var for_post_layout = true;

var localizeOnInit = false;
var locale = "en";
var localeFont = "";

var ptreeStatus = {
	pass : getTranslatedString('pass'),
	fail : getTranslatedString('fail')
}

var displayCategorties = [ptreeStatus.pass.toLowerCase(), ptreeStatus.fail.toLowerCase()];
var skippedDisplayCategorties = ["Total", "Start"];
var color_range = ["#1b9e77", "#e41a1d"]; //pass:green, fail:red
var skip_color_range = ["#1f78b4", "#a6cee3"]; //skipped: blue, unknown:ligh_blue

function localize(language, font){
	stdformatter = new Intl.NumberFormat(language,standardoption);
	scientificformatter = new Intl.NumberFormat(language,scientificoption);
	i18next.changeLanguage(language);
	
	if(language != "en")
	{
		var body = document.body;
		body.style.fontFamily = font;
	}
	
	var ptTab =  document.querySelector(".navigationtabs>li>a");
	if(for_post_layout) //if dashboard is for post layout analysis
		ptTab.innerHTML = getTranslatedString('featuretitlepostlayout');
	else				//for pre layout analysis
		ptTab.innerHTML = getTranslatedString('feature1title');
	var searchInput = document.querySelector(".form-control");
	searchInput.placeholder = getTranslatedString('searchplaceholder');	
	var disclaimerTitle = document.querySelector("#disclaimertitle");
	if(disclaimerTitle){
		disclaimerTitle.innerHTML = getTranslatedString('disclaimertitle');
	}
	var disclaimerText = document.querySelector("#disclaimertext");
	if(disclaimerText){
		disclaimerText.innerHTML = getTranslatedString('disclaimertext');
	}
	var querysyncTitle = document.querySelector("#querysynctitle");
	if(querysyncTitle){
		querysyncTitle.innerHTML = getTranslatedString('querysynctitle');
	}
	var infosynccheckTitle = document.querySelector("#infosyncchecktitle");
	if(infosynccheckTitle){
		infosynccheckTitle.innerHTML = getTranslatedString('infosyncchecktitle');
	}
	var triggerSyncButton = document.querySelector("#triggerSyncBtn");
	if(triggerSyncButton){
		triggerSyncButton.innerHTML = getTranslatedString('triggerSyncBtn');
	}
	var cancelQuerySyncButton = document.querySelector("#cancelQuerySyncBtn");
	if(cancelQuerySyncButton){
		cancelQuerySyncButton.innerHTML = getTranslatedString('cancelQuerySyncBtn');
	}
	var okSyncCheckButton = document.querySelector("#okSyncCheckBtn");
	if(okSyncCheckButton){
		okSyncCheckButton.innerHTML = getTranslatedString('okSyncCheckBtn');
	}
	var queryIsDesignReadOnlyTitle = document.querySelector("#queryisdesignreadonlytitle");
	if (queryIsDesignReadOnlyTitle) {
		queryIsDesignReadOnlyTitle.innerHTML = getTranslatedString('queryisdesignreadonlytitle');
	}
	var brdfileDiv = document.querySelector("#brdFilediv");
	if(brdfileDiv){
		var brdName = boardFile;
		brdfileDiv.innerHTML = getTranslatedString('brdfiletext') + brdName.split("/").pop();
	}
	
	var devicetypeheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(1)>div");
	if (devicetypeheader){
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
	if (comprefdesheader){
		var comprefdesheadertext = getTranslatedString('comprefdesheader');
		comprefdesheader.textContent = comprefdesheadertext;
		comprefdesheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(2)");
		comprefdesheader.dataset['title'] = comprefdesheadertext;
		comprefdesheader.dataset['titleText'] = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].nodeValue = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].value = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].textContent = comprefdesheadertext;
	}
	
	var testheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(3)>div");
	if (testheader){
		var testheadertext = getTranslatedString('testheader');
		testheader.textContent = testheadertext;
		testheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(3)");
		testheader.dataset['title'] = testheadertext;
		testheader.dataset['titleText'] = testheadertext;
		testheader.attributes['data-title'].nodeValue = testheadertext;
		testheader.attributes['data-title'].value = testheadertext;
		testheader.attributes['data-title'].textContent = testheadertext;
	}
	
	var minvalheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(4)>div");
	if(minvalheader){
		var minvalheadertext = getTranslatedString('minvalheader');
		minvalheader.textContent = minvalheadertext;
		minvalheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(4)");
		minvalheader.dataset['title'] = minvalheadertext;
		minvalheader.dataset['titleText'] = minvalheadertext;
		minvalheader.attributes['data-title'].nodeValue = minvalheadertext;
		minvalheader.attributes['data-title'].value = minvalheadertext;
		minvalheader.attributes['data-title'].textContent = minvalheadertext;
	}
	
	var maxvalheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(5)>div");
	if(maxvalheader){
		var maxvalheadertext = getTranslatedString('maxvalheader');
		maxvalheader.textContent = maxvalheadertext;
		maxvalheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(5)");
		maxvalheader.dataset['title'] = maxvalheadertext;
		maxvalheader.dataset['titleText'] = maxvalheadertext;
		maxvalheader.attributes['data-title'].nodeValue = maxvalheadertext;
		maxvalheader.attributes['data-title'].value = maxvalheadertext;
		maxvalheader.attributes['data-title'].textContent = maxvalheadertext;
	}
	
	
	if(!for_post_layout)
	{
		var estimatedvalueheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(6)>div");
		if (estimatedvalueheader){
			var estimatedvalueheadertext = getTranslatedString('estimatedvalueheader');
			estimatedvalueheader.textContent = estimatedvalueheadertext;
			estimatedvalueheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(6)");
			estimatedvalueheader.dataset['title'] = estimatedvalueheadertext;
			estimatedvalueheader.dataset['titleText'] = estimatedvalueheadertext;
			estimatedvalueheader.attributes['data-title'].nodeValue = estimatedvalueheadertext;
			estimatedvalueheader.attributes['data-title'].value = estimatedvalueheadertext;
			estimatedvalueheader.attributes['data-title'].textContent = estimatedvalueheadertext;
		}
		
		var statusheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(7)>div");
		if (statusheader){
			var statusheadertext = getTranslatedString('statusheader');
			statusheader.textContent = statusheadertext;
			statusheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(7)");
			statusheader.dataset['title'] = statusheadertext;
			statusheader.dataset['titleText'] = statusheadertext;
			statusheader.attributes['data-title'].nodeValue = statusheadertext;
			statusheader.attributes['data-title'].value = statusheadertext;
			statusheader.attributes['data-title'].textContent = statusheadertext;
		}
		
		var failmarginheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(8)>div");
		if (failmarginheader){
			var marginheadertext = getTranslatedString('failmarginheader');
			failmarginheader.textContent = marginheadertext;
			failmarginheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(8)");
			failmarginheader.dataset['title'] = marginheadertext;
			failmarginheader.dataset['titleText'] = marginheadertext;
			failmarginheader.attributes['data-title'].nodeValue = marginheadertext;
			failmarginheader.attributes['data-title'].value = marginheadertext;
			failmarginheader.attributes['data-title'].textContent = marginheadertext;
		}
	}
	else
	{
		var estimatedvalueheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(6)>div");
		if (estimatedvalueheader){
			var estimatedvalueheadertext = getTranslatedString('prelayoutresultheader');
			estimatedvalueheader.textContent = estimatedvalueheadertext;
			estimatedvalueheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(6)");
			estimatedvalueheader.dataset['title'] = estimatedvalueheadertext;
			estimatedvalueheader.dataset['titleText'] = estimatedvalueheadertext;
			estimatedvalueheader.attributes['data-title'].nodeValue = estimatedvalueheadertext;
			estimatedvalueheader.attributes['data-title'].value = estimatedvalueheadertext;
			estimatedvalueheader.attributes['data-title'].textContent = estimatedvalueheadertext;
		}
		
		var actualvalueheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(7)>div");
		if (statusheader){
			var actualvalueheadertext = getTranslatedString('actualvalueheader');
			actualvalueheader.textContent = actualvalueheadertext;
			actualvalueheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(7)");
			actualvalueheader.dataset['title'] = actualvalueheadertext;
			actualvalueheader.dataset['titleText'] = actualvalueheadertext;
			actualvalueheader.attributes['data-title'].nodeValue = actualvalueheadertext;
			actualvalueheader.attributes['data-title'].value = actualvalueheadertext;
			actualvalueheader.attributes['data-title'].textContent = actualvalueheadertext;
		}
		
		var statusheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(8)>div");
		if (statusheader){
			var statusheadertext = getTranslatedString('statusheader');
			statusheader.textContent = statusheadertext;
			statusheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(8)");
			statusheader.dataset['title'] = statusheadertext;
			statusheader.dataset['titleText'] = statusheadertext;
			statusheader.attributes['data-title'].nodeValue = statusheadertext;
			statusheader.attributes['data-title'].value = statusheadertext;
			statusheader.attributes['data-title'].textContent = statusheadertext;
		}
		
		var failmarginheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(9)>div");
		if (failmarginheader){
			var marginheadertext = getTranslatedString('failmarginheader');
			failmarginheader.textContent = marginheadertext;
			failmarginheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(9)");
			failmarginheader.dataset['title'] = marginheadertext;
			failmarginheader.dataset['titleText'] = marginheadertext;
			failmarginheader.attributes['data-title'].nodeValue = marginheadertext;
			failmarginheader.attributes['data-title'].value = marginheadertext;
			failmarginheader.attributes['data-title'].textContent = marginheadertext;
		}
	}
	
	devicetypeheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(1)>div");
	if (devicetypeheader){
		var deviceheadertext = getTranslatedString('devtypeheader');
		devicetypeheader.textContent = deviceheadertext;
		devicetypeheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(1)");
		devicetypeheader.dataset['title'] = deviceheadertext;
		devicetypeheader.dataset['titleText'] = deviceheadertext;
		devicetypeheader.attributes['data-title'].nodeValue = deviceheadertext;
		devicetypeheader.attributes['data-title'].value = deviceheadertext;
		devicetypeheader.attributes['data-title'].textContent = deviceheadertext;
	}
	
	comprefdesheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(2)>div");
	if (comprefdesheader){
		var comprefdesheadertext = getTranslatedString('comprefdesheader');
		comprefdesheader.textContent = comprefdesheadertext;
		comprefdesheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(2)");
		comprefdesheader.dataset['title'] = comprefdesheadertext;
		comprefdesheader.dataset['titleText'] = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].nodeValue = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].value = comprefdesheadertext;
		comprefdesheader.attributes['data-title'].textContent = comprefdesheadertext;
	}
	
	var reasonheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(3)>div");
	if (reasonheader){
		var reasonheadertext = getTranslatedString('reasonheader');
		reasonheader.textContent = reasonheadertext;
		reasonheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(3)");
		reasonheader.dataset['title'] = reasonheadertext;
		reasonheader.dataset['titleText'] = reasonheadertext;
		reasonheader.attributes['data-title'].nodeValue = reasonheadertext;
		reasonheader.attributes['data-title'].value = reasonheadertext;
		reasonheader.attributes['data-title'].textContent = reasonheadertext;
	}

	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		appScope.mainTableMenuOptions[0].text = getTranslatedString("highlightcomponentmenutext");
		appScope.mainTableMenuOptions[1].text = getTranslatedString("dehighlightcomponentmenutext");
		if (for_post_layout) {
			appScope.mainTableMenuOptions[2].text = getTranslatedString("highlighttopologymenutext");
			appScope.mainTableMenuOptions[3].text = getTranslatedString("configcontroltooltip");
			appScope.mainTableMenuOptions[4].text = getTranslatedString("highlightlayoutcomponentmenutext");
			appScope.mainTableMenuOptions[5].text = getTranslatedString("dehighlightlayoutcomponentmenutext");
		}
		else {
			appScope.mainTableMenuOptions[2].text = getTranslatedString("highlighttopologymenutext");
			appScope.mainTableMenuOptions[3].text = getTranslatedString("configcontroltooltip");
		}
		appScope.altTableMenuOptions[0].text = getTranslatedString("highlightcomponentmenutext");
		appScope.altTableMenuOptions[1].text = getTranslatedString("dehighlightcomponentmenutext");
		appScope.altTableMenuOptions[2].text = getTranslatedString("highlighttopologymenutext");
		appScope.altTableMenuOptions[3].text = getTranslatedString("configcontroltooltip");
	}
	refreshAll();
	localizeOnInit = true;
}

function getData(){
	//check if we have boardFile defined in the data
	//if it is present, dashboard needs to be for post-layout, pre-layout otherwise
	if (typeof boardFile === 'undefined' || boardFile === null)
		for_post_layout = false;
	else
	{
		for_post_layout = true;
		mode = "POSTTREE";
		brdFileName = boardFile;
	}

	if(!dashboardData.length)
		return 0;
	
	for(var i = 0; i < dashboardData.length; ++i){
		if(powerRail == dashboardData[i].powerRail){
			for(var j = 0; j < dashboardData[i].powerRailData.length; ++j){
				if(dataSet == dashboardData[i].powerRailData[j].dataLevel)
					return dashboardData[i].powerRailData[j]["deviceData"];
			}
		}
	}
}

function getUnanalyzedData(){
	if(!failedrailjsondata.length){
		var data = [];
		return data;
	}
	
	for(var i = 0; i < failedrailjsondata.length; ++i){
		if(failedPowerRail == failedrailjsondata[i].powerRail){
			return failedrailjsondata[i]["powerRailData"];
		}
	}
}

function computeData() {
	var data = getData();
	
	if(!data.length){
		data = [];
		return data;
	}
	return data;
}

function setActiveDataSet(activeRail, activeDataSet){
	powerRail = activeRail;
	dataSet = activeDataSet;
}

function computeDonutData(){
	var devs = {};
	PassCount = 0;
	FailCount = 0;
	
	var data = computeData();
	
	var check = data.forEach(obj => {
		var device = obj.Component_Refdes.split(".").shift();
		var deviceStatus = obj.Pass_Status;
		if(deviceStatus === ptreeStatus.pass)
			obj.Fail_Margin = na;
		if (!devs.hasOwnProperty(device)){
			devs[device] = deviceStatus;
		}
		else if((devs[device] === ptreeStatus.pass) && (deviceStatus === ptreeStatus.fail))
			devs[device] = deviceStatus;
	});
	
	Object.keys(devs).forEach(function(key) {
		if ( devs[key] === ptreeStatus.pass) {PassCount++;}
		else {FailCount++;}
	});
	return {"Pass":PassCount, "Fail":FailCount};
}

function computeAltDonutData(){
	var data = getUnanalyzedData();
	var devs = {};
	var otherDevicesCount = 0;
	var unknownDevicesCount = 0;
	
	var check = data.forEach(obj => {
		var device = obj.Component_Refdes.split(".").shift();
		if (!devs.hasOwnProperty(device)){
			devs[device] = obj.Device_Type;
		}
	});
	
	Object.keys(devs).forEach(function(key) {
		if ( devs[key] === "Unknown") {unknownDevicesCount++;}
		else {otherDevicesCount++;}
	});
	
	var unanalyzedDeviceSummary = {};
	if(otherDevicesCount) unanalyzedDeviceSummary["Ignored"] = otherDevicesCount;
	if(unknownDevicesCount) unanalyzedDeviceSummary["Unknown"] = unknownDevicesCount;
	return unanalyzedDeviceSummary;
}

function computeStackedBarData() {
	var data = computeData();
	var barData = []; var counts = [];
	var devstatus = {};
	let outlierCountData = [];
	let totalCount = 0;
	
	if(!data.length)
		return {
			barCount : barData,
			outlierCount : outlierCountData
		};
			
	var check = data.forEach(obj => {
		var device = obj.Component_Refdes.split(".").shift();
		var deviceStatus = obj.Pass_Status;
		if (!devstatus.hasOwnProperty(device)){
			devstatus[device] = deviceStatus + ":" + obj.Device_Type;
		}
		else if((devstatus[device] === ptreeStatus.pass+ ":" + obj.Device_Type) && (deviceStatus === ptreeStatus.fail))
			devstatus[device] = deviceStatus+ ":" + obj.Device_Type;
	});
	
	Object.keys(devstatus).forEach(function(key,value) {
		let component = devstatus[key].split(":");
		let stat = component.shift();
		
		counts[component] = counts[component] ? counts[component] + 1 : 1;
		var categoryChart = component + ":" + stat;
		counts[categoryChart] = counts[categoryChart] ? counts[categoryChart] + 1 : 1;
	});
	Object.keys(counts).forEach(function(key) {
		let chartcategory;
		let currentKey = key.split(":");
		chartcategory = currentKey.shift();
		if(!currentKey.length){
			barData.push({"Key":chartcategory});										
		}
		else{
			let value = counts[key];
			for(var i = 0; i < barData.length; i++){
				if(barData[i].Key == chartcategory){
					var statusKey = currentKey.toString().toLowerCase();
					let newKey = statusKey + "Count";
					barData[i][newKey] = value;
				}									   										 
			}
			totalCount += value;
		}
	});
	
	for (let i = barData.length - 1; i >= 0; --i) {
		let total = 0;
		for(let j = 0; j < displayCategorties.length; j++) {
				var displayCategoryCount = displayCategorties[j] + "Count";
				if(!barData[i].hasOwnProperty(displayCategoryCount)){
					barData[i][displayCategoryCount] = 0;
				}
				total += barData[i][displayCategoryCount];
			}
			barData[i]["TotalCount"] = total;
			
		if(barData[i]["TotalCount"]/totalCount < 0.02 ) {
			outlierCountData.push(barData[i]);
			barData.splice(i, 1);
		}
	}
	barData.sort((a, b) => a.Key > b.Key && 1 || -1); // Sort ascending by name
	outlierCountData.sort(function(a, b) { return -1 * (b["TotalCount"] - a["TotalCount"]); }); // Sort ascending by count
	return {
		barCount : barData,
		outlierCount : outlierCountData
	};
}

function computeAltStackedBarData() {
	var data = getUnanalyzedData();
	var barData = []; 
	var counts = []; var devstatus = {};
	let outlierCountData = [];
	let totalCount = 0;
	
	if(!data.length)
		return {
			barCount : barData,
			outlierCount : outlierCountData
		};
	
	var check = data.forEach(obj => {
		var device = obj.Component_Refdes.split(".").shift();
		var deviceStatus = "Total";
		if (!devstatus.hasOwnProperty(device)){
			devstatus[device] = deviceStatus + ":" + obj.Device_Type;
		}
	});
	
	Object.keys(devstatus).forEach(function(key,value) {
		let component = devstatus[key].split(":");
		let stat = component.shift();
		
		counts[component] = counts[component] ? counts[component] + 1 : 1;
		var categoryChart = component + ":" + stat;
		counts[categoryChart] = counts[categoryChart] ? counts[categoryChart] + 1 : 1;
	});
	
	Object.keys(counts).forEach(function(key) {
		let chartcategory;
		let currentKey = key.split(":");
		chartcategory = currentKey.shift();
		if(!currentKey.length){
			barData.push({"Key":chartcategory});										
		}
		else{
			let value = counts[key];
			for(var i = 0; i < barData.length; i++){
				if(barData[i].Key == chartcategory){
					let newKey = currentKey + "Count";
					barData[i][newKey] = value;
					barData[i]["StartCount"] = 0;
				}									   										 
			}
			totalCount += value;
		}
	});
	
	for (let i = barData.length - 1; i >= 0; --i) {
		let total = 0;
		for(let j = 0; j < skippedDisplayCategorties.length; j++) {
				var displayCategoryCount = skippedDisplayCategorties[j] + "Count";
				if(!barData[i].hasOwnProperty(displayCategoryCount)){
					barData[i][displayCategoryCount] = 0;
				}
				total += barData[i][displayCategoryCount];
			}
			barData[i]["TotalCount"] = total;
			
		if(barData[i]["TotalCount"]/totalCount < 0.02 ) {
			outlierCountData.push(barData[i]);
			barData.splice(i, 1);
		}
	}
	barData.sort((a, b) => a.Key > b.Key && 1 || -1); // Sort ascending by name
	outlierCountData.sort(function(a, b) { return -1 * (b["TotalCount"] - a["TotalCount"]); }); // Sort ascending by count
	return {
		barCount : barData,
		outlierCount : outlierCountData
	};
}

function setCurrentRail(currentRail){
	powerRail = currentRail;
}

function setCurrentFailedRail(currentFailedRail){
	failedPowerRail = currentFailedRail;
}

var firstVisibleIndex = 0;
var lastVisibleIndex = 0;

function drawRailsTabs(){
	var data = [];
	var raildivElem = document.querySelector("#powerrailtabs");
	if ( raildivElem ){
		var isFirst = true;
		var index = 0;
		
		var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
		if ( togglechartsviewbtnelem ){
			if ( togglechartsviewbtnelem.classList.contains("nonanalyzed") )
				data = failedrailjsondata;
			else
				data = dashboardData;
		}
		
		var railselectionelem = document.getElementById('tabselection');
		if( !data.length && railselectionelem){
			railselectionelem.style.display = 'none';
			return;
		}
		else
			railselectionelem.style.display = 'block';
		
		for(var i = 0; i < data.length; ++i){
			var newItem = document.createElement("a"); 
			newItem.setAttribute('href', '#');
			if ( isFirst == true){
				newItem.setAttribute('class', 'active');
				isFirst = false;
			}
			newItem.innerHTML = data[i]["powerRail"];
			newItem.style.display = "inline";			
			raildivElem.appendChild(newItem);
			index++;
		}
		firstVisibleIndex = 0;
		lastVisibleIndex = index-1;
	}
	redrawRailTabs(); // Show/hide based on width available
	setRailSelection();
}

function setStateOfScrollButtons(){
	var raildivElem = document.querySelector("#powerrailtabs");
	if (raildivElem){
		var scrollLeftElem = document.getElementById("scrolltableft");
		var scrollRightElem = document.getElementById("scrolltabright");
		if (raildivElem.firstElementChild.style.display === "none"){
			scrollLeftElem.classList.remove('disable');			
			scrollLeftElem.classList.add('enable');
			scrollLeftElem.classList.remove('nodisplay');
		} else {
			scrollLeftElem.classList.remove('enable');			
			scrollLeftElem.classList.add('disable');
			scrollLeftElem.classList.add('nodisplay');
		}
		if (raildivElem.lastElementChild.style.display === "none"){ 
			scrollRightElem.classList.remove('disable');			
			scrollRightElem.classList.add('enable');
			scrollRightElem.classList.remove('nodisplay');
		} else { 
			scrollRightElem.classList.remove('enable');			
			scrollRightElem.classList.add('disable');
			scrollRightElem.classList.add('nodisplay');
		}
	}
}

function redrawRailTabs(){
	var raildivElem = document.querySelector("#powerrailtabs");
	var availablewidth = window.innerWidth-20;
	if (raildivElem){
		var index = 0;
		var childrenElem = raildivElem.firstElementChild;
		
		if( childrenElem )
		{
			lastVisibleIndex = firstVisibleIndex;
			while ( childrenElem ){
				if ( index >= firstVisibleIndex){
					if((80*(index - firstVisibleIndex + 1)) < availablewidth){
						childrenElem.style.display = "inline";
						lastVisibleIndex = index;
					} else {
						childrenElem.style.display = "none";
					}
				} else {
					childrenElem.style.display = "none";
				}
				childrenElem = childrenElem.nextElementSibling;
				index++;
			}
			setStateOfScrollButtons();
		}
	}
}

function scrollRight(){
	var raildivElem = document.querySelector("#powerrailtabs");
	var availablewidth = window.innerWidth-20;
	if ( raildivElem ){
		firstVisibleIndex = lastVisibleIndex;
		redrawRailTabs();
	}
}

function scrollLeft(){
	var raildivElem = document.querySelector("#powerrailtabs");
	var availablewidth = window.innerWidth-20;
	if ( raildivElem ){
		lastVisibleIndex = firstVisibleIndex;
		var ind = 1;
		while ( (80*(ind+1)) < availablewidth){
			firstVisibleIndex = lastVisibleIndex - ind;
			ind++;
		}
		if ( firstVisibleIndex < 0)
			firstVisibleIndex = 0;
		redrawRailTabs();
	}
}

function drawDashboardTables(){
	var emptyMainTableElem = document.getElementById("empty-main-table");
	emptyMainTableElem.style.display = "none";
	var emptyAltTableElem = document.getElementById("empty-alt-table");
	emptyAltTableElem.style.display = "none";
	
	dashboardApp.controller("dasboardController", function($scope, $filter, NgTableParams, ngTableEventsChannel){

	$scope.filtermode = false;
	$scope.brdfile = brdFileName.split("/").pop();
	$scope.doughnutSelection = [];
	$scope.barChartSelection = [];	
	$scope.totalTableRows = 0;
	$scope.isEditing = false;	
	$scope.selectedComponent = null;
	$scope.status = {isopen: false};
	$scope.toggleDropdown = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.status.isopen = !$scope.status.isopen;
	};
	
	$scope.showCol = for_post_layout;
	
	$scope.onAfterReloadData = function(){
		setTimeout(function(){
			document.body.style.cursor = 'default';
			if(!localizeOnInit)
				localize(locale, localeFont);
		}, 0);
	}
	
	ngTableEventsChannel.onAfterReloadData($scope.onAfterReloadData, $scope);
	$scope.mainTableData = computeData();
	$scope.altTableData = getUnanalyzedData();
	$scope.filteredData = [];
	$scope.searchText="";
	$scope.refreshTable = function(){
		$scope.mainTableParams.reload();
	}
	
	$scope.barLimit = 25;
	$scope.increaseLimit = function(){
		$scope.barLimit += 25;
	}
		
	$scope.refreshTable = function(){
		var tableelem;
		var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
		if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
			tableelem = document.getElementById("alttable");
		else
			tableelem = document.getElementById("maindataTable");
		var displaystate = tableelem.style.display;
		tableelem.style.display='none';
		if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
			$scope.altTableParams.reload();
		else
			$scope.mainTableParams.reload();
		tableelem.style.display = displaystate;
	}
	
	$scope.handleMouseEnterEvent = function(){
		var tabletooltipelem = document.querySelector(".tabledatatooltip");
		tabletooltipelem.style.display = 'inline-block';	
	}
	
	$scope.handleMouseLeaveEvent = function(){
		var tabletooltipelem = document.querySelector(".tabledatatooltip");
		tabletooltipelem.style.display = 'none';
	}
	$scope.handleMouseOverEvent = function(columnname, $event){
		var tooltipcontent = "";
		if ( columnname === 'Device') {
			tooltipcontent = getTranslatedString('devicetypecoltooltippart1') + this.row["Device"] + getTranslatedString('devicetypecoltooltippart2');
		} else if (columnname === 'Refdes'){
			tooltipcontent = getTranslatedString('comprefdescoltooltippart1') + this.row["Refdes"];
		} else if (columnname == 'Test'){
			tooltipcontent = getTranslatedString('testcoltooltippart1')+ this.row["Test_Category"];
		} else if (columnname == 'Max' ){
			tooltipcontent = getTranslatedString('maxcoltooltippart1') + this.row["Test_Category"] + getTranslatedString('maxminestcoltooltippart2') + this.row["Max_Value"];
		} else if (columnname == 'Min' ){
			tooltipcontent = getTranslatedString('mincoltooltippart1') + this.row["Test_Category"] + getTranslatedString('maxminestcoltooltippart2') + this.row["Min_Value"];
		} else if (columnname == 'Estimated' ){									
			tooltipcontent = getTranslatedString('estcoltooltippart1') + this.row["Test_Category"] + getTranslatedString('maxminestcoltooltippart2') + this.row["Estimated_Value"];
		} else if (columnname == 'Status' ){	
			if(this.row.Pass_Status === ptreeStatus.pass)	
				tooltipcontent = getTranslatedString('statuscoltooltippart1') + this.row["Test_Category"] + getTranslatedString('statuspasscoltooltippart2');
			else
				tooltipcontent = getTranslatedString('statuscoltooltippart1') + this.row["Test_Category"] + getTranslatedString('statusfailcoltooltippart2') + this.row["Fail_Margin"];
		} else if (columnname == 'Margin' ){									
			var margin;
			if(this.row["Fail_Margin"] == 0.00 || this.row["Fail_Margin"] == na)
				margin = na;
			else
				margin = this.row["Fail_Margin"];
			tooltipcontent = "Fail margin is " + margin;
		} else if (columnname === 'Reason'){
			tooltipcontent = getTranslatedString('reasoncoltooltippart');
		}

		var tabletooltipelem = document.querySelector(".tabledatatooltip");
		tabletooltipelem.innerHTML = tooltipcontent;
		var mouseX = $event.clientX + 20;
		var mouseY = $event.clientY + 20;
		if( ((mouseY + 100) > document.body.clientHeight) && ((mouseX + 200) > document.body.clientWidth) )
		{
			//tooltip position when hovering near the corner of the table
			tabletooltipelem.style.top = mouseY - 55 + 'px';
			tabletooltipelem.style.left = mouseX - 200 + 'px';
		}
		else if( (mouseY + 100) >= document.body.clientHeight )
		{
			//tooltip position while hovering near the bottom of the table
			tabletooltipelem.style.top = mouseY - 55 + 'px';
			tabletooltipelem.style.left = mouseX + 'px';
		}
		else if( (mouseX + 200) >= document.body.clientWidth )
		{
			//tooltip position when hovering near the right edge of table
			tabletooltipelem.style.top = mouseY + 'px';
			tabletooltipelem.style.left = mouseX - 200 + 'px';
		}
		else     
		{
			//tooltip position when hovering normally
			tabletooltipelem.style.top = mouseY + 'px';
			tabletooltipelem.style.left = mouseX + 'px';
		}	
	}

	$scope.filter = function(){
		var mainView = true;
		var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
		if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
			mainView = false;
		
		var data;
        var bMainTableData = false;
        if (mainView) {
            data = $scope.mainTableData;
            bMainTableData = true;
        }
		else
			data = $scope.altTableData;		
		$scope.filteredData = [];
		var chart_filter_results = [];
			
		// 1. Apply the chart based filters first
		if ( $scope.doughnutSelection.length != 0 ){ // 1a. Apply the design summary filters here
			for(var k=0; k<$scope.doughnutSelection.length; ++k){
				for(var j=0;j<data.length; ++j){
					if ( mainView ) {
						if(data[j].Pass_Status.toLowerCase() == $scope.doughnutSelection[k].toLowerCase()){
							chart_filter_results.push(data[j]);
						}
					} else {
						if ( -1 !== $scope.doughnutSelection[k].indexOf(data[j].Device_Type))
							chart_filter_results.push(data[j]);
						if ( -1 !== $scope.doughnutSelection[k].indexOf("Ignored") ){
							if ( data[j].Device_Type !== "Unknown")
								chart_filter_results.push(data[j]);
						}
					}
				}
			}
		}
		else if ($scope.barChartSelection.length !== 0) { // 1b. Apply the device summary filters here
			let barChartSelection = $scope.barChartSelection;
			let barChartSelectionLower = null;
			if (bMainTableData) {
				barChartSelectionLower = barChartSelection.map(s => s.toLowerCase());
			}
			for (let j = 0; j < data.length; ++j)  {
				const deviceType = data[j].Device_Type;
				if (bMainTableData) {
					const passStatus = data[j].Pass_Status ? data[j].Pass_Status.toLowerCase() : "";
					for (let k = 0; k < barChartSelection.length; ++k)  {
						if (
							barChartSelection[k].includes(deviceType) &&
							barChartSelectionLower[k].includes(passStatus)
						) {
							chart_filter_results.push(data[j]);
							break;
						}
					}
				} else { //All devices in the alt table data are ignored/unanalyzed so no need of checking Pass_status.
					for (let k = 0; k < barChartSelection.length; ++k) {
						if (barChartSelection[k].includes(deviceType)) {
							chart_filter_results.push(data[j]);
							break;
						}
					}
				}
			}
		}
			
		// 1c. If nothing was selected in charts filter, then just copy the data assuming everything is selected
		if(chart_filter_results.length==0){
			chart_filter_results = angular.copy(data);
		}	
			var searchText = $scope.searchText;
			
			var tokens = [];
			if (searchText.length > 0){
				tokens = searchText.split(/\s+/);
			}
			var regExPatterns= [];
			for(var j = 0; j < tokens.length; ++j){
				try {regExPatterns[j] = new RegExp(tokens[j], 'i');} catch (e) { regExPatterns[j] = new RegExp(/.*/);}
			}
			var searchProperties = ["Device_Type","Component_Refdes","Test_Category","Max_Value","Min_Value","Estimated_Value","Pass_Status","Fail_Margin","Reason"];
			var global_filter_results = [];
			for(var i = 0; i < chart_filter_results.length; ++i){
				if(tokens.length > 0){
					if ( $scope.filtermode == false){
						var match = false;
						var rowdata = chart_filter_results[i];
						for (var k = 0; k < searchProperties.length; ++k){
							var prop = searchProperties[k];
							if (rowdata.hasOwnProperty(prop)){
								for(var j = 0; j < regExPatterns.length; ++j){
									if ( regExPatterns[j].test(rowdata[prop]) ) { // A token matched, set the flag to true and break
										match = true;
										break;
									}
								}
							}
							if ( match ){
								break;
							}
						}
						if(match){ // A token matched, add the row
							global_filter_results.push(rowdata);
						}
					} else {
						var match = false;
						var matchcount = 0;
						var rowdata = chart_filter_results[i];
						for(var j = 0; j < regExPatterns.length; ++j){
							for (var k = 0; k < searchProperties.length; ++k){
								var prop = searchProperties[k];
								if (rowdata.hasOwnProperty(prop)){
									if ( regExPatterns[j].test(rowdata[prop]) ) { // A token matched, record it
										matchcount++;
										break;
									}
								}
							}
						}
						if ( matchcount == tokens.length) // Every token was found in the row
							match = true;
						if(match){ // A token matched, add the row
							global_filter_results.push(rowdata);
						}
					}
				} else { // No token to match, just add the row
					global_filter_results.push(chart_filter_results[i]);
				}
			}
			
			var column_filter_results = [];
			if(mainView){
				var orderBy = $scope.mainTableParams.orderBy();
				chart_filter_results = $scope.mainTableParams.filter() ? $filter('filter')(global_filter_results, $scope.mainTableParams.filter()) : global_filter_results;
				chart_filter_results = $scope.mainTableParams.sorting() ? $filter('orderBy')(chart_filter_results, orderBy) : chart_filter_results;
				$scope.mainTableParams.total(column_filter_results.length);
				$scope.filteredData = chart_filter_results;
			} else {
				var orderBy = $scope.altTableParams.orderBy();
				chart_filter_results = $scope.altTableParams.filter() ? $filter('filter')(global_filter_results, $scope.altTableParams.filter()) : global_filter_results;
				chart_filter_results = $scope.altTableParams.sorting() ? $filter('orderBy')(chart_filter_results, orderBy) : chart_filter_results;
				$scope.altTableParams.total(column_filter_results.length);
				$scope.filteredData = chart_filter_results;
			}
			
			if(mainView){
				if ( $scope.filteredData.length == 0)
					emptyMainTableElem.style.display = "block";
				else
					emptyMainTableElem.style.display = "none";
			}
			else {
				if ( $scope.filteredData.length == 0)
					emptyAltTableElem.style.display = "block";
				else
					emptyAltTableElem.style.display = "none";
			}
			
			if ( $scope.filteredData.length != data.length || $scope.doughnutSelection.length || $scope.barChartSelection.length || searchText.length ){
				var clearfilterelem = document.getElementById('filtercontrol');
				if ( clearfilterelem) {
					clearfilterelem.classList.add('enableclearfilter');
				}
			}else{
				var clearfilterelem = document.getElementById('filtercontrol');
				if ( clearfilterelem) {
					clearfilterelem.classList.remove('enableclearfilter');
				}
			}
			var tablesummaryelem = document.getElementById('tablesummary');
			if (tablesummaryelem)
				tablesummaryelem.innerHTML = getTranslatedString('filtertext1') + $scope.filteredData.length + getTranslatedString('filtertext2') + data.length + getTranslatedString('filtertext3');
			return true;
	}
	
	
	$scope.singleClickAction = function(row) {
		$scope.selectedId = this.$id;
		$scope.selectedComponent = row.Component_Refdes;
	}

	$scope.doubleClickAction = function(row) {
		var Component = row.Component_Refdes;
		for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
			if ( Component === canonicalpathsjsondata[i].Component_Refdes){
				var hostFunction = "sdaReliability::crossprobeComponent";
				var params = "\"" + canonicalpathsjsondata[i].Spath + "\"  \"" + canonicalpathsjsondata[i].Component_Refdes +  "\" 0";
				callTcl(hostFunction, params, null);
				break;
			}
		}
	}
		
   	$scope.mainTableMenuOptions = [
						{
							text: 	getTranslatedString('highlightcomponentmenutext'),
							click:  function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.Component_Refdes;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].Component_Refdes){
												var hostFunction = "sdaReliability::crossprobeComponent";
												var params = "\"" + canonicalpathsjsondata[i].Spath + "\"  \"" + canonicalpathsjsondata[i].Component_Refdes +  "\" 0";
												callTcl(hostFunction, params, null);
												break;
											}
										}
							}
						},
						{
							text: 	getTranslatedString('dehighlightcomponentmenutext'),
							click: function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.Component_Refdes;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].Component_Refdes){
												var hostFunction = "sdaReliability::crossprobeComponent";
												var params = "\"" + canonicalpathsjsondata[i].Spath + "\"  \"" + canonicalpathsjsondata[i].Component_Refdes +  "\" 1";
												callTcl(hostFunction, params, null);
												break;
											}
										}
									 },
							hasBottomDivider: true
						},
						{
							text: 	getTranslatedString('highlighttopologymenutext'),
							enabled: function($itemScope){
										var isEnabled = $itemScope.row.Disable_In_Dashboard;
											if(isEnabled === "1")
												return false;
											else
												return true;
									},
							click:  function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.Component_Refdes;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].Component_Refdes){
												var refdes = canonicalpathsjsondata[i].Component_Refdes.split(".").shift();
												var hostFunction = "sdaReliability::crossprobeInTopology";
												var params = "\"" + canonicalpathsjsondata[i].Spath + "\"  \"" + powerRail + "\"  \"" + refdes +  "\" 0";
												callTcl(hostFunction, params, null);
												break;
											}
										}
							},
							hasBottomDivider: true
						},
						{
							text: 	getTranslatedString('configcontroltooltip'),
							click: 	function ($itemScope, $event, modelValue, text, $li) {
								$scope.selectedComponent = $itemScope.row.Component_Refdes;
								clickConfigControl();
							}
			  },
			  {
				  text: getTranslatedString('highlightlayoutcomponentmenutext'),
				enabled: function($itemScope){
											if(!for_post_layout)
												return false;
											else
												return true;
									},
				  click: function ($itemScope, $event, modelValue, text, $li) {
					  var Component = $itemScope.row.Component_Refdes;
					  for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
						  if (Component === canonicalpathsjsondata[i].Component_Refdes) {
							  var hostFunction = "sdaReliability::crossprobeLayout";
							  var params = "\"" + canonicalpathsjsondata[i].Spath + "\"  \"" + canonicalpathsjsondata[i].Component_Refdes + "\" 0";
							  callTcl(hostFunction, params, null);
							  break;
						  }
					  }
				  }
			  },
			  {
				  text: getTranslatedString('dehighlightlayoutcomponentmenutext'),
				  enabled: function($itemScope){
											if(!for_post_layout)
												return false;
											else
												return true;
									},
				  click: function ($itemScope, $event, modelValue, text, $li) {
					  var Component = $itemScope.row.Component_Refdes;
					  for (var i = 0; i < canonicalpathsjsondata.length; ++i) {
						  if (Component === canonicalpathsjsondata[i].Component_Refdes) {
							  var hostFunction = "sdaReliability::crossprobeLayout";
							  var params = "\"" + canonicalpathsjsondata[i].Spath + "\"  \"" + canonicalpathsjsondata[i].Component_Refdes + "\" 1";
							  callTcl(hostFunction, params, null);
							  break;
						  }
					  }
				  },
				  hasBottomDivider: true
			  }

	];
	
	$scope.altTableMenuOptions = [
						{
							text: 	getTranslatedString('highlightcomponentmenutext'),
							click:  function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.Component_Refdes;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].Component_Refdes){
												var hostFunction = "sdaReliability::crossprobeComponent";
												var params = "\"" + canonicalpathsjsondata[i].Spath + "\"  \"" + canonicalpathsjsondata[i].Component_Refdes +  "\" 0";
												callTcl(hostFunction, params, null);
												break;
											}
										}
							}
						},
						{
							text: 	getTranslatedString('dehighlightcomponentmenutext'),
							click: function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.Component_Refdes;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].Component_Refdes){
												var hostFunction = "sdaReliability::crossprobeComponent";
												var params = "\"" + canonicalpathsjsondata[i].Spath + "\"  \"" + canonicalpathsjsondata[i].Component_Refdes +  "\" 1";
												callTcl(hostFunction, params, null);
												break;
											}
										}
									 },
							hasBottomDivider: true
						},
						{
							text: 	getTranslatedString('highlighttopologymenutext'),
							enabled: function($itemScope){
										var isEnabled = $itemScope.row.Disable_In_Dashboard;
											if(isEnabled === "1")
												return false;
											else
												return true;
									},
							click:  function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.Component_Refdes;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].Component_Refdes){
												var hostFunction = "sdaReliability::crossprobeInTopology";
												var params = "\"" + canonicalpathsjsondata[i].Spath + "\"  \"" + failedPowerRail +  "\" 0";
												callTcl(hostFunction, params, null);
												break;
											}
										}
							},
							hasBottomDivider: true
						},
						{
							text: 	getTranslatedString('configcontroltooltip'),
							click: 	function ($itemScope, $event, modelValue, text, $li) {
								$scope.selectedComponent = $itemScope.row.Component_Refdes;
								clickConfigControl();
							}
						}
	];
	
	$scope.mainTableParams = new NgTableParams(
						{
							count: $scope.filteredData.length,
							sorting:{'Pass_Status':'asc'}
						},
						{
							counts: [],
							dataset:$scope.mainTableData,
							getData: function(params) {
								$scope.filter();
								return $scope.filteredData;
							}
						}
					);
 
	$scope.altTableParams = new NgTableParams(
						{
							count: $scope.filteredData.length,
							sorting:{'Component_Refdes':'asc'}
						},
						{
							counts: [],
							dataset:$scope.altTableData,
							getData: function(params) {
								$scope.filter();
								return $scope.filteredData;
							}
						}
					);
		
	$scope.getCategoryColor = function(){
								var statuscolor = 'white';
								switch(this.row["Pass_Status"])
								{
									case ptreeStatus.pass: 
										statuscolor = '#1b9e77';
										break;
									case ptreeStatus.fail:
										statuscolor = '#e41a1d';
										break;
								};
							return statuscolor;
							};
	});

	dashboardApp.filter('fixedFormat', function () {
	  return function (value) {
			if ( typeof value !== 'undefined'){
				var val = value.toFixed(4);
				return val;
			}
			return value;
		}
	});
	
	dashboardApp.filter('marginFormat', function () {
	  return function (value) {
			if ( typeof value !== 'undefined'){
				var val;
				if(value == na || value == 0.00)
					val = na;
				else
					val = value.toFixed(4);
				return val;
			}
			return value;
		}
	});
}

function getChartHeaderText(){
	var doughnutChartText = getTranslatedString('designsummarytitle');
	var barChartText = getTranslatedString('devicesummarytitle');
	var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
	if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed") ){
		doughnutChartText = getTranslatedString('altdevicesummarytitle');
		barChartText = getTranslatedString('altdesignsummarytitle');
	}
	document.getElementById("donutTitle").innerHTML = doughnutChartText;
	document.getElementById("barTitle").innerHTML = barChartText;
}

function refreshDashboardTable(){
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		appScope.mainTableData = computeData();
		appScope.altTableData = getUnanalyzedData();
		appScope.brdfile = brdFileName.split("/").pop();
		appScope.refreshTable();
	}
	
	var tablerefreshtriggerelem = document.getElementById('refreshDashboardTableTrigger');
	if (tablerefreshtriggerelem){tablerefreshtriggerelem.click();}
}

function refreshTabsSelection(){
	var raildivElem = document.querySelector("#powerrailtabs");
	if( raildivElem ){
		raildivElem.innnerHTML = "";
		raildivElem.innerText = "";
	}
	if (document.getElementById("tabselection")){drawRailsTabs();}
}

function refreshData(){
	computeData();
}

function refreshAll(){
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
	getChartHeaderText();
}

function drawAll(){
	dashboardApp = angular.module("dashboardApp", ["ngTable","ui.bootstrap","ui.bootstrap.buttons","ui.bootstrap.contextMenu","ui.bootstrap.dropdown","infinite-scroll"]);
	
	var currentpowerRail = ""; var currentDataSet = ""; var currentFailedPowerRail = "";
	if ( dashboardData.length != 0){
		currentpowerRail = dashboardData[0].powerRail;
		currentDataSet = dashboardData[0].powerRailData[0].dataLevel;
		setActiveDataSet(currentpowerRail, currentDataSet);
		setCurrentRail(currentpowerRail);
	}
	
	if ( failedrailjsondata.length != 0){
		currentFailedPowerRail = failedrailjsondata[0].powerRail;
		setCurrentFailedRail(currentFailedPowerRail);
	}
	
	refreshData();
	if (document.getElementById("tabselection")){drawRailsTabs();}
	
	var tablevcelem = document.getElementById('tablevisibilitycontrol');
	if (tablevcelem) {tablevcelem.classList.add('showtable');}
	var chartvcelem = document.getElementById('chartvisibilitycontrol');
	if (chartvcelem) { chartvcelem.classList.add('showchart'); }
	
	getData();
	if (document.getElementById("mainsummary-donut"))
	{
		var donutData = computeDonutData();
		mainDonut = drawSummaryDonut(donutData,
									'#mainsummary-donut',
									{"Pass":ptreeStatus.pass.toLowerCase(),"Fail":ptreeStatus.fail.toLowerCase()},
									[getTranslatedString("maindonutregion"), getTranslatedString("count"), getTranslatedString("pct")],
									{titles:{"Pass":getTranslatedString("passdonuttooltiptitle"),"Fail":getTranslatedString("faildonuttooltiptitle")}},
									color_range,
									getTranslatedString("analyzeddevicestxt"),
									'#contentContainer');
	}
	if (document.getElementById("altsummary-donut"))
	{
		var altdonutData = computeAltDonutData();
		altDonut = drawSummaryDonut(altdonutData,
									'#altsummary-donut',
									{"Ignored":getTranslatedString("Ignored"),"Unknown":getTranslatedString("Unknown")},
									[getTranslatedString("reason"), getTranslatedString("count"), getTranslatedString("pct")],
									{titles:{"Ignored":getTranslatedString('ignoreddonuttooltiptitle'),"Unknown":getTranslatedString('unknowndonuttooltiptitle')}},
									skip_color_range,
									getTranslatedString("devicesskipped"),
									'#contentContainer');
	}
	if (document.getElementById("mainsummary-stacked-bar"))
	{
		var data = computeStackedBarData();
		mainStackedBar = drawStackedBar(data,
					   '#mainsummary-stacked-bar',
		               ["passCount", "failCount"],
					   {
							createtooltip:function(elementid){
								createTooltipBar(elementid, displayCategorties);
							},
							initializetooltip:function(elementid, d){
								var summary = getTranslatedString("summarytitle");
								var totalposttext = "s " +  getTranslatedString("analyzed");
								initializeTooltipBar(elementid, d, summary, totalposttext, displayCategorties);
							},
							showtooltip:function(elementid, d){
								showTooltipBar(elementid, d);
							},
							hidetooltip:function(elementid){
								hideTooltipBar(elementid);
							}
						},
						{
							createtooltip:function(elementid, outlierCountData){
								createtooltipoutlier(elementid, outlierCountData, displayCategorties);
							},
								initializetooltip:function(elementid, outlierCountData){
									initializetooltipoutlier(elementid, outlierCountData, displayCategorties);
							},
							showtooltip:function(elementid){
								showtooltipoutlier(elementid);
							},
							hidetooltip:function(elementid){
								hidetooltipoutlier(elementid);
							}
						},
						color_range,
						-20,
						"Key",
						"TotalCount",
						[getTranslatedString("analyzeddevicestxt")],
						"",
						function(d){
							return d.data.Key + ":" + d.stackKey.replace("Count", "");
						},
						'#contentContainer');
	}
		
	if (document.getElementById("altsummary-stacked-bar"))
	{
		var data = computeAltStackedBarData();
		altStackedBar = drawStackedBar(data,
					   '#altsummary-stacked-bar',
		               ["TotalCount", "StartCount"],
						{
							createtooltip:function(elementid){
								createTooltipBar(elementid, []);
							},
							initializetooltip:function(elementid, d){
								var summary = getTranslatedString("summarytitle");
								var totalposttext = "s " +  getTranslatedString("notanalyzed");
								initializeTooltipBar(elementid, d, summary, totalposttext, []);
							},
							showtooltip:function(elementid, d){
								showTooltipBar(elementid, d);
							},
							hidetooltip:function(elementid){
								hideTooltipBar(elementid);
							}
						},
						{
							createtooltip:function(elementid, outlierCountData){
								createtooltipoutlier(elementid, outlierCountData, []);
							},
							initializetooltip:function(elementid, outlierCountData){
								initializetooltipoutlier(elementid, outlierCountData, []);
							},
							showtooltip:function(elementid){
								showtooltipoutlier(elementid);
							},
							hidetooltip:function(elementid){
								hidetooltipoutlier(elementid);
							}
						},
						skip_color_range,
						-20,
						"Key",
						"TotalCount",
						[getTranslatedString("devicesskipped")],
						"",
						function(d){
							var key;
							return d.data.Key + ":" + key;
						},
						'#contentContainer');
	}
	
 	if (document.getElementById("maindataTable")){drawDashboardTables();}
	//if data is for post-layout, show ACTUAL_VALUE column and apply different style for the columns
	if (document.getElementById("dataTable") && for_post_layout){addClass('dataTable', 'newTableStyle');}

	if(document.getElementById("dashboardcontrols"))
	{
		var elem = document.getElementById("dashboardcontrols");
		var irdropbuttonelem = document.getElementById("viewIRdropcontrol");
		if (!for_post_layout)
			elem.removeChild(irdropbuttonelem);
	}

	initializeViews();
}

function exportPDF(){ 
	var hostFunction = "sdaReliability::exportDashboardAsPdf";
	var params = ` {-mode ${mode} -dumpPath ${dumpPathVal}} `;
	callTcl(hostFunction, params, null);
}

function exportCSV(){
	var hostFunction = "sdaReliability::exportDashboardAsCsv";
	var params = ` {-mode ${mode} -dumpPath ${dumpPathVal}} `;
	callTcl(hostFunction, params, null);
}

function getToolTip(controlButton) {
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		switch(controlButton.currentTarget.id){
			case "searchmodecontrol":{
					appScope.dynamicTooltipText = getTranslatedString('searchmodetooltip');
					break;
					}												 
			case "chartvisibilitycontrol":{
					appScope.dynamicTooltipText = getTranslatedString('togglechartstooltip');
					break;
					}
			case "tablevisibilitycontrol":{
					appScope.dynamicTooltipText = getTranslatedString('toggletabletooltip');
					break;
					}
			case "viewvisibilitycontrol":{
					appScope.dynamicTooltipText = getTranslatedString('toggleviewtooltip');
					break;
					}
			case "exportformatoption":{
					appScope.dynamicTooltipText = getTranslatedString('exporttooltip');
					break;
					}
			case "filtercontrol":{
					var clearfilterelem = document.getElementById('filtercontrol');
					if ( clearfilterelem) {
						if ( clearfilterelem.classList.contains('enableclearfilter'))
							appScope.dynamicTooltipText = etTranslatedString('filtercontroltooltip2');
						else
							appScope.dynamicTooltipText = getTranslatedString('filtercontroltooltip1');
					}
					break;
					}
			case "configcontrol":{
					appScope.dynamicTooltipText = getTranslatedString('configcontroltooltip');
					break;
					}
			case "reruncontrol":{
					appScope.dynamicTooltipText = getTranslatedString('synccontroltooltip');
					break;
					}
			case "checkstalecontrol":{
					appScope.dynamicTooltipText = getTranslatedString('checkstalecontroltooltip');						 
					break;
					}
			case "viewIRdropcontrol":{
					appScope.dynamicTooltipText = getTranslatedString('viewirdropcontroltooltip');
					break;
			}
		}
	}
}

function viewIRDropControl()
{
	var hostFunction = "sdaReliability::viewIRDropVision";
	var params = "";
	callTcl(hostFunction, params, null);
}

function setRailSelection() {
	var rail;
	var railtabs =  document.querySelectorAll("#powerrailtabs>a");
	if ( railtabs.length ){
		var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
		if ( togglechartsviewbtnelem ){
			if ( togglechartsviewbtnelem.classList.contains("nonanalyzed") )
				rail = failedPowerRail;
			else
				rail = powerRail;
		}
		var activetab = document.querySelector("#powerrailtabs>a.active");
		activetab.classList.remove("active");
		for(var i = 0; i < railtabs.length; ++i){
			var railelem = railtabs[i];
			if(railelem.innerText == rail)
				railelem.classList.add("active");
			railelem.onclick = function(){
				var activetab = document.querySelector("#powerrailtabs>a.active");
				if ( (activetab == this)){return;}
				activetab.classList.remove("active");
				this.classList.add("active");
				var currentRail = this.text.replace(/[^\x00-\x7F]/g, "");
				var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
				if ( togglechartsviewbtnelem.classList.contains("nonanalyzed") )
					setCurrentFailedRail(currentRail);
				else
					setCurrentRail(currentRail);
				setTimeout(function(){
					var designsummaryelem = document.querySelector("#donutsummary-card");
					designsummaryelem.classList.add("opacitytransition");
					var devicesummaryelem = document.querySelector("#stackedBarsummary-card");
					devicesummaryelem.classList.add("opacitytransition");
					var devicetableelem = document.querySelector("#dashboardtable");
					devicetableelem.classList.add("opacitytransition");
					document.body.style.cursor = 'progress';
				}, 0);
				setTimeout(function(){
					refreshAll();
					var searchelem = document.querySelector(".form-control");
					if ( searchelem.value ){
						var clearfilterelem = document.getElementById('filtercontrol');
						if ( clearfilterelem ) {
							clearfilterelem.classList.add('enableclearfilter');
						}
					}else{
						var clearfilterelem = document.getElementById('filtercontrol');
						if ( clearfilterelem ) {
							clearfilterelem.classList.remove('enableclearfilter');
						}
				}},100);
				setTimeout(function(){
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
}

function clickConfigControl() {
	addClass('configcontrol', 'configcontrolactive');
	getDesignReadOnlyStatus(function(currentReadOnlyStatus) {
		if(currentReadOnlyStatus==='1'){
			getDesignReadOnlyReason(function(currentReadOnlyReason) {
		if(currentReadOnlyReason!=="ReadOnlyByPTreeSettings"){
			document.getElementById('queryIsDesignReadOnlytext').innerHTML = getTranslatedString('readonlyreason');
			document.getElementById('queryIsDesignReadOnly').style.display = 'block';
			addClass('queryIsDesignReadOnly', 'fadingIn');
		}else{
			setTimeout(launchSetupConfig, 300);
		}
	});
		}else{
			setTimeout(launchSetupConfig, 300);
		}
	});
}

function launchSetupConfig(){
	document.body.style.cursor = 'progress';
	var settingsCommand = "sdaReliability::PTreePreferences";
	var params = "";
	var selCompSPath = "";
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		var Component = appScope.selectedComponent;
		if ( Component ){
			for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
				if ( Component === canonicalpathsjsondata[i].Component_Refdes){
					selCompSPath = canonicalpathsjsondata[i].Spath;
					break;
				}
			}
		}
	}
	if ( selCompSPath === "" ){
		params = "\"-display\"";
	} else {
		params = "\"-spath " + selCompSPath + "\"";
	}

	settingsCommand = settingsCommand + " " + params;
	params = ""; selCompSPath = "";
	//CCMPR03193342---sdaReliability::PTreePreferences is wrapped in cps::contectCall because when .brd is opened, context is switched to backend. For launching settings we need to be on schematic page context.
	var hostFunction = "cps::contextCall SCH PAGE {" + settingsCommand + "}";
	callTcl(hostFunction, params, null);
	removeClass('configcontrol','configcontrolactive');

	if (angElement && angElement.scope())
		appScope.selectedComponent = null;

	document.body.style.cursor = 'default';
}

function setResultStale(){   //called from CPSysr if data not synched with design
	addClass('syncicon','ripple');
	document.getElementById('infosyncchecktext').innerHTML = getTranslatedString('resultstaletext');
	document.getElementById('infoSyncCheckDiv').style.display='block';
	addClass('infoSyncCheckDiv','fadingIn');
	removeClass('checkstalecontrol','stalecontrolactive');
}

function setResultNotStale(){	//called from CPSysr if data in sync with design 
	removeClass('syncicon','ripple');
	document.getElementById('infosyncchecktext').innerHTML = getTranslatedString('resultnotstaletext');
	document.getElementById('infoSyncCheckDiv').style.display='block';
	addClass('infoSyncCheckDiv','fadingIn');
	removeClass('checkstalecontrol','stalecontrolactive');
}

function clickCheckIfStale(){
	document.body.style.cursor = 'progress';
	addClass('checkstalecontrol','stalecontrolactive');
	setTimeout(checkPtreeDataStale, 500); // Run with 1s delay so that repaint happens.
	document.body.style.cursor = 'default';
}

function checkPtreeDataStale(){   //this will check if data stale or not
	if(for_post_layout)
	{
		var params = "";
		var hostFunction = "sdaReliability::isPostTreeDataStale";
	}
	else
	{
		var params = "";
		var hostFunction = "sdaReliability::isPtreeDataStale";
	}
	callTcl(hostFunction, params);
}

function clickSyncControl() {
	addClass('reruncontrol', 'syncactive');
	getDesignReadOnlyStatus(function(currentReadOnlyStatus) {
		if(currentReadOnlyStatus==='1'){
			document.getElementById('queryIsDesignReadOnlytext').innerHTML = getTranslatedString('readonlyreason');
			document.getElementById('queryIsDesignReadOnly').style.display = 'block';
			addClass('queryIsDesignReadOnly', 'fadingIn');
			}
		else{
			var synciconelem = document.getElementById('syncicon');
			if (synciconelem){
				if ( synciconelem.classList.contains("ripple")){
					document.getElementById('querysynctext').innerHTML = getTranslatedString('needsynctext');
				} else {
					document.getElementById('querysynctext').innerHTML = getTranslatedString('donotneedsynctext');
				}
			}
			document.getElementById('querySyncDiv').style.display='block';
			addClass('querySyncDiv','fadingIn');
					
		}
	});	
}

function cancelSync(){
	removeClass('reruncontrol','syncactive');
	removeClass('querySyncDiv','fadingIn'); 
	document.getElementById('querySyncDiv').style.display='none';
}
function cancelActive() {
	removeClass('reruncontrol','syncactive');
	removeClass('configcontrol', 'configcontrolactive');
	removeClass('queryIsDesignReadOnly', 'fadingIn');
	document.getElementById('queryIsDesignReadOnly').style.display = 'none';
}
function triggerSync(){
	removeClass('querySyncDiv','fadingIn'); 
	document.getElementById('querySyncDiv').style.display='none';
	setTimeout(runPtree, 500); // Run with 1s delay so that dialog goes away.
}

function syncCheckOK(){
	removeClass('infoSyncCheckDiv','fadingIn'); 
	document.getElementById('infoSyncCheckDiv').style.display='none';
}

function runPtree(){
	addClass('reruncontrol','syncactive');
	if(for_post_layout)
	{
		var params = "";
		var hostFunction = "sdaReliability::extractSigPTree";
	}
	else
	{
		var params = "1";
		var hostFunction = "sdaReliability::extractPTree";
	}
	callTcl(hostFunction, params, null);
	removeClass('reruncontrol','syncactive');
	document.body.style.cursor = 'default';
}

getChartHeaderText();
drawAll();

// Now the document is ready... Set the page content as visible and loading element as invisible
onReady(function() {
	if(document.getElementById("searchmodecontrol")){
		document.getElementById("searchmodecontrol").onclick = clickFilterModeControl;
		document.getElementById("searchmodecontrol").onmouseover = getToolTip;
	}														   
	if(document.getElementById("filtercontrol")){
		document.getElementById("filtercontrol").onclick = clickClearFilterControl;
		document.getElementById("filtercontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("chartvisibilitycontrol")){
		document.getElementById("chartvisibilitycontrol").onclick = clickChartVisibilityControl;
		document.getElementById("chartvisibilitycontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("tablevisibilitycontrol")){
		document.getElementById("tablevisibilitycontrol").onclick = clickTableVisibilityControl;
		document.getElementById("tablevisibilitycontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("viewvisibilitycontrol")){
		document.getElementById("viewvisibilitycontrol").onclick = toggleChartsView;
		document.getElementById("viewvisibilitycontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("exportformatoption")){
		document.getElementById("exportformatoption").onmouseover = getToolTip;
	}
	if(document.getElementById("configcontrol")){
		document.getElementById("configcontrol").onclick = clickConfigControl;
		document.getElementById("configcontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("viewIRdropcontrol")){
		document.getElementById("viewIRdropcontrol").onmouseover = getToolTip;
		document.getElementById("viewIRdropcontrol").onclick = viewIRDropControl;
	}
	if(document.getElementById("reruncontrol")){
		document.getElementById("reruncontrol").onclick = clickSyncControl;
		document.getElementById("reruncontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("closeQuerySyncBtn")){
		document.getElementById("closeQuerySyncBtn").onclick = cancelSync;
	}
	if(document.getElementById("cancelQuerySyncBtn")){
		document.getElementById("cancelQuerySyncBtn").onclick = cancelSync;
	}
	if (document.getElementById("closeQueryIsDesignReadOnlyBtn")) {
		document.getElementById("closeQueryIsDesignReadOnlyBtn").onclick = cancelActive;
	}	
	if(document.getElementById("triggerSyncBtn")){
		document.getElementById("triggerSyncBtn").onclick = triggerSync;
	}
	if(document.getElementById("checkstalecontrol")){
		document.getElementById("checkstalecontrol").onclick = clickCheckIfStale;
		document.getElementById("checkstalecontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("okSyncCheckBtn")){
		document.getElementById("okSyncCheckBtn").onclick = syncCheckOK;
	}
	if(document.getElementById("closeInfoSyncCheckBtn")){
		document.getElementById("closeInfoSyncCheckBtn").onclick = syncCheckOK;
	}
	window.addEventListener("resize", resizecharts);
	
	initUI();
	setupLocale(locale, localeFont);
	setTimeout(refreshAll, 5);
	
	var loadingelem = document.getElementById('loading');
	loadingelem.style.opacity = 0;
	loadingelem.classList.add('hidden');
	var contentelem = document.getElementById('content');
	contentelem.style.opacity = 1;
	if ( isresultstale ){
		addClass('syncicon','ripple');
	}
});
