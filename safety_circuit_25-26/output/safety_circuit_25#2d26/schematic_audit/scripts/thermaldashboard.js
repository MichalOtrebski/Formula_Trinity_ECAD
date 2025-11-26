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
var ColdCount, NormalCount, WarmCount, HotCount, FailedCount;
var skippedDevicesCount;
var activeTemperature;
var skip_stress_data = [];
var min_temp_rise, max_temp_rise;
var minTemp, maxTemp;
var estimated_temp = [];
var mode = "THERMAL";
var dumpPathVal="";				   
var rangeSlider;
var slevel;
var defslevel = 90;

var localizeOnInit = false;
var locale = "en";
var localeFont = "";

var skippedDisplayCategorties = ["Total", "Start"];
var color_range = ["#1f78b4","#1b9e77","#e85d04","#e41a1d"]; //cold:blue,normal:green, warm:orange, hot:red
var histogram_color_range = ["#a6cee3","#1f78b4"]; //display:_light_blue, highlight:blue
var skip_color_range = ["#a6cee3"];

function localize(language, font){
	stdformatter = new Intl.NumberFormat(language,standardoption);
	scientificformatter = new Intl.NumberFormat(language,scientificoption);
	i18next.changeLanguage(language);
	
	if(language != "en")
	{
		var body = document.body;
		body.style.fontFamily = font;
	}
	
	var thermalTab =  document.querySelector(".navigationtabs>li>a");
	thermalTab.innerHTML = getTranslatedString('feature1title');
	var designsummaryTitle = document.querySelector("#donutTitle");
	designsummaryTitle.innerHTML = getTranslatedString('designsummarytitle');
	var devicesummaryTitle = document.querySelector("#barTitle");
	devicesummaryTitle.innerHTML = getTranslatedString('devicesummarytitle');
	var searchInput = document.querySelector(".form-control");
	searchInput.placeholder = getTranslatedString('searchplaceholder');
	var showjuncTemp = document.querySelector("#showjunctemp");
	showjuncTemp.innerHTML = getTranslatedString('showjunctemp');
	var querysyncTitle = document.querySelector("#querysynctitle");
	if(querysyncTitle){
		querysyncTitle.innerHTML = getTranslatedString('querysynctitle');
	}
	var infosynccheckTitle = document.querySelector("#infosyncchecktitle");
	if(infosynccheckTitle){
		infosynccheckTitle.innerHTML = getTranslatedString('infosyncchecktitle');
	}
	var simulationDiv = document.querySelector("#thermalsimulationdiv");
	if(simulationDiv){
		simulationDiv.innerHTML = getTranslatedString('simulationtext');
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
	var brdfileDiv = document.querySelector("#brdFilediv");
	if(brdfileDiv){
		brdfileDiv.innerHTML = getTranslatedString('brdfiletext') + brdFileName.split("/").pop();
	}
	var tminText = document.querySelector("#tminText");
	if(tminText){
		tminText.innerHTML = getTranslatedString('TMIN');
	}
	var tmaxText = document.querySelector("#tmaxText");
	if(tmaxText){
		tmaxText.innerHTML = getTranslatedString('TMAX');
	}
	var queryIsDesignReadOnlyTitle = document.querySelector("#queryisdesignreadonlytitle");
	if (queryIsDesignReadOnlyTitle) {
		queryIsDesignReadOnlyTitle.innerHTML = getTranslatedString('queryisdesignreadonlytitle');
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

	var subcategoryheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(3)>div");
	if (subcategoryheader){
		var subcategoryheadertext = getTranslatedString('subcategoryheader');
		subcategoryheader.textContent = subcategoryheadertext;
		subcategoryheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(3)");
		subcategoryheader.dataset['title'] = subcategoryheadertext;
		subcategoryheader.dataset['titleText'] = subcategoryheadertext;
		subcategoryheader.attributes['data-title'].nodeValue = subcategoryheadertext;
		subcategoryheader.attributes['data-title'].value = subcategoryheadertext;
		subcategoryheader.attributes['data-title'].textContent = subcategoryheadertext;
	}

	var actualpowerheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(4)>div");
	if (actualpowerheader) {
		var actualpowerheadertext = getTranslatedString('actualpowerheader');
		actualpowerheader.textContent = actualpowerheadertext;
		actualpowerheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(4)");
		actualpowerheader.dataset['title'] = actualpowerheadertext;
		actualpowerheader.dataset['titleText'] = actualpowerheadertext;
		actualpowerheader.attributes['data-title'].nodeValue = actualpowerheadertext;
		actualpowerheader.attributes['data-title'].value = actualpowerheadertext;
		actualpowerheader.attributes['data-title'].textContent = actualpowerheadertext;
	}
		
	var ratedminheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(5)>div");
	if (ratedminheader){
		var ratedminheadertext = getTranslatedString('ratedminheader');
		ratedminheader.textContent = ratedminheadertext;
		ratedminheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(5)");
		ratedminheader.dataset['title'] = ratedminheadertext;
		ratedminheader.dataset['titleText'] = ratedminheadertext;
		ratedminheader.attributes['data-title'].nodeValue = ratedminheadertext;
		ratedminheader.attributes['data-title'].value = ratedminheadertext;
		ratedminheader.attributes['data-title'].textContent = ratedminheadertext;
	}
	
	var ratedmaxheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(6)>div");
	if (ratedmaxheader){
		var ratedmaxheadertext = getTranslatedString('ratedmaxheader');
		ratedmaxheader.textContent = ratedmaxheadertext;
		ratedmaxheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(6)");
		ratedmaxheader.dataset['title'] = ratedmaxheadertext;
		ratedmaxheader.dataset['titleText'] = ratedmaxheadertext;
		ratedmaxheader.attributes['data-title'].nodeValue = ratedmaxheadertext;
		ratedmaxheader.attributes['data-title'].value = ratedmaxheadertext;
		ratedmaxheader.attributes['data-title'].textContent = ratedmaxheadertext;
	}
	var estimatedbrdvalueheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(7)>div");
	 if (estimatedbrdvalueheader){
		var estimatedbrdvalueheadertext = getTranslatedString('estimatedbrdtempheader');
		estimatedbrdvalueheader.textContent = estimatedbrdvalueheadertext;
		estimatedbrdvalueheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(7)");
		estimatedbrdvalueheader.dataset['title'] = estimatedbrdvalueheadertext;
		estimatedbrdvalueheader.dataset['titleText'] = estimatedbrdvalueheadertext;
		estimatedbrdvalueheader.attributes['data-title'].nodeValue = estimatedbrdvalueheadertext;
	    estimatedbrdvalueheader.attributes['data-title'].value = estimatedbrdvalueheadertext;
		estimatedbrdvalueheader.attributes['data-title'].textContent = estimatedbrdvalueheadertext;
	}
	
	var estimatedvalueheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(8)>div");
	if (estimatedvalueheader){
		var estimatedvalueheadertext = getTranslatedString('estimatedjunctempheader');
		estimatedvalueheader.textContent = estimatedvalueheadertext;
		estimatedvalueheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(8)");
		estimatedvalueheader.dataset['title'] = estimatedvalueheadertext;
		estimatedvalueheader.dataset['titleText'] = estimatedvalueheadertext;
		estimatedvalueheader.attributes['data-title'].nodeValue = estimatedvalueheadertext;
		estimatedvalueheader.attributes['data-title'].value = estimatedvalueheadertext;
		estimatedvalueheader.attributes['data-title'].textContent = estimatedvalueheadertext;
	}
	devicetypeheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(1)>div");
	if (devicetypeheader){
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
	if (comprefdesheader){
		comprefdesheadertext = getTranslatedString('comprefdesheader');
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
	}
	refreshAll();
	localizeOnInit = true;
}

function getData()
{
	if(!dashboardData.length)
		return 0;
	
	for(var i = 0; i < dashboardData.length; ++i){
		if ( activeTemperature == dashboardData[i]["OpTemp"]){
			return dashboardData[i]["deviceData"];
		}
	}
}

function getIgnoredData()
{
	if(!ignoredata.length)
		return [];
	else
		return ignoredata;
}

function getMinMaxValues(data)
{
	minTemp = data[0]["EST_TEMP"], maxTemp = data[0]["EST_TEMP"]; 
	for (var i = 0; i < data.length; i++){
		data[i]["TEMP_RISE"] = data[i]["EST_TEMP"] - activeTemperature;
		if(data[i]["EST_TEMP"] < minTemp)
		{
			minTemp = data[i]["EST_TEMP"];
			continue;
		}
		if(data[i]["EST_TEMP"] > maxTemp)
			maxTemp = data[i]["EST_TEMP"];
	}
}

function computeData() {
	var devicedata = getData();
	ColdCount = 0; NormalCount = 0; WarmCount = 0; HotCount = 0;
	if(devicedata != 0)
	{
		getMinMaxValues(devicedata);
		var trange;
		var tcutoff;
		
		for (var i = 0; i < devicedata.length; i++){
			trange = devicedata[i]["MAX_TJ"] -devicedata[i]["MIN_TJ"] ;
			tcutoff=devicedata[i]["MIN_TJ"] +((slevel/100)*trange);
			if(devicedata[i]["EST_TEMP"] < devicedata[i]["MIN_TJ"]){
				ColdCount++;
				devicedata[i]["CHART_CATEGORY"] = "Cold";
			}
			else if(devicedata[i]["EST_TEMP"] > devicedata[i]["MAX_TJ"]){
				HotCount++;
				devicedata[i]["CHART_CATEGORY"] = "Hot";
			}
			else if(devicedata[i]["EST_TEMP"] >= devicedata[i]["MIN_TJ"] && devicedata[i]["EST_TEMP"]<= tcutoff){
				NormalCount++;
				devicedata[i]["CHART_CATEGORY"] = "Normal";
			}
			else if(devicedata[i]["EST_TEMP"] <= devicedata[i]["MAX_TJ"] && devicedata[i]["EST_TEMP"]> tcutoff){
				WarmCount++;
				devicedata[i]["CHART_CATEGORY"] = "Warm";
			}
		}
	}
	return devicedata;
}

function computeDonutData()
{
	return {"Cold":ColdCount,"Normal":NormalCount,"Warm":WarmCount,"Hot":HotCount};
}

function computeAltDonutData(){
	var data = getIgnoredData();
	var devs = {};
	var otherDevicesCount = 0;
	var unknownDevicesCount = 0;
	
	if(data != 0){
		var check = data.forEach(obj => {
			if( obj.DEVICE_TYPE === "Unknown" || obj.DEVICE_TYPE === "Unrecognised" ) {unknownDevicesCount++;}
			else {otherDevicesCount++;}
		});
	}
	
	var unanalyzedDeviceSummary = {};
	if(otherDevicesCount) unanalyzedDeviceSummary["Ignored"] = otherDevicesCount;
	if(unknownDevicesCount) unanalyzedDeviceSummary["Unknown"] = unknownDevicesCount;
	return unanalyzedDeviceSummary;
}

function computeAltStackedBarData() {
	var data = getIgnoredData();
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
		var device = obj.REFDES;
		var deviceStatus = "Total";
		if (!devstatus.hasOwnProperty(device)){
			devstatus[device] = deviceStatus + ":" + obj.DEVICE_TYPE;
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
	$scope.colhide=false;
	$scope.toggleColumn=function(){
		if($scope.colhide){
			$scope.dashboardTempWidth=100/7;
			$scope.dashboardCompWidth=100/7;
		}
		else{
			$scope.dashboardTempWidth=100/8;
			$scope.dashboardCompWidth=100/9;
		}
	$scope.colhide=!$scope.colhide;
	}
	
	$scope.onAfterReloadData = function(){
		setTimeout(function(){
			document.body.style.cursor = 'default';
			if(!localizeOnInit)
				localize(locale, localeFont);
		}, 0);
	}
	
	ngTableEventsChannel.onAfterReloadData($scope.onAfterReloadData, $scope);
	$scope.mainTableData = computeData();
	$scope.altTableData = getIgnoredData();
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
			tooltipcontent = getTranslatedString('devicetypecoltooltippart1') + this.row["DEVICE_TYPE"] + getTranslatedString('devicetypecoltooltippart2');
		} else if (columnname === 'Refdes'){
			tooltipcontent = getTranslatedString('comprefdescoltooltippart1') + this.row["REFDES"];
		} else if (columnname == 'Category'){
			tooltipcontent = getTranslatedString('subcatcoltooltippart1') + this.row["SUBCATEGORY"];
		} else if (columnname == 'Maximum' ){
			tooltipcontent = getTranslatedString('ratedmaxcoltooltippart1') + this.row["MAX_TJ"] + getTranslatedString('maxestimatedstresscoltooltippart2');
		} else if (columnname == 'Estimated' ){
			tooltipcontent = getTranslatedString('estimatedtempcoltooltippart1') + this.row["EST_TEMP"] + getTranslatedString('maxestimatedstresscoltooltippart2');
		}
		else if (columnname == 'TMIN' ){
			tooltipcontent = "Rated Min Temperature " + "(&degC)";
		}else if (columnname == 'TMAX' ){
			tooltipcontent = "Rated Max Temperature " + "(&degC)";
		}else if (columnname === 'Reason'){
			tooltipcontent = getTranslatedString('unanalyzedreasontooltip');
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
		if (mainView)
			data = $scope.mainTableData;
		else
			data = $scope.altTableData;
		
		$scope.filteredData = [];
		var chart_filter_results = [];
			
		// 1. Apply the chart based filters first
		if ( $scope.doughnutSelection.length != 0 ){ // 1a. Apply the design summary filters here
			for(var k=0; k<$scope.doughnutSelection.length; ++k){
				for(var j=0;j<data.length; ++j){
					if ( mainView ) {
						if(data[j].CHART_CATEGORY == $scope.doughnutSelection[k]){
							chart_filter_results.push(data[j]);
						}
					} else {
						if ( $scope.doughnutSelection[k].indexOf(data[j].CHART_CATEGORY) !== -1)
							chart_filter_results.push(data[j]);
					}
				}		
			}
		} else if ( $scope.barChartSelection.length != 0 ){ // 1b. Apply the device summary filters here
			for(var k=0; k<$scope.barChartSelection.length; ++k){
				for(var j=0;j<data.length; ++j){
					if(data[j].REFDES == $scope.barChartSelection[k]){
						chart_filter_results.push(data[j]);
						break;
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
			var searchProperties = ["DEVICE_TYPE","REFDES","SUBCATEGORY","CHART_CATEGORY","BRD_TEMP","EST_TEMP","MAX_TJ","MIN_TJ","REASON"];
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
			{
				tablesummaryelem.innerHTML = getTranslatedString('filtertext1') + $scope.filteredData.length + getTranslatedString('filtertext2') + data.length + getTranslatedString('filtertext3');
			}
			return true;
	}
	
	
	$scope.singleClickAction = function(row) {
		$scope.selectedId = this.$id;
		$scope.selectedComponent = row.REFDES;
	}

	$scope.doubleClickAction = function(row) {
		var Component = row.REFDES;
		for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
			if ( Component === canonicalpathsjsondata[i].REFDES){
				var hostFunction = "sdaReliability::crossprobeComponent";
				var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].REFDES +  "\" 0";
				callTcl(hostFunction, params, null);
				break;
			}
		}
	}
		
   	$scope.mainTableMenuOptions = [
						{
							text: 	getTranslatedString('highlightcomponentmenutext'),
							click:  function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.REFDES;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].REFDES){
												var hostFunction = "sdaReliability::crossprobeComponent";
												var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].REFDES +  "\" 0";
												callTcl(hostFunction, params, null);
												break;
											}
										}
							}
						},
						{
							text: 	getTranslatedString('dehighlightcomponentmenutext'),
							click: function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.REFDES;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].REFDES){
												var hostFunction = "sdaReliability::crossprobeComponent";
												var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].REFDES +  "\" 1";
												callTcl(hostFunction, params, null);
												break;
											}
										}
									 }
						}
	];
	
	$scope.altTableMenuOptions = [
						{
							text: 	getTranslatedString('highlightcomponentmenutext'),
							click:  function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.REFDES;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].REFDES){
												var hostFunction = "sdaReliability::crossprobeComponent";
												var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].REFDES +  "\" 0";
												callTcl(hostFunction, params, null);
												break;
											}
										}
							}
						},
						{
							text: 	getTranslatedString('dehighlightcomponentmenutext'),
							click: function ($itemScope, $event, modelValue, text, $li){
										var Component = $itemScope.row.REFDES;
										for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
											if ( Component === canonicalpathsjsondata[i].REFDES){
												var hostFunction = "sdaReliability::crossprobeComponent";
												var params = "\"" + canonicalpathsjsondata[i].CanonicalPath + "\"  \"" + canonicalpathsjsondata[i].REFDES +  "\" 1";
												callTcl(hostFunction, params, null);
												break;
											}
										}
									 }
						}
	];
	
	$scope.mainTableParams = new NgTableParams(
						{
							count: $scope.filteredData.length,
							sorting:{'FAIL_MARGIN':'asc'}
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
							sorting:{'DEVICE_TYPE':'asc'}
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
								var stresscolor = 'white';
								switch(this.row["CHART_CATEGORY"])
								{
									case "Cold":
										stresscolor = '#1f78b4';
										break;
									case "Normal": 
										stresscolor = '#1b9e77';
										break;
									case "Warm":
										stresscolor = '#e85d04';
										break;
									case "Hot":
										stresscolor = '#e41a1d';
										break;
								};
							return stresscolor;
						};
		$scope.dashboardTempWidth =100/7;
		$scope.dashboardCompWidth =100/7;							  
	});
	
	dashboardApp.filter('range', function () {
	  return function (value) {
		let target = 20*targetlife;
		  if ( typeof value !== 'undefined'){
							 
			if (value < 0.0) 
			  value = 0.0;
			else if (value > target) 
			  value = 100.0;
			else
		      value = (value/target)*100;
		  }
		  return value;
		}
	});

	dashboardApp.filter('fixedFormat', function () {
	  return function (value) {
			if ( typeof value !== 'undefined'){
				var val = value.toFixed(2);
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
		doughnutChartText = getTranslatedString('altdesignsummarytitle');
		barChartText = getTranslatedString('altdevicesummarytitle');
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
		appScope.altTableData = getIgnoredData();
		appScope.brdfile = brdFileName.split("/").pop();
		appScope.refreshTable();
	}
	var tablerefreshtriggerelem = document.getElementById('refreshDashboardTableTrigger');
	if (tablerefreshtriggerelem){tablerefreshtriggerelem.click();}
}
function drawRangeSlider(){
	rangeSlider = new Slider("#rangeslider", 
								{ 	id: 'rangeslider', 
									min: 0, 
									max: 100, 
									step: 1, 
									handle:'round',
									tooltip: 'always',
									value: slevel,
									formatter: function formatter(val) {
														return val + "%";
												}
								});
	rangeSlider.on('slideStop', function(newval){
		slevel = newval;
		refreshAll();
	});
}

function refreshData(){
	computeData();
	//computeSkippedData();
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
}

function refreshMainStackedBar(animate = true){
	if ( mainStackedBar ){
		var data = getData();
		var emptyMainHistogramBarElem = document.getElementById("empty-mainsummary-stackedbar");
		if(data.length == 0 || data == 0)
			emptyMainHistogramBarElem.style.display = "block";
		else 
			emptyMainHistogramBarElem.style.display = "none";
		mainStackedBar.update(data,animate);
	}
}

function drawAll(){
	slevel = (defslevel === undefined || defslevel == null) ? 90 : defslevel;
	dashboardApp = angular.module("dashboardApp", ["ngTable","ui.bootstrap","ui.bootstrap.buttons","ui.bootstrap.contextMenu","ui.bootstrap.dropdown","infinite-scroll"]);
	
	if ( dashboardData.length != 0){
		var opTemp = dashboardData[0]["OpTemp"];
		setActiveTemperature(opTemp);
		if (document.getElementById("temperatureselection")){drawTemperatureTabs();}
	}
	
	refreshData();	
	var tablevcelem = document.getElementById('tablevisibilitycontrol');
	if ( tablevcelem) {tablevcelem.classList.add('showtable');}
	var chartvcelem = document.getElementById('chartvisibilitycontrol');
	if ( chartvcelem) { chartvcelem.classList.add('showchart'); }
	
	getData();
	if (document.getElementById("mainsummary-donut"))
	{
		var donutData = computeDonutData();
		mainDonut = drawSummaryDonut(donutData,
									'#mainsummary-donut',
									{"Cold":getTranslatedString('Cold'),"Normal":getTranslatedString('Normal'),"Warm":getTranslatedString('Warm'),"Hot":getTranslatedString('Hot')},
									[getTranslatedString("maindonutregion"), getTranslatedString("count"), getTranslatedString("pct")],
									{titles:{"Cold":getTranslatedString("colddonuttooltiptitle"),"Normal":getTranslatedString("normaldonuttooltiptitle"),"Warm":getTranslatedString("warmdonuttooltiptitle"),"Hot":getTranslatedString("hotdonuttooltiptitle")}},
									color_range,
									getTranslatedString("analyzeddevicestxt"),
									'#contentContainer');
	}
	if (document.getElementById("rangeslider")){drawRangeSlider();}
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
		var data = getData();
		mainStackedBar = drawHistogram(data,
						'#mainsummary-stacked-bar',
						{
							createtooltip:function(elementid){
								createtooltipHist(elementid);
							},
							initializetooltip:function(elementid, d){
								var summary =  getTranslatedString("thermalsummary");
								initializetooltipHist(elementid, d, summary);
							},
							showtooltip:function(elementid, d){
								showTooltipBar(elementid, d);
							},
							hidetooltip:function(elementid){
								hideTooltipBar(elementid);
							}
						},
						histogram_color_range,
						min_temp_rise,
						max_temp_rise,
						"REFDES",
						"TEMP_RISE",
						"temperaturerise",
						function(d){
							return d.x0 + ":" + d.x1;
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
								var totalposttext = "(s) " +  getTranslatedString("notanalyzed");
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
	initializeViews();
}

function exportPDF(){ 
	var hostFunction = "sdaReliability::exportDashboardAsPdf";
	var params = " ";
	var showEstJuncTempVal = "";
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		showEstJuncTempVal=appScope.colhide ;
}
	params = ` {-mode ${mode} -percent ${slevel} -showEstJuncTemp ${showEstJuncTempVal} -dumpPath ${dumpPathVal}} `;
	callTcl(hostFunction, params, null);
}

function exportCSV(){
	var hostFunction = "sdaReliability::exportDashboardAsCsv";
	var params = " ";
	var showEstJuncTempVal = "";
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		showEstJuncTempVal=appScope.colhide ;
}
	params = ` {-mode ${mode} -percent ${slevel} -showEstJuncTemp ${showEstJuncTempVal} -dumpPath ${dumpPathVal}} `;
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
							appScope.dynamicTooltipText = getTranslatedString('filtercontroltooltip2');
						else
							appScope.dynamicTooltipText = getTranslatedString('filtercontroltooltip1');
					}
					break;
					}
			case "viewmapcontrol":{
					appScope.dynamicTooltipText = getTranslatedString('viewmapcontroltooltip');
					break;
			}
			case "viewheatmapcontrol":{
					appScope.dynamicTooltipText = getTranslatedString('viewheatmapcontroltooltip');
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
			case "disclaimervisibilitycontrol":{
					appScope.dynamicTooltipText = getTranslatedString('improvetooltip');
					break;
					}
		}
	}
}

 function clickHeatMapControl(){
	addClass('viewheatmapcontrol','configcontrolactive');
	setTimeout(launchHeatMap, 500);
}

function clickThermalMapControl(){
	addClass('viewmapcontrol','configcontrolactive');
	setTimeout(launchTool, 500);
}

function clickConfigControl(){
	addClass('configcontrol','configcontrolactive');
	setTimeout(launchSetupConfig, 500); // Run with 1s delay so that repaint happens.
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
	setTimeout(checkThermalDataStale, 500); // Run with 1s delay so that repaint happens.
	document.body.style.cursor = 'default';
}

function checkThermalDataStale(){   //this will check if data stale or not
	var hostFunction = "sdaReliability::isThermalDataStale";
    var params = "";
    callTcl(hostFunction, params);
}

function clickSyncControl(){
	addClass('reruncontrol','syncactive');
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
					document.getElementById('querysynctext').innerHTML = getTranslatedString('needsynctextdetailed');
				} else {
					document.getElementById('querysynctext').innerHTML = getTranslatedString('donotneedsynctext');
				}
			}
			document.getElementById('querySyncDiv').style.display = 'block';
			addClass('querySyncDiv', 'fadingIn');
			
		}
	});
}

function cancelSync(){
	removeClass('reruncontrol','syncactive');
	removeClass('querySyncDiv','fadingIn'); 
	document.getElementById('querySyncDiv').style.display='none';
}

function cancelActive() {
	removeClass('reruncontrol', 'syncactive');
	removeClass('queryIsDesignReadOnly', 'fadingIn');
	document.getElementById('queryIsDesignReadOnly').style.display = 'none';
}

function triggerSync(){
	removeClass('querySyncDiv','fadingIn'); 
	document.getElementById('querySyncDiv').style.display='none';
	setTimeout(runThermal, 500); // Run with 1s delay so that dialog goes away.
}

function syncCheckOK(){
	removeClass('infoSyncCheckDiv','fadingIn'); 
	document.getElementById('infoSyncCheckDiv').style.display='none';
}

function runThermal(){
	addClass('reruncontrol','syncactive');
	var hostFunction = "sdaReliability::runThermalAnalysis";
	var params = " ";
	callTcl(hostFunction, params, null);
	removeClass('reruncontrol','syncactive');
	document.body.style.cursor = 'default';
}

function launchHeatMap(){
	document.body.style.cursor = 'progress';
	var params = " ";
	var hostFunction = "sdaReliability::viewHeatMap";
	params += activeTemperature + " ";
	removeClass('viewheatmapcontrol','configcontrolactive');
	document.body.style.cursor = 'default';
    callTcl(hostFunction, params);
}
function launchTool(){
	document.body.style.cursor = 'progress';
	var params = " ";
	var hostFunction = "sdaReliability::launchCelsius";
    params += activeTemperature + " ";
	removeClass('viewmapcontrol','configcontrolactive');
	document.body.style.cursor = 'default';
    callTcl(hostFunction, params);
}

drawAll();
getChartHeaderText();

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
	if(document.getElementById("viewheatmapcontrol")){
		document.getElementById("viewheatmapcontrol").onclick = clickHeatMapControl;
		document.getElementById("viewheatmapcontrol").onmouseover = getToolTip;
	}																	 
	if(document.getElementById("viewmapcontrol")){
		document.getElementById("viewmapcontrol").onclick = clickThermalMapControl;
		document.getElementById("viewmapcontrol").onmouseover = getToolTip;
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
	if(document.getElementById("reruncontrol")){
		document.getElementById("reruncontrol").onclick = clickSyncControl;
		document.getElementById("reruncontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("disclaimervisibilitycontrol")){
		document.getElementById("disclaimervisibilitycontrol").onclick = function(){
			addClass('disclaimervisibilitycontrol','disclaimeractive');
			document.getElementById('modaldisclaimerDiv').style.display='block';
			addClass('modaldisclaimerDiv','fadingIn');
		}
		document.getElementById("disclaimervisibilitycontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("closeDisclaimerBtn")){
		document.getElementById("closeDisclaimerBtn").onclick = function(){
			removeClass('disclaimervisibilitycontrol','disclaimeractive');
			removeClass('modaldisclaimerDiv','fadingIn'); 
			document.getElementById('modaldisclaimerDiv').style.display='none';
		}
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
	
	var temptabs =  document.querySelectorAll("#temperaturetabs>a");
	if ( temptabs){
		for(var i = 0; i < temptabs.length; ++i){
			var tempelem = temptabs[i];
			tempelem.onclick = function(){
				// Get the currently active temperature tab
				var activetemptab = document.querySelector("#temperaturetabs>a.active");
				if ( (activetemptab == this)){return;}
				// Remove active class from active tab and hide it's contents
				activetemptab.classList.remove("active");
				// Make this tab active
				this.classList.add("active");
				var activeTemp = this.text.replace(/[^\x00-\x7F]/g, "");
				setActiveTemperature(activeTemp);
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
	
	window.addEventListener("resize", resizecharts);
	initUI();
	setupLocale(locale, localeFont);
	var loadingelem = document.getElementById('loading');
	loadingelem.style.opacity = 0;
	loadingelem.classList.add('hidden');
	var contentelem = document.getElementById('content');
	contentelem.style.opacity = 1;
	if ( isresultstale ){
		addClass('syncicon','ripple');
	}
});
