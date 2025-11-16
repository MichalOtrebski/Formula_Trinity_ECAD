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
var HighCount;
var ModerateCount;
var LowCount;
var skippedDevicesCount;
var unknownDevicesCount;
var stressedDeviceCount;
var activeTemperature;
var pcbLife;
var targetLife;
var conversionFactor = 8760;
var mode = "MTBF";
var slevel = 0;
var dumpPathVal = "";				   
var skip_stress_data = [];
var displayStandardName = "";

var mtbfLabel = "";
var mtbfStandard = "";
var mtbfStressText = "";
var useStress = false;

var localizeOnInit = false;
var locale = "en";
var localeFont = "";

var MTBFStandards = {
	MIL : "mil_hdbk_217f",
	FIDES : "fides"
}

var displayCategorties = [getTranslatedString("highexpectancy"), getTranslatedString("moderateexpectancy"), getTranslatedString("lowexpectancy"), getTranslatedString("Unanalyzed")];
var skippedDisplayCategorties = [getTranslatedString("Skipped"),getTranslatedString("Stressed")];
var color_range = ["#1b9e77","#e6ab02","#e41a1d", "#9ea396"]; //good:green, bad:yellow, ugly:red, ignored:grey
var skip_color_range = ["#e41a1d","#1f78b4","#a6cee3"]; //skipped: blue, unknown:ligh_blue

var deviceStatus = {
	STATUS_OK:0,
	STATUS_DATA_NOT_FOUND:1,	
	STATUS_FAIL:2,
	STATUS_TMIN_FAIL:3,
	STATUS_UNKNOWN:4,
	STATUS_IGNORE:5,
	STATUS_BOM_IGNORE:6,
	STATUS_REL_IGNORE:7,
	STATUS_PARAM_MISSING:8
}

function localize(language, font){
	stdformatter = new Intl.NumberFormat(language,standardoption);
	scientificformatter = new Intl.NumberFormat(language,scientificoption);
	i18next.changeLanguage(language);

	if(language != "en")
	{
		var body = document.body;
		body.style.fontFamily = font;
	}
	
	var mtbfTab =  document.querySelector(".navigationtabs>li>a");
	mtbfTab.innerHTML = getTranslatedString('featuretitle');
	var designsummaryTitle = document.querySelector("#donutTitle");
	designsummaryTitle.innerHTML = getTranslatedString('designsummarytitle');
	var devicesummaryTitle = document.querySelector("#barTitle");
	devicesummaryTitle.innerHTML = getTranslatedString('devicesummarytitle');
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
	var standard = document.querySelector("#mtbfstandarddiv");
	if(standard){
		standard.innerHTML = getTranslatedString('standard') + displayStandardName;
	}	
	var estimatedPcbLife = document.querySelector("#estimatedpcblife");
	if(estimatedPcbLife){
		estimatedPcbLife.innerHTML = getTranslatedString('estimatedpcb1');
	}
	var yrsText = document.querySelector("#yrs");
	if(yrsText){
		yrsText.innerHTML = getTranslatedString('yrstext');
	}
	var environment = document.querySelector("#mtbfenvdiv");
	if(environment){
		if(mtbfStandard == MTBFStandards.MIL)
			environment.innerHTML = getTranslatedString('environment') + mtbfLabel;
		else if (mtbfStandard == MTBFStandards.FIDES)
			environment.innerHTML = getTranslatedString('profile') + mtbfLabel;
	}
	
	var usestressresultText = document.querySelector("#mtbfdatadiv");
	if(usestressresultText){
		if(useStress)
			usestressresultText.innerHTML = getTranslatedString('useStressResults');
		else
			usestressresultText.innerHTML = getTranslatedString('withoutStressResults');
	}

	var targetLifeText = document.querySelector("#targetlife");
	if(targetLifeText){
		targetLifeText.innerHTML = getTranslatedString('targetlifetext') + targetlife + getTranslatedString('yrstext');
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
	
	var showStdCompMap = document.querySelector("#showStdComp");
	if(showStdCompMap){
		showStdCompMap.innerHTML = getTranslatedString('showStdCompBtn');
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
	
	localizeHeaders(false);
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
		appScope.mainTableMenuOptions[2].text = getTranslatedString("configcontroltooltip");
		appScope.altTableMenuOptions[0].text = getTranslatedString("highlightcomponentmenutext");
		appScope.altTableMenuOptions[1].text = getTranslatedString("dehighlightcomponentmenutext");
		appScope.altTableMenuOptions[2].text = getTranslatedString("configcontroltooltip");
	}
	refreshAll();
	localizeOnInit = true;
}

function localizeHeaders(isCompMapColVisible){
	var estimatedfitheadertext;
	if(mtbfStandard == MTBFStandards.MIL)
		estimatedfitheadertext = getTranslatedString('estimatedfailurerateheader');
	else if (mtbfStandard == MTBFStandards.FIDES)
		estimatedfitheadertext = getTranslatedString('estimatedfitheader');

	var estimatedmtbfheadertext;
	if(mtbfStandard == MTBFStandards.MIL)
		estimatedmtbfheadertext = getTranslatedString('estimatedmtbfheader');
	else if (mtbfStandard == MTBFStandards.FIDES)
		estimatedmtbfheadertext = getTranslatedString('estimatedmtbfheaderfides');

	//if standard_component_mapping column is invisible, do the below translation
	if(!isCompMapColVisible)
	{
		var estimatedfitheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(4)>div");
		if(estimatedfitheader){
			estimatedfitheader.textContent = estimatedfitheadertext;
			estimatedfitheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(4)");
			estimatedfitheader.dataset['title'] = estimatedfitheadertext;
			estimatedfitheader.dataset['titleText'] = estimatedfitheadertext;
			estimatedfitheader.attributes['data-title'].nodeValue = estimatedfitheadertext;
			estimatedfitheader.attributes['data-title'].value = estimatedfitheadertext;
			estimatedfitheader.attributes['data-title'].textContent = estimatedfitheadertext;
		}
		
		var estimatedmtbfheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(5)>div");
		if(estimatedmtbfheader){
			estimatedmtbfheader.textContent = estimatedmtbfheadertext;
			estimatedmtbfheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(5)");
			estimatedmtbfheader.dataset['title'] = estimatedmtbfheadertext;
			estimatedmtbfheader.dataset['titleText'] = estimatedmtbfheadertext;
			estimatedmtbfheader.attributes['data-title'].nodeValue = estimatedmtbfheadertext;
			estimatedmtbfheader.attributes['data-title'].value = estimatedmtbfheadertext;
			estimatedmtbfheader.attributes['data-title'].textContent = estimatedmtbfheadertext;
		}
		
		var estimatedlifeheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(6)>div");
		if (estimatedlifeheader){
			var estimatedlifeheadertext = getTranslatedString('estimatedlifeheader');
			estimatedlifeheader.textContent = estimatedlifeheadertext;
			estimatedlifeheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(6)");
			estimatedlifeheader.dataset['title'] = estimatedlifeheadertext;
			estimatedlifeheader.dataset['titleText'] = estimatedlifeheadertext;
			estimatedlifeheader.attributes['data-title'].nodeValue = estimatedlifeheadertext;
			estimatedlifeheader.attributes['data-title'].value = estimatedlifeheadertext;
			estimatedlifeheader.attributes['data-title'].textContent = estimatedlifeheadertext;
		}
		
		var lifeexpectancyheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(7)>div");
		if (lifeexpectancyheader){
			var lifeexpectancyheadertext = getTranslatedString('lifeexpectancyheader');
			lifeexpectancyheader.textContent = lifeexpectancyheadertext;
			lifeexpectancyheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(7)");
			lifeexpectancyheader.dataset['title'] = lifeexpectancyheadertext;
			lifeexpectancyheader.dataset['titleText'] = lifeexpectancyheadertext;
			lifeexpectancyheader.attributes['data-title'].nodeValue = lifeexpectancyheadertext;
			lifeexpectancyheader.attributes['data-title'].value = lifeexpectancyheadertext;
			lifeexpectancyheader.attributes['data-title'].textContent = lifeexpectancyheadertext;
		}
	}
	else
	{
		var standardmappingheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(4)>div");
		if(standardmappingheader){
			var standardmappingheadertext = getTranslatedString('stdCompMappingheader');
			standardmappingheader.textContent = standardmappingheadertext;
			standardmappingheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(4)");
			standardmappingheader.dataset['title'] = standardmappingheadertext;
			standardmappingheader.dataset['titleText'] = standardmappingheadertext;
			standardmappingheader.attributes['data-title'].nodeValue = standardmappingheadertext;
			standardmappingheader.attributes['data-title'].value = standardmappingheadertext;
			standardmappingheader.attributes['data-title'].textContent = standardmappingheadertext;
		}
		
		var estimatedfitheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(5)>div");
		if(estimatedfitheader){
			estimatedfitheader.textContent = estimatedfitheadertext;
			estimatedfitheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(5)");
			estimatedfitheader.dataset['title'] = estimatedfitheadertext;
			estimatedfitheader.dataset['titleText'] = estimatedfitheadertext;
			estimatedfitheader.attributes['data-title'].nodeValue = estimatedfitheadertext;
			estimatedfitheader.attributes['data-title'].value = estimatedfitheadertext;
			estimatedfitheader.attributes['data-title'].textContent = estimatedfitheadertext;
		}
		
		var estimatedmtbfheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(6)>div");
		if(estimatedmtbfheader){
			estimatedmtbfheader.textContent = estimatedmtbfheadertext;
			estimatedmtbfheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(6)");
			estimatedmtbfheader.dataset['title'] = estimatedmtbfheadertext;
			estimatedmtbfheader.dataset['titleText'] = estimatedmtbfheadertext;
			estimatedmtbfheader.attributes['data-title'].nodeValue = estimatedmtbfheadertext;
			estimatedmtbfheader.attributes['data-title'].value = estimatedmtbfheadertext;
			estimatedmtbfheader.attributes['data-title'].textContent = estimatedmtbfheadertext;
		}
		
		var estimatedlifeheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(7)>div");
		if (estimatedlifeheader){
			var estimatedlifeheadertext = getTranslatedString('estimatedlifeheader');
			estimatedlifeheader.textContent = estimatedlifeheadertext;
			estimatedlifeheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(7)");
			estimatedlifeheader.dataset['title'] = estimatedlifeheadertext;
			estimatedlifeheader.dataset['titleText'] = estimatedlifeheadertext;
			estimatedlifeheader.attributes['data-title'].nodeValue = estimatedlifeheadertext;
			estimatedlifeheader.attributes['data-title'].value = estimatedlifeheadertext;
			estimatedlifeheader.attributes['data-title'].textContent = estimatedlifeheadertext;
		}
		
		var lifeexpectancyheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(8)>div");
		if (lifeexpectancyheader){
			var lifeexpectancyheadertext = getTranslatedString('lifeexpectancyheader');
			lifeexpectancyheader.textContent = lifeexpectancyheadertext;
			lifeexpectancyheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(8)");
			lifeexpectancyheader.dataset['title'] = lifeexpectancyheadertext;
			lifeexpectancyheader.dataset['titleText'] = lifeexpectancyheadertext;
			lifeexpectancyheader.attributes['data-title'].nodeValue = lifeexpectancyheadertext;
			lifeexpectancyheader.attributes['data-title'].value = lifeexpectancyheadertext;
			lifeexpectancyheader.attributes['data-title'].textContent = lifeexpectancyheadertext;
		}
	}
}

function getData()
{
	if(!dashboardData.length)
		return 0;
	for(var i = 0; i < dashboardData.length; ++i){
		if ( activeTemperature == dashboardData[i]["OpTemp"]){
			return dashboardData[i]["MTBFResults"];
		}
	}
}

function computeData() {
	var pcb_mtbf, pcb_fit;
	var summaryData = [];
	var mtbfdata = getData();
	for(var i = 0; i < mtbfdata.length; i++){
		switch(i){
			case 0: pcb_fit = mtbfdata[i].FIT_PCB;
					break;
			case 1: pcb_mtbf = mtbfdata[i].MTBF_PCB;
					break;
			case 2:	summaryData = mtbfdata[i]["deviceData"];
					break;
		}
	}

	HighCount = 0;
	ModerateCount = 0;
	LowCount = 0;
	
	var power;
	if(mtbfStandard == MTBFStandards.MIL)
		power = Math.pow(10,6);
	else if (mtbfStandard == MTBFStandards.FIDES)
		power = Math.pow(10,9);
	
	pcbLife = (pcb_mtbf * power) / conversionFactor;

	for (var i = 0; i < summaryData.length; i++){
		var devicelife = (summaryData[i]["MTBF"] * power) / conversionFactor;
		var val = devicelife.toFixed(1);
		summaryData[i]["deviceLife"] = val;
		if(devicelife <= (2 * targetlife)){
			LowCount++;
			summaryData[i]["chartCategory"] = "Low";
		} else if(devicelife > (10 * targetlife)){
			HighCount++;
			summaryData[i]["chartCategory"] = "High";
		} else {
			ModerateCount++;
			summaryData[i]["chartCategory"] = "Moderate";
		}
		
		var lifeExpectancy = (devicelife/(20 * targetlife)) * 100;
		summaryData[i]["lifeExpectancy"] = lifeExpectancy.toFixed(2);
	}
	
	return summaryData;
}

function computeDonutData()
{
	return {"High":HighCount,"Moderate":ModerateCount,"Low":LowCount};
}

function computeSkippedData(){
	var data = [];
	var ignoreddata = getData();
	stressedDeviceCount = 0;
	skippedDevicesCount = 0;
	unknownDevicesCount = 0;

	for(var i = 0; i < ignoreddata.length; i++){
		if(ignoreddata[i]["unanalyzedDeviceData"]){
			data = ignoreddata[i]["unanalyzedDeviceData"];
		}
	}

	if(data.length)
	{
		for(var s = 0; s < data.length; s++){
			switch(data[s].Status){
				case deviceStatus.STATUS_FAIL:
				{
					stressedDeviceCount++;
					data[s]["Reason"] = data[s]["ERROR_MESSAGE"];
					data[s]["chartCategory"] = "Stressed";
					break;
				}
				case deviceStatus.STATUS_DATA_NOT_FOUND:
				{
					skippedDevicesCount++;
					data[s]["Reason"] = getTranslatedString('stressdatanotavailable');
					data[s]["chartCategory"] = "Skipped";
					break;
				}
				case deviceStatus.STATUS_TMIN_FAIL:
				{
					skippedDevicesCount++;
					data[s]["Reason"] = getTranslatedString('tminop');
					data[s]["chartCategory"] = "Skipped";
					break;
				}
				case deviceStatus.STATUS_UNKNOWN: 
				{
					unknownDevicesCount++;
					if(data[s]["DEVICE_TYPE"]=="UNRECOGNISED" && data[s]["SUBCATEGORY"]=="UNRECOGNISED"){
						data[s]["DEVICE_TYPE"]="UNRECOGNIZED";
						data[s]["SUBCATEGORY"]="UNRECOGNIZED";
					}
					data[s]["Reason"] = getTranslatedString('unknowndevice');
					data[s]["chartCategory"] = getTranslatedString('Unrecognised');
					break;
				}
	            case deviceStatus.STATUS_BOM_IGNORE: 
				{
					skippedDevicesCount++;
					data[s]["Reason"] = getTranslatedString('compignorestr') + data[s].REFDES + getTranslatedString('bomignorestr');
					data[s]["chartCategory"] = "Skipped";
					break;
				}
				case deviceStatus.STATUS_REL_IGNORE: 
				{
					skippedDevicesCount++;
					data[s]["Reason"] = getTranslatedString('compignorestr') + data[s].REFDES + getTranslatedString('relignorestr');
					data[s]["chartCategory"] = "Skipped";
					break;
				}
				case deviceStatus.STATUS_PARAM_MISSING:
				{
					skippedDevicesCount++;
					data[s]["Reason"] = data[s]["ERROR_MESSAGE"];
					data[s]["chartCategory"] = "Skipped";
					break;
				}
				case deviceStatus.STATUS_IGNORE:
				{
					skippedDevicesCount++;
					data[s]["Reason"] = getTranslatedString('devicenotsupported1') + data[s].SUBCATEGORY + getTranslatedString('devicenotsupported2');
					data[s]["chartCategory"] = "Skipped";
					break;
				}
				default:
				{
					skippedDevicesCount++;
					data[s]["Reason"] = data[s]["ERROR_MESSAGE"];
					data[s]["chartCategory"] = "Skipped";
				}
			}
		}
	}
	return data;
}

function computeAltDonutData(){
	return {"Stressed":stressedDeviceCount,"Skipped":skippedDevicesCount,"Unrecognized":unknownDevicesCount};
}

function computeStackedBarData() {
	var data = computeData();
	var skip_stress_data = computeSkippedData();
	var barData = []; var counts = []; var ignoredCounts = [];
	let totalCount = 0;
	
	var check = data.forEach(obj => {
		counts[obj.DEVICE_TYPE] = counts[obj.DEVICE_TYPE] ? counts[obj.DEVICE_TYPE] + 1 : 1;
		var categoryChart = obj.DEVICE_TYPE + ":" + obj.chartCategory;
		counts[categoryChart] = counts[categoryChart] ? counts[categoryChart] + 1 : 1;
	});

	if(skip_stress_data)
	{
		check = skip_stress_data.forEach(obj => {
			ignoredCounts[obj.DEVICE_TYPE] = ignoredCounts[obj.DEVICE_TYPE] ? ignoredCounts[obj.DEVICE_TYPE] + 1 : 1;
		});
		
		Object.keys(ignoredCounts).forEach(function(key) {
			if(!counts[key])
				counts[key] = 0;
			counts[key + ":Unanalyzed"] = ignoredCounts[key];
			
			counts[key] += ignoredCounts[key];
		});
	}
	
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
				}									   										 
			}
			totalCount += value;
		}
	});

	for(let i=0; i < barData.length; i++){
		if(barData[i].Key == "UNRECOGNIZED"){
			barData[i].Key =  getTranslatedString('Unrecognised');
		}
	}

	let outlierCountData = [];
	let checksData = [];

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
	var data = computeSkippedData();
	var barData = []; var counts = [];
	var totalCount = 0;		 
	let outlierCountData = [];	
	
	if(!data.length)
		return {
			barCount : barData,
			outlierCount : outlierCountData
		};
	var check = data.forEach(obj => {
		counts[obj.DEVICE_TYPE] = counts[obj.DEVICE_TYPE] ? counts[obj.DEVICE_TYPE] + 1 : 1;
		var categoryChart = obj.DEVICE_TYPE + ":" + obj.chartCategory;
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
				}									   										 
			}
			totalCount += value;
		}
	});

	for (let i = barData.length - 1; i >= 0; --i) {
		let total = 0;
		if(barData[i].Key === "UNRECOGNIZED"){
			barData.splice(i, 1);
			continue;
		}
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
	$scope.targetLife = targetlife;
	$scope.pcblife = pcbLife.toFixed(1);
	$scope.totalUnanalyzedDevices = getData()[3]["unanalyzedDeviceData"].length;
	$scope.totalDevices = getData()[2]["deviceData"].length + $scope.totalUnanalyzedDevices ;
	if(mtbfStandard == MTBFStandards.MIL)
		$scope.mtbfLabel = getTranslatedString('environment') + mtbfLabel;
	else if (mtbfStandard == MTBFStandards.FIDES)
		$scope.mtbfLabel = getTranslatedString('profile') + mtbfLabel;

	$scope.standard = getTranslatedString('standard') + displayStandardName;
	$scope.useStress = useStress;
	
	if($scope.useStress)
		mtbfStressText = getTranslatedString('useStressResults');
	else
		mtbfStressText = getTranslatedString('withoutStressResults');
	
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
	
	$scope.onAfterReloadData = function(){
		setTimeout(function(){
			document.body.style.cursor = 'default';
			if(!localizeOnInit)
				localize(locale, localeFont);
		}, 0);
	}
	
	$scope.colhide = false;
	$scope.toggleColumn = function(){
		$scope.colhide = !$scope.colhide;
		//Apply different style when column is hidden is is visible
		if($scope.colhide)
		{
			if (document.getElementById("dataTable"))
			{
				addClass('dataTable', 'newTableStyle');
				addClass('dataTable', 'stdCompMapColStyle');
			}
		}
		else
		{
			if (document.getElementById("dataTable"))
			{
				removeClass('dataTable', 'newTableStyle');
				removeClass('dataTable', 'stdCompMapColStyle');
			}
		}
		setTimeout(function(){
			localizeHeaders($scope.colhide);
		}, 1);
	}
	
	ngTableEventsChannel.onAfterReloadData($scope.onAfterReloadData, $scope);
	$scope.mainTableData = computeData();
	$scope.altTableData = computeSkippedData();
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
	
	$scope.handleMouseEnterEvent = function(columnname = ""){
		var tabletooltipelem = document.querySelector(".tabledatatooltip");
		if (columnname === 'Refdes' && this.row["USE_DEFAULT"] === 0)
			tabletooltipelem.style.display = 'none';
		else
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
			tooltipcontent = getTranslatedString('invalidvaluetoolttippart1') + this.row["REFDES"] + getTranslatedString('invalidvaluetoolttippart2');
		} else if (columnname == 'Category'){
			tooltipcontent = getTranslatedString('subcatcoltooltippart1') + this.row["SUBCATEGORY"];
		} else if (columnname == 'MTBF' ){
			var mtbf = this.row.MTBF.toFixed(3);
			var tooltip1 = getTranslatedString('estimatedfailureratecoltooltippart1'); var tooltip2;
			if(mtbfStandard == MTBFStandards.MIL)
				tooltip2 = getTranslatedString('estimatedmtbfcoltooltippart2');
			if(mtbfStandard == MTBFStandards.FIDES)
				tooltip2 = getTranslatedString('estimatedmtbfcolfidestooltippart2');

			tooltipcontent = tooltip1 + mtbf + tooltip2;
		} else if (columnname == 'FIT' ){
			var fit = this.row.FIT.toFixed(3);
			var tooltip1, tooltip2;
			if(mtbfStandard == MTBFStandards.MIL)
			{
				tooltip1 = getTranslatedString('estimatedfailureratecoltooltippart1');
				tooltip2 = getTranslatedString('estimatedfailureratecoltooltippart2');
			}
			if(mtbfStandard == MTBFStandards.FIDES)
			{
				tooltip1 = getTranslatedString('estimatedfitcoltooltippart1');
				tooltip2 = getTranslatedString('estimatedfitcoltooltippart2');
			}
			tooltipcontent = tooltip1 + fit + tooltip2;
		} else if (columnname == 'Life' ){
			var life = this.row.deviceLife.toFixed(3);
			tooltipcontent = getTranslatedString('estimatedlifecoltooltippart1') + life + getTranslatedString('estimatedlifecoltooltippart2');
		} else if (columnname === 'Reason'){
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
						if(data[j].chartCategory == $scope.doughnutSelection[k]){
							chart_filter_results.push(data[j]);
						}
					} else {
						if ( $scope.doughnutSelection[k].indexOf(data[j].chartCategory) !== -1)
							chart_filter_results.push(data[j]);
					}
				}		
			}
		} else if ( $scope.barChartSelection.length != 0 ){ // 1b. Apply the device summary filters here
			for(var j=0;j<data.length; ++j){
				for(var k=0; k<$scope.barChartSelection.length; ++k){
					if ( $scope.barChartSelection[k].includes(data[j].DEVICE_TYPE) && $scope.barChartSelection[k].includes(data[j].chartCategory)){
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
			var searchProperties = ["DEVICE_TYPE","REFDES","SUBCATEGORY","MTBF","FIT","Life","Reason"];
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
							text: getTranslatedString('dehighlightcomponentmenutext'),
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
									 },
							hasBottomDivider: true
						},
						{
							text: 	getTranslatedString('configcontroltooltip'),
							click: 	function ($itemScope, $event, modelValue, text, $li) {
								$scope.selectedComponent = $itemScope.row.REFDES;
								clickConfigControl();
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
									 },
							hasBottomDivider: true
						},
						{
							text: 	getTranslatedString('configcontroltooltip'),
							click: 	function ($itemScope, $event, modelValue, text, $li) {
								$scope.selectedComponent = $itemScope.row.REFDES;
								clickConfigControl();
							}
						}
	];
	
	$scope.mainTableParams = new NgTableParams(
						{
							count: $scope.filteredData.length,
							sorting:{'FIT':'desc'}
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
							sorting:{'REFDES':'asc'}
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
	
	$scope.getGradient = function(value){
							var backgroundimage;
							var finalRed = 27;
							var finalGreen = 158;
							var finalBlue = 119;
							var middleRed = 230;
							var middleGreen = 171;
							var middleBlue = 2;
							var startRed = 228;
							var startGreen = 26;
							var startBlue = 28;
							var stopRed;
							var stopGreen;
							var stopBlue;
							var startCol = `rgb(${startRed},${startGreen},${startBlue})`;
							if ( value < 50)
							{
								var stopRed = Math.round( startRed + ((value/50)*(middleRed - startRed)));
								var stopGreen = Math.round( startGreen + ((value/50)*(middleGreen - startGreen)));
								var stopBlue = middleBlue;
								
								var stopCol = `rgb(${stopRed},${stopGreen},${stopBlue})`;
								backgroundimage =  `linear-gradient(to right, ${startCol} 0%, ${stopCol} 100%)`;
							}
							else
							{
								var middleCol = `rgb(${middleRed},${middleGreen},${middleBlue})`;
								var stopRed = Math.round(middleRed + (((value-50)/50)*(finalRed - middleRed)));
								var stopGreen = Math.round(middleGreen + (((value-50)/50)*(finalGreen - middleGreen)));
								var stopBlue = finalBlue;
								var stopCol = `rgb(${stopRed},${stopGreen},${stopBlue})`;
								backgroundimage =  `linear-gradient(to right, ${startCol} 0%, ${middleCol} 50%, ${stopCol} 100%)`;
							}
							return backgroundimage;
						};
	
	$scope.getCategoryColor = function(){
								var stresscolor = 'white';
								switch(this.row["chartCategory"])
								{
									case "High": 
										stresscolor = '#1b9e77';
										break;
									case "Moderate":
										stresscolor = '#e6ab02';
										break;
									case "Low":
										stresscolor = '#e41a1d';
										break;
								};
							return stresscolor;
						};
	
	$scope.getColumnWidth = function(columnname){
							var tooltipcontent = "";
							if (columnname === 'Device')
							{
								if(!$scope.colhide)
									return '7%';
								else
									return '6%';
							} 
							else if (columnname === 'Component')
							{
								if(!$scope.colhide)
									return '7%';
								else
									return '5%';
							} 
							else if (columnname == 'COMP_MAP')
							{
								if(!$scope.colhide)
									return '7%';
								else
									return '10%';
							}
							else if (columnname == 'SUBCATEGORY')
							{
								if(!$scope.colhide)
									return '10%';
								else
									return '9%';
							}
							else if (columnname == 'FIT')
							{
								if(!$scope.colhide)
									return '10%';
								else
									return '8%';
							} 
							else if (columnname == 'Life')
							{
								if(!$scope.colhide)
									return '10%';
								else
									return '10%';
							} 
							else if (columnname == 'MTBF' )
							{
								if(!$scope.colhide)
									return '12%';
								else
									return '10%';
							}
	}
	
	$scope.getMarginValue = function(){
							if(mtbfStandard == MTBFStandards.FIDES)
								return "10px";
							else
								return "-15px";
						};
						
	$scope.getStatusColor = function(){
								var statuscolor = '#1f78b4';
								switch(this.row["Status"])
								{
									case deviceStatus.STATUS_FAIL: 
										statuscolor = '#e41a1d';
										break;
									case deviceStatus.STATUS_UNKNOWN: 
										statuscolor = '#a6cee3';
										break;
								};
							return statuscolor;
						};
						
	$scope.getDefaultValueIconDisplay = function(){
							if(this.row["USE_DEFAULT"] === 0)
								return "none";
						};
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
				var val = value.toFixed(3);
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
		appScope.altTableData = computeSkippedData();
		appScope.pcblife = pcbLife.toFixed(1);
		
		if(mtbfStandard == MTBFStandards.MIL)
			appScope.mtbfLabel = getTranslatedString('environment') + mtbfLabel;
		else if (mtbfStandard == MTBFStandards.FIDES)
			appScope.mtbfLabel = getTranslatedString('profile') + mtbfLabel;
		
		appScope.standard = getTranslatedString('standard') + displayStandardName;
		appScope.refreshTable();
	}
	
	var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
	var targetlifeelem = document.getElementById('targetlife');
	var pcbsummaryelem = document.getElementById('pcbsummary');
	if ( targetlifeelem && pcbsummaryelem && togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
		pcbsummaryelem.style.display = "none";
	else 
		pcbsummaryelem.style.display = "block";
	
	
	var tablerefreshtriggerelem = document.getElementById('refreshDashboardTableTrigger');
	if (tablerefreshtriggerelem){tablerefreshtriggerelem.click();}
}

function refreshData(){
	computeData();
	computeSkippedData();
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

function drawAll(){
	dashboardApp = angular.module("dashboardApp", ["ngTable","ui.bootstrap","ui.bootstrap.buttons","ui.bootstrap.contextMenu","ui.bootstrap.dropdown","infinite-scroll"]);
	
	if ( dashboardData.length != 0){
		var opTemp = dashboardData[0]["OpTemp"];
		setActiveTemperature(opTemp);
	}
	
	refreshData();
	var temptabelem = document.getElementById("temperatureselection"); 
	if (temptabelem)
	{
		if(opTemp == "NA")
			temptabelem.style.display = "none";
		else
			drawTemperatureTabs();
	}
	
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
									{"High":getTranslatedString("High"),"Moderate":getTranslatedString("Moderate"),"Low":getTranslatedString("Low")},
									[getTranslatedString("maindonutregion"), getTranslatedString("count"), getTranslatedString("pct")],
									{titles:{"High":getTranslatedString("highdonuttooltiptitle"),"Moderate":getTranslatedString("moderatedonuttooltiptitle"),"Low":getTranslatedString("lowdonuttooltiptitle")}},
									color_range,
									getTranslatedString("analyzeddevicestxt"),
									'#contentContainer');
	}
	if (document.getElementById("altsummary-donut"))
	{
		var altdonutData = computeAltDonutData();
		altDonut = drawSummaryDonut(altdonutData,
									'#altsummary-donut',
									{"Stressed":getTranslatedString("Stressed"),"Skipped":getTranslatedString("Skipped"),"Unrecognized":getTranslatedString("Unrecognised")},
									[getTranslatedString("reason"), getTranslatedString("count"), getTranslatedString("pct")],
									{titles:{"Stressed":getTranslatedString("stresseddonuttooltiptitle"),"Skipped":getTranslatedString("skippeddonuttooltiptitle"),"Unrecognized":getTranslatedString("unrecognizeddonuttooltiptitle")}},
									skip_color_range,
									getTranslatedString("devicesskipped"),
									'#contentContainer');
	}

	if (document.getElementById("mainsummary-stacked-bar"))
	{
		var data = computeStackedBarData();
		mainStackedBar = drawStackedBar(data,
					   '#mainsummary-stacked-bar',
		               ["HighCount", "ModerateCount", "LowCount", "UnanalyzedCount"],
					   {
							createtooltip: function(elementid){
								createTooltipBar(elementid, displayCategorties);
							},
							initializetooltip:function(elementid, d){
							var summary = " " + getTranslatedString('summary');
							if(d.data.Key === "Unknown" || d.data.Key === "Unrecognized")
								var totalposttext = " " + getTranslatedString('analyzed');
							else
								var totalposttext = "s " +  getTranslatedString('analyzed');
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
		               ["StressedCount","SkippedCount"],
					   {
							createtooltip:function(elementid){
								createTooltipBar(elementid, skippedDisplayCategorties);
							},
							initializetooltip:function(elementid, d){
								var summary = " " + getTranslatedString('summary');
								var totalposttext = "s " +  getTranslatedString('notanalyzed');
								initializeTooltipBar(elementid, d, summary, totalposttext, skippedDisplayCategorties);
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
								createtooltipoutlier(elementid, outlierCountData, skippedDisplayCategorties);
							},
							initializetooltip:function(elementid, outlierCountData){
								initializetooltipoutlier(elementid, outlierCountData, skippedDisplayCategorties);
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
							return d.data.Key + ":" + d.stackKey.replace("Count", "");
						},
						'#contentContainer');
	}
 	if (document.getElementById("maindataTable")){drawDashboardTables();}
	
	//show the toggle button only if the MTBF was run for FIDES standard
	if(document.getElementById("togglebuttondiv"))
	{
		var elem = document.getElementById("togglebuttondiv");
		var mtbfStandard = mtbfData[0].MTBF_STANDARD;
		if (mtbfStandard == MTBFStandards.FIDES)
			elem.style.display = 'block';
		else
			elem.style.display = 'none';
	}
	
	initializeViews();
}

function exportPDF(){
	var showStdCompMapVal = false;
	var hostFunction = "sdaReliability::exportDashboardAsPdf";
	var mtbfEnv = mtbfLabel.replaceAll(" ", "_");
	
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope())
	{
		var appScope = angElement.scope();
		showStdCompMapVal = appScope.colhide;
	}
	
	var params = ` {-mode ${mode} -dumpPath ${dumpPathVal} -standard ${mtbfStandard} -env ${mtbfEnv} -showStdCompMap ${showStdCompMapVal}} `;
	callTcl(hostFunction, params, null);
}

function exportCSV(){
	var showStdCompMapVal = false;
	var hostFunction = "sdaReliability::exportDashboardAsCsv";
	var mtbfEnv = mtbfLabel.replaceAll(" ", "_");
	
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope())
	{
		var appScope = angElement.scope();
		showStdCompMapVal = appScope.colhide;
	}
		
	var params = ` {-mode ${mode} -dumpPath ${dumpPathVal} -standard ${mtbfStandard} -env ${mtbfEnv} -showStdCompMap ${showStdCompMapVal}} `;
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
			case "configcontrol":{
					appScope.dynamicTooltipText = getTranslatedString('configcontroltooltip');
					break;
					}
			case "reruncontrol":{
					appScope.dynamicTooltipText = getTranslatedString('synccontroltooltip');
					break;
					}
			case "checkstalecontrol":{
					appScope.dynamicTooltipText =getTranslatedString('checkstalecontroltooltip');
					break;
					}
			case "disclaimervisibilitycontrol":{
					appScope.dynamicTooltipText = getTranslatedString('improvetooltip');
					break;
					}
		}
	}
}

function clickConfigControl() {
	addClass('configcontrol', 'configcontrolactive');
	getDesignReadOnlyStatus(function(currentReadOnlyStatus) {
		if(currentReadOnlyStatus==='1'){
			getDesignReadOnlyReason(function(currentReadOnlyReason) {
		if(currentReadOnlyReason!=="ReadOnlyByMTBFSettings"){
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
	var settingsCommand = "sdaReliability::MTBFPreferences";
	var params = "";
	var selCompSPath = "";
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		var Component = appScope.selectedComponent;
		if ( Component ){
			for ( var i = 0; i < canonicalpathsjsondata.length; ++i){
				if ( Component === canonicalpathsjsondata[i].REFDES){
					selCompSPath = canonicalpathsjsondata[i].CanonicalPath;
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
	//CCMPR03193342---sdaReliability::MTBFPreferences is wrapped in cps::contectCall because when .brd is opened, context is switched to backend. For launching settings we need to be on schematic page context.
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
	setTimeout(checkMTBFDataStale, 500); // Run with 1s delay so that repaint happens.
	document.body.style.cursor = 'default';
}

function checkMTBFDataStale(){   //this will check if data stale or not
	var hostFunction = "sdaReliability::isDataStale";
	var params = "\"" + mtbfStandard + "\" \"" + useStress + "\"";
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
					if(!useStress)
						document.getElementById('querysynctext').innerHTML = getTranslatedString('needsynctext');
					else
						document.getElementById('querysynctext').innerHTML = getTranslatedString('needsynctext1');
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
	removeClass('reruncontrol', 'syncactive');
	removeClass('configcontrol', 'configcontrolactive');
	removeClass('queryIsDesignReadOnly', 'fadingIn');
	document.getElementById('queryIsDesignReadOnly').style.display = 'none';
}

function triggerSync(){
	removeClass('querySyncDiv','fadingIn'); 
	document.getElementById('querySyncDiv').style.display='none';
	setTimeout(runMTBF, 500); // Run with 1s delay so that dialog goes away.
}

function syncCheckOK(){
	removeClass('infoSyncCheckDiv','fadingIn'); 
	document.getElementById('infoSyncCheckDiv').style.display='none';
}

function runMTBF(){
	addClass('reruncontrol','syncactive');
	var hostFunction = "sdaReliability::runMTBFAnalysis";
	var params = "1" + " \"MTBF_ANALYSIS_" + mtbfStandard.toUpperCase() + "_";
	if(useStress)
		params += "STRESSON\"";
	else
		params += "STRESSOFF\"";
	callTcl(hostFunction, params, null);
	removeClass('reruncontrol','syncactive');
	document.body.style.cursor = 'default';
}

function setupAnalysisInfo(){
	if(!mtbfData.length)
		return 0;
	for(var i = 0; i < mtbfData.length; ++i)
	{
		switch(i){
			case 0: mtbfStandard = mtbfData[i].MTBF_STANDARD;
					displayStandardName = mtbfStandard.replaceAll("_", "-").toUpperCase();
					break;
			case 1: 
			{
				 if(mtbfStandard == MTBFStandards.MIL)
					mtbfLabel = mtbfData[i].MTBF_ENVIRONMENT;
				else if (mtbfStandard == MTBFStandards.FIDES)
					mtbfLabel = mtbfData[i].MTBF_FIDES_PROFILE;
				break;
			}
			case 2:	
			{
				if (mtbfData[i].USE_STRESS == "ON" || mtbfData[i].USE_STRESS ==  "YES" || mtbfData[i].USE_STRESS ==  "TRUE" || mtbfData[i].USE_STRESS ==  "1")
					useStress = true;
				else
					useStress = false;
				break;
			}
		}
	}
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
	setupAnalysisInfo();
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
