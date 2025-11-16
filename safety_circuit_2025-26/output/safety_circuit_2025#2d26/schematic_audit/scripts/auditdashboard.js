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
var licenseType;
var username;
var directiveFlag;
var disallowWaiveDirectiveValue;
var auditApp;
var categories_selected = [];
var selected_rows = [];
var reported_violations = [];
var ignored_violations = [];
var FatalCount;
var ErrorCount;
var WarningCount;
var InfoCount;
var WaivedCount;
var batch_command_size = 100;
var mode = "AUDIT";

var localizeOnInit = false;
var locale = "en";
var localeFont = "";

var connecterror; var protocolerror; var deviceerror; var neterror;
var connectivitywarning; var protocolwarning; var devicewarning; var netwarning;
var connectivityinfo; var protocolinfo; var deviceinfo; var netinfo;

var displayCategorties = [getTranslatedString('Fatal'), getTranslatedString('Error'), getTranslatedString('Warning'), getTranslatedString('Info'), getTranslatedString('Waived')];
var displayCategortiesWaived= [getTranslatedString('Fatal'), getTranslatedString('Error'), getTranslatedString('Warning'), getTranslatedString('Info')];
var runTypes = [getTranslatedString('Fatal'), getTranslatedString('Error'), getTranslatedString('Warning'), getTranslatedString('Info')];
var color_range = ["#753d2f","#c21807","#ffbf00","#e85d04"]; //fatal:darkbrown, error:red, warning:yellow, info:orange

var license = {
	BASIC:"BASIC",
	BASIC_PLUS:"BASIC_PLUS",
	BASIC_PLUS_PLUS:"BASIC_PLUS_PLUS",
	SUPERIOR:"SUPERIOR"
}

var DISALLOW_DIRECTIVE = {
	RULE_NAME_DISALLOW: "0",
	RULE_TYPE_DISALLOW: "1"
}

function setLicense(licenseStr) {
	licenseType = licenseStr;
}

function setUsername(userName) {
	username = userName;
}

function isLicenseHigherThanBasicPlusPlus()
{
	if(licenseType == license.BASIC_PLUS_PLUS || licenseType == license.SUPERIOR)
		return true;
	else
		return false;
}

function setDirective(dirValue){
	directiveFlag = dirValue.split(" ").pop();
	disallowWaiveDirectiveValue = dirValue.split(" ");
	disallowWaiveDirectiveValue.pop();
}
function getAuditData(){
	for( var i = 0; i < auditData.length; i++ )
	{
		if( auditData[i]["isIgnored"] === "true" )
			ignored_violations.push(auditData[i]);
		else
			reported_violations.push(auditData[i]);
	}
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
	
	var auditTab =  document.querySelector(".navigationtabs>li>a");
	auditTab.innerHTML = getTranslatedString('feature1title');
	var designsummaryTitle = document.querySelector("#donutTitle");
	designsummaryTitle.innerHTML = getTranslatedString('designsummarytitle');
	var devicesummaryTitle = document.querySelector("#barTitle");
	devicesummaryTitle.innerHTML = getTranslatedString('devicesummarytitle');
	var searchInput = document.querySelector(".form-control");
	searchInput.placeholder = getTranslatedString('searchplaceholder');	

	var waivedialogText = document.querySelector("#waiveDialogeTitle");
	if(waivedialogText){
		waivedialogText.innerHTML = getTranslatedString('waiveDialogeTitle');
	}
	var userText = document.querySelector("#userTitle");
	if(userText){
		userText.innerHTML = getTranslatedString('userTitle');
	}
	var commentsText= document.querySelector("#commentTitle");
	if(commentsText){
		commentsText.innerHTML = getTranslatedString('commentTitle');
	}
	var cancelButton = document.querySelector("#closeBtn");
	if(cancelButton){
		cancelButton.innerHTML = getTranslatedString('closeBtn');
	}
	var okButton = document.querySelector("#saveModalBtn");
	if(okButton){
		okButton.innerHTML = getTranslatedString('saveModalBtn');
	}
	var queryIsDesignReadOnlyTitle = document.querySelector("#queryisdesignreadonlytitle");
	if (queryIsDesignReadOnlyTitle) {
		queryIsDesignReadOnlyTitle.innerHTML = getTranslatedString('queryisdesignreadonlytitle');
	}
	var catrgoryheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(2)>div");
	if (catrgoryheader){
		var catrgoryheadertext = getTranslatedString('categoryheader');
		catrgoryheader.textContent = catrgoryheadertext;
		catrgoryheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(2)");
		catrgoryheader.dataset['title'] = catrgoryheadertext;
		catrgoryheader.dataset['titleText'] = catrgoryheadertext;
		catrgoryheader.attributes['data-title'].nodeValue = catrgoryheadertext;
		catrgoryheader.attributes['data-title'].value = catrgoryheadertext;
		catrgoryheader.attributes['data-title'].textContent = catrgoryheadertext;
	}
	
	var rulenameheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(3)>div");
	if (rulenameheader){
		var rulenameheadertext = getTranslatedString('rulenameheader');
		rulenameheader.textContent = rulenameheadertext;
		rulenameheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(3)");
		rulenameheader.dataset['title'] = rulenameheadertext;
		rulenameheader.dataset['titleText'] = rulenameheadertext;
		rulenameheader.attributes['data-title'].nodeValue = rulenameheadertext;
		rulenameheader.attributes['data-title'].value = rulenameheadertext;
		rulenameheader.attributes['data-title'].textContent = rulenameheadertext;
	}
	
	var idheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(4)>div");
	if (idheader){
		var idheadertext = getTranslatedString('idheader');
		idheader.textContent = idheadertext;
		idheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(4)");
		idheader.dataset['title'] = idheadertext;
		idheader.dataset['titleText'] = idheadertext;
		idheader.attributes['data-title'].nodeValue = idheadertext;
		idheader.attributes['data-title'].value = idheadertext;
		idheader.attributes['data-title'].textContent = idheadertext;
	}
	
	var messageheader = document.querySelector("#maindataTable>table>thead>tr>th:nth-child(5)>div");
	if(messageheader){
		var messageheadertext = getTranslatedString('messageheader');
		messageheader.textContent = messageheadertext;
		messageheader = document.querySelector("#maindataTable>table>tbody>tr>td:nth-child(5)");
		messageheader.dataset['title'] = messageheadertext;
		messageheader.dataset['titleText'] = messageheadertext;
		messageheader.attributes['data-title'].nodeValue = messageheadertext;
		messageheader.attributes['data-title'].value = messageheadertext;
		messageheader.attributes['data-title'].textContent = messageheadertext;
	}
	
	catrgoryheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(2)>div");
	if (catrgoryheader){
		var catrgoryheadertext = getTranslatedString('categoryheader');
		catrgoryheader.textContent = catrgoryheadertext;
		catrgoryheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(2)");
		catrgoryheader.dataset['title'] = catrgoryheadertext;
		catrgoryheader.dataset['titleText'] = catrgoryheadertext;
		catrgoryheader.attributes['data-title'].nodeValue = catrgoryheadertext;
		catrgoryheader.attributes['data-title'].value = catrgoryheadertext;
		catrgoryheader.attributes['data-title'].textContent = catrgoryheadertext;
	}
	
	rulenameheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(3)>div");
	if (rulenameheader){
		rulenameheadertext = getTranslatedString('rulenameheader');
		rulenameheader.textContent = rulenameheadertext;
		rulenameheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(3)");
		rulenameheader.dataset['title'] = rulenameheadertext;
		rulenameheader.dataset['titleText'] = rulenameheadertext;
		rulenameheader.attributes['data-title'].nodeValue = rulenameheadertext;
		rulenameheader.attributes['data-title'].value = rulenameheadertext;
		rulenameheader.attributes['data-title'].textContent = rulenameheadertext;
	}
	
	idheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(4)>div");
	if (idheader){
		var idheadertext = getTranslatedString('idheader');
		idheader.textContent = idheadertext;
		idheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(4)");
		idheader.dataset['title'] = idheadertext;
		idheader.dataset['titleText'] = idheadertext;
		idheader.attributes['data-title'].nodeValue = idheadertext;
		idheader.attributes['data-title'].value = idheadertext;
		idheader.attributes['data-title'].textContent = idheadertext;
	}
	
	messageheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(5)>div");
	if(messageheader){
		var messageheadertext = getTranslatedString('messageheader');
		messageheader.textContent = messageheadertext;
		messageheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(5)");
		messageheader.dataset['title'] = messageheadertext;
		messageheader.dataset['titleText'] = messageheadertext;
		messageheader.attributes['data-title'].nodeValue = messageheadertext;
		messageheader.attributes['data-title'].value = messageheadertext;
		messageheader.attributes['data-title'].textContent = messageheadertext;
	}
	
	var waivedbyheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(6)>div");
	if (waivedbyheader){
		var waivedbyheadertext = getTranslatedString('waivedbyheader');
		waivedbyheader.textContent = waivedbyheadertext;
		waivedbyheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(6)");
		waivedbyheader.dataset['title'] = waivedbyheadertext;
		waivedbyheader.dataset['titleText'] = waivedbyheadertext;
		waivedbyheader.attributes['data-title'].nodeValue = waivedbyheadertext;
		waivedbyheader.attributes['data-title'].value = waivedbyheadertext;
		waivedbyheader.attributes['data-title'].textContent = waivedbyheadertext;
	}
	
	var commentheader = document.querySelector("#alttable>table>thead>tr>th:nth-child(7)>div");
	if (commentheader){
		var commentheadertext = getTranslatedString('commentheader');
		commentheader.textContent = commentheadertext;
		commentheader = document.querySelector("#alttable>table>tbody>tr>td:nth-child(7)");
		commentheader.dataset['title'] = commentheadertext;
		commentheader.dataset['titleText'] = commentheadertext;
		commentheader.attributes['data-title'].nodeValue = commentheadertext;
		commentheader.attributes['data-title'].value = commentheadertext;
		commentheader.attributes['data-title'].textContent = commentheadertext;
	}
	
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		appScope.auditMenuOptions[0].text = getTranslatedString("highlightmenutext");
		appScope.auditMenuOptions[1].text = getTranslatedString("dehighlightmenutext");
		appScope.auditMenuOptions[2].text = getTranslatedString("highlighttemplatemenutext");
		appScope.auditMenuOptions[3].text = getTranslatedString("waivemenutext");
		appScope.auditMenuOptions[4].text = getTranslatedString("configcontroltooltip");
		appScope.ignoredMenuOptions[0].text = getTranslatedString("highlightmenutext");
		appScope.ignoredMenuOptions[1].text = getTranslatedString("dehighlightmenutext");
		appScope.ignoredMenuOptions[2].text = getTranslatedString("editdetailsmenutext");
		appScope.ignoredMenuOptions[3].text = getTranslatedString("unwaivemenutext");
		appScope.ignoredMenuOptions[4].text = getTranslatedString("configcontroltooltip");
	}
	refreshAll();
	localizeOnInit = true;
}

function computeViolationsData(data, isWaivedData){
	var checks = [];
	var check = data.forEach(obj => {
		checks[obj.Type] = checks[obj.Type] ? checks[obj.Type] + 1 : 1;
	});

	var auditSummary = {};
	for(let i=0; i < runTypes.length; i++){
		if(checks.hasOwnProperty(runTypes[i]))
			auditSummary[runTypes[i]] = checks[runTypes[i]];
		else
			auditSummary[runTypes[i]] = 0;
	}

	if(!isWaivedData){
		if(ignored_violations.length) 
			auditSummary["Waived"] = ignored_violations.length;
	}
	return auditSummary;
}

function computeChecksData(data, isWaivedData) {
	var barData = []; var checks = []; var waivedChecks = [];
	let totalCount = 0;
	
	var check = data.forEach(obj => {
		checks[obj.Check] = checks[obj.Check] ? checks[obj.Check] + 1 : 1;
		var runType = obj.Check + ":" + obj.Type;
		checks[runType] = checks[runType] ? checks[runType] + 1 : 1;
	});
	
	if(!isWaivedData){
		var waived_check = ignored_violations.forEach(obj => {
			waivedChecks[obj.Check] = waivedChecks[obj.Check] ? waivedChecks[obj.Check] + 1 : 1;
		});
	}
	
	Object.keys(waivedChecks).forEach(function(key) {
		if(!checks.hasOwnProperty(key))
			checks[key] = waivedChecks[key];
			
		var newKey = key + ":Waived";
		checks[newKey] = waivedChecks[key];
	});
	
	Object.keys(checks).forEach(function(key) {
		let category; let runTypeTotal = 0;
		let currentKey = key.split(":");
		category = currentKey.shift();
		if(!currentKey.length){
			var key = category.replace(" Checks","");
			barData.push({"Key":key});										
		}
		else{
			let value = checks[key];
			for(var i = 0; i < barData.length; i++){
				if(barData[i].Key == category.replace(" Checks","")){
					let newKey = currentKey + "Count";
					barData[i][newKey] = value;
					runTypeTotal += value;
				}									   										 
			}
			totalCount += value;
		}
	});
	
	let outlierCountData = [];
	let checksData = [];

	for (let i = barData.length - 1; i >= 0; --i) {
		let total = 0;
		for(let j = 0; j < runTypes.length; j++) {
				var runTypeCount = runTypes[j] + "Count";
				if(!barData[i].hasOwnProperty(runTypeCount)){
					barData[i][runTypeCount] = 0;
				}
				total += barData[i][runTypeCount];
			}
			if(!isWaivedData){
				if(barData[i].hasOwnProperty("WaivedCount"))
					total += barData[i]["WaivedCount"];
				else
					barData[i]["WaivedCount"] = 0;
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
		barCount:barData,
		outlierCount: outlierCountData
	};
}

function computeDonutData(){
	var violationsdata = computeViolationsData(reported_violations, false);
	if( violationsdata.Waived )
		color_range.push("#9ea396");

	return violationsdata;
}

function computeAltDonutData(){
	var violationsdata = computeViolationsData(ignored_violations, true);
	return violationsdata;
}

function computeStackedBarData(){
	var data = computeChecksData(reported_violations, false);
	return data;
}

function computeAltStackedBarData(){
	var data = computeChecksData(ignored_violations, true);
	return data;
}

function drawDeviceTables(){
	var emptyViolationTableElem = document.getElementById("empty-main-table");
	emptyViolationTableElem.style.display = "none";
	var emptyIgnoredViolationTableElem = document.getElementById("empty-alt-table");
	emptyIgnoredViolationTableElem.style.display = "none";
	
	dashboardApp.controller("dasboardController", function($scope, $filter, NgTableParams, ngTableEventsChannel){
	
	$scope.filtermode = false;
	$scope.ignoreViolations_length = 0
	$scope.doughnutSelection = [];
	$scope.barChartSelection = [];	
	$scope.currentRow = "";
	$scope.disallow_waive_list = [];
	$scope.currentRows = 0;
	$scope.totalTableRows = 0;
	$scope.isEditing = false;
	$scope.disallowWaive = 2;
	$scope.currentSelectionMode = 0;					  
	
	$scope.resetStressLevelEnabled = 0;
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
	
	ngTableEventsChannel.onAfterReloadData($scope.onAfterReloadData, $scope);
	$scope.auditViolationData = reported_violations;
	$scope.ignoredViolationData = ignored_violations;
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
		if ( columnname === 'Name') {
			tooltipcontent += "<span style=\"display:flex\">";
			switch(this.row["Type"]){
				case "Fatal": tooltipcontent += "<div style=\"color:#753d2f;padding-right:7px\" align=\"center\">\
													<i class=\"fa fa-times-circle\"></i>\
												</div>"; 
							  break;
				case "Error": tooltipcontent += "<div style=\"color:#c21807;padding-right:7px\" align=\"center\">\
													<i class=\"fa fa-exclamation-triangle\"></i>\
												</div>";  
							  break;
				case "Warning": tooltipcontent += "<div style=\"color:#ffbf00;padding-right:7px\" align=\"center\">\
													<i class=\"fa fa-exclamation-triangle\"></i>\
												   </div>"; 
							  break;
				case "Info":tooltipcontent += "<div style=\"color:#e85d04;padding-right:7px\" align=\"center\">\
													<i class=\"fa fa-info-circle\"></i>\
												</div>"; 
							  break;
			}
			tooltipcontent += this.row["Name"] + getTranslatedString("rulenamecoltooltippart1") + this.row["Type"];
		} else if (columnname == 'Message'){
			for ( var i = 0; i < auditRules.length; ++i){
				if (this.row["Rule"] == auditRules[i].Rule){
					tooltipcontent = auditRules[i].Description;
				}
			}
		} else if (columnname === 'Id' || columnname === 'Category'){
				tooltipcontent = this.row["Id"] + getTranslatedString('catidcoltooltippart1') + this.row["Check"];
		} else if (columnname == 'Username'){
			var ignoredviolationtableelem = document.getElementById('alttable');
			if ( ignoredviolationtableelem && ignoredviolationtableelem.style.display !== 'none')
				tooltipcontent += getTranslatedString('usernamecoltooltippart1') + "<b>" + this.row.username + "</b>" + getTranslatedString("usernamecoltooltippart2") + this.row.timestamp; 
		}
		else if (columnname == 'Comment'){
			var ignoredviolationtableelem = document.getElementById('alttable');
			if ( ignoredviolationtableelem && ignoredviolationtableelem.style.display !== 'none'){
				var tabletooltipelem = document.querySelector(".tabledatatooltip");
				tabletooltipelem.style.display = 'none';
			}
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
		
	var auditdata = true;
	var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
	if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
		auditdata = false;
	
	var data;
	if (auditdata)
		data = $scope.auditViolationData;
	else
		data = $scope.ignoredViolationData;		
	$scope.totalTableRows = data.length;
	
	$scope.filteredData = [];
	var chart_filter_results = [];
		
	// 1. Apply the chart based filters first
	if ( $scope.doughnutSelection.length != 0 ){ // 1a. Apply the design summary filters here
		for(var k=0; k<$scope.doughnutSelection.length; ++k){
			for(var j=0;j<data.length; ++j){
					if(data[j].Type == $scope.doughnutSelection[k]){
						chart_filter_results.push(data[j]);
					}
			}		
		}
	} else if ( $scope.barChartSelection.length != 0 ){ // 1b. Apply the device summary filters here
		for(var j=0;j<data.length; ++j){
			for(var k=0; k<$scope.barChartSelection.length; ++k){
				if ( $scope.barChartSelection[k].includes(data[j].Type) && $scope.barChartSelection[k].includes(data[j].Check.replace(" Checks",""))){
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
		var searchProperties = ["Check","Id","Name","Message","username","comment"];
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
		if(auditdata) { 
			var orderBy = $scope.mainTableParams.orderBy();
			chart_filter_results = $scope.mainTableParams.filter() ? $filter('filter')(global_filter_results, $scope.mainTableParams.filter()) : global_filter_results;
			chart_filter_results = $scope.mainTableParams.sorting() ? $filter('orderBy')(chart_filter_results, orderBy) : chart_filter_results;
			$scope.mainTableParams.total(column_filter_results.length);
			$scope.filteredData = chart_filter_results;
		}
		else {
			var orderBy = $scope.altTableParams.orderBy();
			chart_filter_results = $scope.altTableParams.filter() ? $filter('filter')(global_filter_results, $scope.altTableParams.filter()) : global_filter_results;
			chart_filter_results = $scope.altTableParams.sorting() ? $filter('orderBy')(chart_filter_results, orderBy) : chart_filter_results;
			$scope.altTableParams.total(column_filter_results.length);
			$scope.filteredData = chart_filter_results;
		}
		/*var sorted_result = chart_filter_results.slice(0);
		sorted_result.sort(function(a,b) {
			var x = a.Check.toLowerCase();
			var y = b.Check.toLowerCase();
			return x < y ? -1 : x > y ? 1 : 0;
		});
		$scope.filteredData = sorted_result;*/
			
		if(auditdata) {	
		if ( $scope.filteredData.length == 0)
			emptyViolationTableElem.style.display = "block";
		else
			emptyViolationTableElem.style.display = "none";
		} else {
			if ( $scope.filteredData.length == 0)
				emptyIgnoredViolationTableElem.style.display = "block";
			else
				emptyIgnoredViolationTableElem.style.display = "none";
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
	
	
	$scope.getSelectedRows = function(row){
		if (!$scope.filteredData) {
            return;
        }
		var isAuditView = true;
		var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
		if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
			isAuditView = false;
        
		var checked = 0, unchecked = 0, total = $scope.filteredData.length; $scope.disallow_waive_list = [];
        angular.forEach($scope.filteredData, function(row) {
            checked   += (row.isChecked) || 0;
            unchecked += (!row.isChecked) || 0;
			if( row.isChecked ){
				if(disallowWaiveDirectiveValue.includes(row.Rule) && isAuditView){
					if(directiveFlag == DISALLOW_DIRECTIVE.RULE_NAME_DISALLOW){
						if(!$scope.disallow_waive_list.includes(row.Rule))
							$scope.disallow_waive_list.push(row.Rule);
					}
					if(directiveFlag == DISALLOW_DIRECTIVE.RULE_TYPE_DISALLOW){
						if(!$scope.disallow_waive_list.includes(row.Type))
							$scope.disallow_waive_list.push(row.Type);
					}
				}
			}
        });
		
		if(checked)
			$scope.currentSelectionMode = 1;   //multiple row slection 
		else
			$scope.currentSelectionMode = 0;
																														   
        angular.element(document.getElementById("select_all")).prop("indeterminate", (checked != 0 && unchecked != 0));
		var data = JSON.parse(angular.toJson(this.row));
		if( row.isChecked ){
			if((!disallowWaiveDirectiveValue.includes(row.Rule) && isAuditView) || !isAuditView)
				selected_rows.push(data);
		}
		else {
			for(var i = 0; i < selected_rows.length; i++){
				if( selected_rows[i].Uid === row.Uid )
				{
					selected_rows.splice(i, 1);
					break;
				}
			}
			row.isChecked = false;
		}
		if(isAuditView){
			if(selected_rows.length){
				if(selected_rows.length == checked){
					$scope.disallowWaive = 2; //all violations to waive
				}
				if(selected_rows.length < checked){
					$scope.disallowWaive = 1;  //some violations to waive
				}   
			}
			else
				$scope.disallowWaive = 0;   //no violations to waive
		}
	}
		
	$scope.checkboxes = { 'checked': false };

    // watch for check all checkbox
    $scope.$watch('checkboxes.checked', function(value) {
		var checked = $scope.filteredData.length;
		var isAuditView = true;
		var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
		if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
			isAuditView = false;
		
		if(value)
			$scope.currentSelectionMode = 1; 
		else
			$scope.currentSelectionMode = 0;
        angular.forEach($scope.filteredData, function(row) {
           row.isChecked = value;
		   var data = JSON.parse(angular.toJson(row));
		   if( value ){
				if(disallowWaiveDirectiveValue.includes(data.Rule) && isAuditView){
					if(directiveFlag == DISALLOW_DIRECTIVE.RULE_NAME_DISALLOW){
						if(!$scope.disallow_waive_list.includes(data.Rule))
							$scope.disallow_waive_list.push(data.Rule);
						}
					if(directiveFlag == DISALLOW_DIRECTIVE.RULE_TYPE_DISALLOW){
						if(!$scope.disallow_waive_list.includes(data.Type))
							$scope.disallow_waive_list.push(data.Type);
					}
				}
				else
					selected_rows.push(data);
		   }
		   else {
				selected_rows = [];
				$scope.disallow_waive_list = [];
		   }
        });
		if(isAuditView){
			if(selected_rows.length){
				if(selected_rows.length == checked)
				{
					$scope.disallowWaive = 2; //all violations to waive
				}
				else if(selected_rows.length < checked){
					$scope.disallowWaive = 1; //some violations to waive
				}   
			}	
			else
				$scope.disallowWaive = 0; //no violations to waive
		}
    });
	
	$scope.singleClickAction = function(row) {
		$scope.selectedId = this.$id;
		$scope.selectedRule = row.Rule;
	}
	
	$scope.isSelected = function()
	{
		if ( $scope.selectedId === this.$id){
			return true;
		}
		return false;
	}	
	
	$scope.doubleClickAction = function(row) {
		var SPath = row.Spath;
		var pages = row.Pages;
		if(pages.length){
			var pagespath = row.Pages[0].pageSPath;		
			var hostFunction = "sdaReliability::crossProbeViolatingObject";
			var path =  SPath.replace(/[\\]/g, "\\\\");
			var pagepath = replaceInString(pagespath);
			var params = "\"" + path + "\"  \"" + pagepath + "\" 1";
			callTcl(hostFunction, params, null);
		}
	}
	
	//check if current row should have sub context menu or not
	$scope.handleClick = function(evt,row) {
		if(evt.which == 3){
			if(row.showSubContext === "true") {
				var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
				if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
				{	
					$scope.ignoredMenuOptions[0]["children"] = [];
					$scope.ignoredMenuOptions[1]["children"] = [];
				}
				else{
					$scope.auditMenuOptions[0]["children"] = [];
					$scope.auditMenuOptions[1]["children"] = [];
				}
			}
			else{
				var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
				if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
				{	
					delete $scope.ignoredMenuOptions[0]["children"];
					delete $scope.ignoredMenuOptions[1]["children"];
				}
				else{
					delete $scope.auditMenuOptions[0]["children"];
					delete $scope.auditMenuOptions[1]["children"];
				}
			}
		}
	}
	
	//populate highlight and dehighlight context sub menus
	$scope.$on('context-menu-opened', function (event, args) {
		if(args.params.$scope.row.showSubContext === "true") {			
			if(!args.params.level)	
			{	
				var pageSpaths = args.params.$scope.row.Pages;
				var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
				if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
				{					
					for( var i = 0; i < pageSpaths.length; i++ ){
						$scope.ignoredMenuOptions[0].children.push({"text": pageSpaths[i].pageName, "click":highlightSelectedObj});
						$scope.ignoredMenuOptions[1].children.push({"text": pageSpaths[i].pageName, "click":dehighlightSelectedObj});
					}
				}
				else
				{
					for( var i = 0; i < pageSpaths.length; i++ ){
						$scope.auditMenuOptions[0].children.push({"text": pageSpaths[i].pageName, "click":highlightSelectedObj});
						$scope.auditMenuOptions[1].children.push({"text": pageSpaths[i].pageName, "click":dehighlightSelectedObj});
					}
				}
			}
		}
	});
	
	function highlightSelectedObj(pageSpath, scope, event, modelValue, text){
		var params = "";
		var selectedPage = text[0].innerText.trim();
		var pagespath = "";
		var pagePath = pageSpath.row.Pages;
		var SPath = pageSpath.row.Spath;
		for( var i = 0; i < pagePath.length; i++ )
		{
			if(selectedPage === pagePath[i].pageName)
				pagespath = pagePath[i].pageSPath;		
		}
		var hostFunction = "sdaReliability::crossProbeViolatingObject";
		var path =  SPath.replace(/[\\]/g, "\\\\");
		var pagepath =  replaceInString(pagespath);
		var params = "\"" + path + "\"  \"" + pagepath +  "\" 1";
		callTcl(hostFunction, params, null);
	}

	function dehighlightSelectedObj(pageSpath, scope, event, modelValue, text){
		var params = "";
		var selectedPage = text[0].innerText.trim();
		var pagespath = "";
		var pagePath = pageSpath.row.Pages;
		var SPath = pageSpath.row.Spath;
		for( var i = 0; i < pagePath.length; i++ )
		{
			if(selectedPage === pagePath[i].pageName)
				pagespath = pagePath[i].pageSPath;		
		}
		var hostFunction = "sdaReliability::crossProbeViolatingObject";
		var path =  SPath.replace(/[\\]/g, "\\\\");
		var pagepath = replaceInString(pagespath);
		var params = "\"" + path + "\"  \"" + pagepath +  "\" 0";
		callTcl(hostFunction, params, null);
	}
   	$scope.auditMenuOptions = [
						{
							text: 	getTranslatedString('highlightmenutext'),
							enabled: function($itemScope){
										if( $itemScope.row.Spath == "")
											return false;
										else
											return true;
									},
							click:  function ($itemScope, $event, modelValue, text, $li){
										var SPath = $itemScope.row.Spath;
										var path =  SPath.replace(/[\\]/g, "\\\\");
										var pagepath;
										if($itemScope.row.Pages.length > 0)
										{
											var pagespath = $itemScope.row.Pages[0].pageSPath;	
											pagepath = replaceInString(pagespath);
										}
										else
										{
											pagepath = "";
										}											
										var hostFunction = "sdaReliability::crossProbeViolatingObject";
										var params = "\"" + path + "\"  \"" + pagepath + "\" 1";
										callTcl(hostFunction, params, null);
							 }
						},
						{
							text: 	getTranslatedString('dehighlightmenutext'),
							enabled: function($itemScope){
										if( $itemScope.row.Spath == "")
											return false;
										else
											return true;
									},
							click: function ($itemScope, $event, modelValue, text, $li){
										var SPath = $itemScope.row.Spath;	
										var path =  SPath.replace(/[\\]/g, "\\\\");
										var pagepath;
										if($itemScope.row.Pages.length > 0)
										{
											var pagespath = $itemScope.row.Pages[0].pageSPath;	
											pagepath = replaceInString(pagespath);
										}
										else
										{
											pagepath = "";
										}
										var hostFunction = "sdaReliability::crossProbeViolatingObject";
										var params = "\"" + path + "\"  \"" + pagepath + "\" 0";
										callTcl(hostFunction, params, null);
							},
							hasBottomDivider: true
						},
						{
							text: 	getTranslatedString('highlighttemplatemenutext'),
							enabled: function($itemScope){
										if( $itemScope.row.isTemplate == "1")
											return true;
										else
											return false;
									},
							click: function ($itemScope, $event, modelValue, text, $li){
										var templateSpathList = $itemScope.row.TemplateSPath;
										var templatepaths = templateSpathList.replace(/[\\]/g, "\\\\");
										var templatename = $itemScope.row.Name;
										var hostFunction = "sdaReliability::crossProbeTemplateViolatingObject";
										var params = "\"" + templatename + "\"  \"" + templatepaths + "\" false";
										callTcl(hostFunction, params, null);
							},
							hasBottomDivider: true
						},
						{
							text: 	getTranslatedString('waivemenutext'),
							enabled: function($itemScope){
										if( $itemScope.row.isTemplate == "1")
											return false;
										else
											return true;
							},
							click:  function ($itemScope, $event, modelValue, text, $li) {
										if(isLicenseHigherThanBasicPlusPlus()){
											$scope.isEditing = false;
											var singleViolationToWaive;
											if($scope.currentSelectionMode == 0){    								//check if single selection 
												if(disallowWaiveDirectiveValue.includes($itemScope.row.Rule)){      //if rule is not allowed to be waived
													singleViolationToWaive = false;
													$scope.disallowWaive = 0;
													
													var params, waive_type;
													if(directiveFlag == DISALLOW_DIRECTIVE.RULE_NAME_DISALLOW){
														params = "\"SYSR-50\" \"" + $itemScope.row.Rule + "\" \"WARNING\"";
													}
													else if(directiveFlag == DISALLOW_DIRECTIVE.RULE_TYPE_DISALLOW){
														params = "\"SYSR-51\" \"" + $itemScope.row.Type + "\" \"WARNING\"";
													}
													var hostFunction = "sdaReliability::displayDashboardMessage";
													callTcl(hostFunction, params, null);
												}
												 else
													singleViolationToWaive = true;
											}
											else{													//check if multiple selection
												let rules_list = $scope.disallow_waive_list.join(", ");
												 if($scope.disallowWaive == 0){						//if all selected violations cannot be waived
													 var params;
													if(directiveFlag == DISALLOW_DIRECTIVE.RULE_NAME_DISALLOW){
														 params = "\"SYSR-50\" ";
													}
													else if(directiveFlag == DISALLOW_DIRECTIVE.RULE_TYPE_DISALLOW){
														 params = "\"SYSR-51\" ";
													 }
													 params += "\"" + rules_list + "\" \"WARNING\"";
													 var hostFunction = "sdaReliability::displayDashboardMessage";
													 callTcl(hostFunction, params, null);
												 }
												 else{
													 if($scope.disallowWaive == 1){					//if some selected violations cannot be waived
														 var params;
														 if(directiveFlag == DISALLOW_DIRECTIVE.RULE_NAME_DISALLOW){
														 params = "\"SYSR-52\" ";
													 }
													 else if(directiveFlag == DISALLOW_DIRECTIVE.RULE_TYPE_DISALLOW){
														 params = "\"SYSR-53\" ";
													}
													 params += "\"" + rules_list + "\" \"WARNING\"";
													 var hostFunction = "sdaReliability::displayDashboardMessage";
													 callTcl(hostFunction, params, null);
													 }	
												 }
											 }
											 if(singleViolationToWaive || $scope.disallowWaive >= 1 ){
												 setTimeout(function(){
													setupUsername();
													 document.getElementById('waiveModalDiv').style.display='block';
													 addClass('waiveModalDiv','slideup');
													 $scope.currentRow = $itemScope;
													 document.getElementById("username").setAttribute("placeholder", username);
													 document.getElementById("username").focus();
												}, 20);
											 }
										}
										 else{
											 var params = "null 1 \"\" \"\" \"\"";
											var hostFunction = "sdaReliability::setWaiveFlag";
											 callTcl(hostFunction, params, null);
										 }
								 }
						},
						{
							hasTopDivider: true,
							text: 	getTranslatedString('configcontroltooltip'),
							click: 	function ($itemScope, $event, modelValue, text, $li) {
								clickConfigControl();
							}
						}
	];
		
	$scope.mainTableParams = new NgTableParams(
						{
							count: $scope.filteredData.length,
							sorting:{'Name':'asc'}
						},
						{
							counts: [],
							dataset:$scope.auditViolationData,
							getData: function(params) {
								$scope.filter();
								return $scope.filteredData;
							}
						}
					);
		
	$scope.ignoredMenuOptions = [
						{
							text: 	getTranslatedString('highlightmenutext'),
							enabled: function($itemScope){
										if( $itemScope.row.Spath == "")
											return false;
										else
											return true;
									},
							click:  function ($itemScope, $event, modelValue, text, $li){
										var SPath = $itemScope.row.Spath;	
										var hostFunction = "sdaReliability::crossProbeViolatingObject";
										var path =  SPath.replace(/[\\]/g, "\\\\");
										var pagepath;
										if($itemScope.row.Pages.length > 0)
										{
											var pagespath = $itemScope.row.Pages[0].pageSPath;	
											pagepath = replaceInString(pagespath);
										}
										else
										{
											pagepath = "";
										}
										var params = "\"" + path + "\"  \"" + pagepath + "\" 1";
										callTcl(hostFunction, params, null);
									 }
						},
						{
							text: 	getTranslatedString('dehighlightmenutext'),
							enabled: function($itemScope){
										if( $itemScope.row.Spath == "")
											return false;
										else
											return true;
									},
							click: function ($itemScope, $event, modelValue, text, $li){
										var SPath = $itemScope.row.Spath;	
										var hostFunction = "sdaReliability::crossProbeViolatingObject";
										var path =  SPath.replace(/[\\]/g, "\\\\");
										var pagepath;
										if($itemScope.row.Pages.length > 0)
										{
											var pagespath = $itemScope.row.Pages[0].pageSPath;	
											pagepath = replaceInString(pagespath);
										}
										else
										{
											pagepath = "";
										}
										var params = "\"" + path + "\"  \"" + pagepath + "\" 0";
										callTcl(hostFunction, params, null);
									 },
							hasBottomDivider: true
						},
						{
							text:  getTranslatedString('editdetailsmenutext'),
							click: function ($itemScope, $event, modelValue, text, $li){
										if(isLicenseHigherThanBasicPlusPlus()){
											$scope.isEditing = true;
											document.getElementById('waiveModalDiv').style.display='block';
											addClass('waiveModalDiv','slideup');
											$scope.currentRow = $itemScope;
											if( selected_rows.length){
												var user = {}; 
												var users = selected_rows.forEach(obj => {
													user[obj.username] = user[obj.username] ? user[obj.username] + 1 : 1;
												});
												if( Object.keys(user).length > 1 )
													document.getElementById("username").value = "Multiple users";
												else
													document.getElementById("username").value = $itemScope.row.username;
												
												var comment = {}; 
												var comments = selected_rows.forEach(obj => {
													comment[obj.comment] = comment[obj.comment] ? comment[obj.comment] + 1 : 1;
												});
												if( Object.keys(comment).length > 1 )
													document.getElementById("comment").value = "Multiple comments";
												else
													document.getElementById("comment").value = $itemScope.row.comment;
											}
											else{
												document.getElementById("username").value = $itemScope.row.username;
												document.getElementById("comment").value = $itemScope.row.comment;
											}
											document.getElementById("username").focus();
										}
										else{
											var params = "null 0 \"\" \"\" \"\"";
											var hostFunction = "sdaReliability::setWaiveFlag";
											callTcl(hostFunction, params, null);
										}
									 },
							hasBottomDivider: true
						},
						{
							text: 	getTranslatedString('unwaivemenutext'),
							click: 	function ($itemScope, $event, modelValue, text, $li) {
										var user = $itemScope.row.username;
										var time = $itemScope.row.timestamp;
										var comment = "";
										
										if( selected_rows.length)
										{
											for( let row = 0; row < selected_rows.length; row++ )
											{
												var id = "";
												var params = "";
												var messages = "\"";
												var uids = "\"";
												var first = true;
												let i = 0;												
												for(; i < batch_command_size; i++)
												{
													 if(row == selected_rows.length)
														break;
													
													selected_rows[row].isChecked = false;
													if(isLicenseHigherThanBasicPlusPlus()) 
													{
													reported_violations.push(selected_rows[row]);
													}
													
													if(!first)
													{
														messages += "|";
														uids += "|";
													}
													var message = replaceInString(selected_rows[row].Message);
													messages += message;
													uids += selected_rows[row].Uid;
													first = false;
													row++;
												}
												if(isLicenseHigherThanBasicPlusPlus())
												{
													ignored_violations = ignored_violations.filter(function(obj) {
														return !this.has(obj.Uid);
														}, new Set(selected_rows.map(obj => obj.Uid)));
												}
												messages += "\"";
												uids += "\"";
												params += messages + " 0";
												id = uids;
													
												params += " \"" + user + "\" \"" + time + "\" \"" + comment + "\" " + id;
												var hostFunction = "sdaReliability::setWaiveFlag";
												callTcl(hostFunction, params, null);
													
												if(i % batch_command_size == 0)
												{
													row = row - 1;
													i = 0;
												}
											}
											selected_rows = [];
											$scope.checkboxes["checked"] = false;
										}
										else
										{
											var id = "";
											var params = "";
											
											var data;
											var uid = $itemScope.row.Uid;
											for(var i = 0; i < ignored_violations.length; i++)
											{
												if( uid === ignored_violations[i].Uid )
												{
													data = JSON.parse(angular.toJson($itemScope.row));
													if(isLicenseHigherThanBasicPlusPlus())
													{
														reported_violations.push(data);
														ignored_violations.splice(i, 1);
													}
													break;
												}
											}
											var message = replaceInString(data.Message);
											params +=  "\"" + message + "\" 0";
											id = "\"" + data.Uid + "\"";
											
											params += " \"" + user + "\" \"" + time + "\" \"" + comment + "\" " + id;
											var hostFunction = "sdaReliability::setWaiveFlag";
											callTcl(hostFunction, params, null);
										}
										
										if(isLicenseHigherThanBasicPlusPlus()) 
											refreshAll();
										
										if(!ignored_violations.length)
											toggleChartsView();
							}
						},
						{
							hasTopDivider: true,
							text: 	getTranslatedString('configcontroltooltip'),
							click: 	function ($itemScope, $event, modelValue, text, $li) {
								clickConfigControl();
							}
						}
	];

	$scope.altTableParams = new NgTableParams(
						{
							count: $scope.filteredData.length,
							sorting:{'Name':'asc'}
						},
						{
							counts: [],
							dataset:$scope.ignoredViolationData,
							getData: function(params) {
								$scope.filter();
								return $scope.filteredData;
							}
						}
					);
	});
}

function getWaiveDetails(){
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	var appScope;
	if (angElement && angElement.scope())
		appScope = angElement.scope();
		
	var user = document.getElementById("username").value;
	if(user === "")
		user = username;
		
	var time = getCurrentDate();
	var comment = document.getElementById("comment").value;
	
	if( selected_rows.length )
	{
		for(let row = 0; row < selected_rows.length; row++)
		{
			var id = "";
			var params = "";
			var messages = "\"";
			var uids = "\"";
			var first = true;			
			let i = 0;
			for(; i < batch_command_size; i++)
			{
				 if(row == selected_rows.length)
					break;
				
				selected_rows[row].isChecked = false;
				if(isLicenseHigherThanBasicPlusPlus())
				{
					selected_rows[row]["username"] = user; selected_rows[row]["timestamp"] = time; selected_rows[row]["comment"] = comment;
					ignored_violations.push(selected_rows[row]);
				}

				if(!first){
					messages += "|";
					uids += "|";
				}
				var message = replaceInString(selected_rows[row].Message);
				messages += message;
				uids += selected_rows[row].Uid;
				first = false;
				row++;
			}
			if(isLicenseHigherThanBasicPlusPlus())
			{
				reported_violations = reported_violations.filter(function(obj) 
				{
					return !this.has(obj.Uid);
				}, new Set(selected_rows.map(obj => obj.Uid)));
			}
			messages += "\"";
			uids += "\"";
			params += messages + " 1";
			id = uids;
			
			var commentString = replaceInString(comment);
			params += " \"" + user + "\" \"" + time + "\" \"" + commentString + "\" " + id;

			var hostFunction = "sdaReliability::setWaiveFlag";
			callTcl(hostFunction, params, null);
			
			if(i % batch_command_size == 0){
				row = row - 1;
				i = 0;
			}
		}
		selected_rows = [];
		appScope.checkboxes.checked = false;
	}
	else
	{
		var id = "";
		var params = "";
		
		var data;
		var uid = appScope.currentRow.row.Uid;
		for(var i = 0; i < reported_violations.length; i++){
		if( uid === reported_violations[i].Uid )
			{
				data = JSON.parse(angular.toJson(appScope.currentRow.row));
				if(isLicenseHigherThanBasicPlusPlus())
				{
					data["username"] = user; data["timestamp"] = time; data["comment"] = comment;
					ignored_violations.push(data);
					reported_violations.splice(i, 1);
				}
				break;
			}
		}
		var message = replaceInString(data.Message);
		params += "\"" + message + "\" 1";
		id = "\"" + data.Uid + "\"";
   
		var commentString = replaceInString(comment);
		params += " \"" + user + "\" \"" + time + "\" \"" + commentString + "\" " + id;
		
		var hostFunction = "sdaReliability::setWaiveFlag";
		callTcl(hostFunction, params, null);
	}
	
	document.getElementById("username").value = "";
	document.getElementById("comment").value = "";
	if(isLicenseHigherThanBasicPlusPlus())
		refreshAll();
	
	//reset selection to default: single selection with all waivable
	appScope.currentSelectionMode = 0;
	appScope.disallowWaive = 2;		
}

function getCurrentDate(){
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var dateTime = date+' '+time;
	return dateTime;
}

function saveWaiveDetails(){
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	var appScope;
	if (angElement && angElement.scope())
		appScope = angElement.scope();
		
	if(!appScope.isEditing)
		getWaiveDetails();
	else
		editWaiveDetails();
}

function editWaiveDetails(){
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	var appScope;
	if (angElement && angElement.scope())
		appScope = angElement.scope();
	
	var user = ""; var usercomment = "";
	user = document.getElementById("username").value;
	usercomment = document.getElementById("comment").value;

	if( selected_rows.length )
	{
		for(let row = 0; row < selected_rows.length; row++)
		{
			var id = "";
			var params = "";
			var messages = "\"";
			var uids = "\"";
			var first = true;
			let i = 0;
			for(; i < batch_command_size; i++)
			{
				 if(row == selected_rows.length)
					break;
				
				selected_rows[row].isChecked = false;
						 
				var currentuser, currentcomment;
				var time = selected_rows[row].timestamp;
				if(time == "" || time === "Unknown")
					time = getCurrentDate();
							
				if(user === "")
					currentuser = username;
				else if(user === "Multiple users")
					currentuser = selected_rows[row].username;
				else
					currentuser = user;
					
				if(usercomment === "" || usercomment === "Multiple comments")
					currentcomment = selected_rows[row].comment;
				else 
					currentcomment = usercomment;

				ignored_violations.every(obj => {
					if(JSON.stringify(obj.Uid) === JSON.stringify(selected_rows[row].Uid) && JSON.stringify(obj.Message) === JSON.stringify(selected_rows[row].Message)){
							obj.username = currentuser; 
							obj.timestamp = time; 
							obj.comment = currentcomment; 
							obj.isChecked = false;
							return false;
					}
					return true;
				});
				
				if(!first)
				{
					messages += "|";
					uids += "|";
				}
				var message = replaceInString(selected_rows[row].Message);
				messages += message;
				uids += selected_rows[row].Uid;
				first = false;
				row++;
			}
			messages += "\"";
			uids += "\"";
			params += messages + " 2";
			id = uids;
			
			var commentString = replaceInString(usercomment);
			params += " \"" + user + "\" \"" + time + "\" \"" + commentString + "\" " + id;

			var hostFunction = "sdaReliability::setWaiveFlag";
			callTcl(hostFunction, params, null);
			
			if(i % batch_command_size == 0){
				row = row - 1;
				i = 0;
			}
		}
		selected_rows = [];
		appScope.checkboxes.checked = false;
		refreshDashboardTable();
	}
	else
	{
		var id = "";
		var params = "";
		
		var time = appScope.currentRow.row.timestamp;
		if(time == "" || time === "Unknown")
			time = getCurrentDate();
			
		if(user === "")
			user = username;
			
		var uid = appScope.currentRow.row.Uid;
		for(var i = 0; i < ignored_violations.length; i++){
		if( uid === ignored_violations[i].Uid )
			{
				ignored_violations[i].username = user; ignored_violations[i].timestamp = time; ignored_violations[i].comment = usercomment;
				appScope.currentRow.row.username = user; appScope.currentRow.row.timestamp = time; appScope.currentRow.row.comment = usercomment;
				break;
			}
		}
		var message = replaceInString(appScope.currentRow.row.Message);
		params += "\"" + message + "\" 2";
		id = "\"" + appScope.currentRow.row.Uid + "\"";

		var commentString = replaceInString(usercomment);
		params += " \"" + user + "\" \"" + time + "\" \"" + commentString + "\" " + id;

		var hostFunction = "sdaReliability::setWaiveFlag";
		callTcl(hostFunction, params, null);
	}
	
	document.getElementById("username").value = "";
	document.getElementById("comment").value = "";
}

dragElement(document.getElementById("waiveModalDiv"));
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "Header")) {
    document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
	document.getElementById("content").onmouseleave = stopDragElement;
  } 
  else {
    elmnt.onmousedown = dragMouseDown;
	}
	
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at start:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = stopDragElement;
	document.onmouseleave = stopDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function stopDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function replaceInString(str) {
	return str.replace(/\\/g, '\\\\').replace(/\"/g, '\\"').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}
									  
function getChartHeaderText(){
	var doughnutChartText = getTranslatedString('maindonuttitle');
	var barChartText = getTranslatedString('mainbartitle');
	var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
	if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed") ){
		doughnutChartText = getTranslatedString('altdonuttitle');
		barChartText = getTranslatedString('altbartitle');
	}
	document.getElementById("donutTitle").innerHTML = doughnutChartText;
	document.getElementById("barTitle").innerHTML = barChartText;
}

function refreshDashboardTable(){
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		appScope.auditViolationData = reported_violations;
		appScope.ignoredViolationData = ignored_violations;
		appScope.selected_rows = [];
	}

	var tablerefreshtriggerelem = document.getElementById('refreshAuditTableTrigger');
	if (tablerefreshtriggerelem){tablerefreshtriggerelem.click();}
	
}

function refreshAll(){
	resetBarSelections();
	disableBarFilterResetButton();
	resetDonutSelections();
	disableDonutFilterResetButton();
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
	
	var tablevcelem = document.getElementById('tablevisibilitycontrol');
	if ( tablevcelem) {tablevcelem.classList.add('showtable');}
	var chartvcelem = document.getElementById('chartvisibilitycontrol');
	if ( chartvcelem) { chartvcelem.classList.add('showchart'); }
	
	getAuditData();
	if (document.getElementById("mainsummary-donut"))
	{
		var violationsData = computeDonutData()
		mainDonut = drawSummaryDonut(violationsData,
		                 '#mainsummary-donut',
						 {"Error":getTranslatedString('Error'),"Warning":getTranslatedString('Warning'),"Info":getTranslatedString('Info'),"Fatal":getTranslatedString('Fatal'),"Waived":getTranslatedString('Waived')},
						 [getTranslatedString('maindonutregion'), getTranslatedString('count'), getTranslatedString('pct')],
						 {titles:{"Error":getTranslatedString('errordonuttooltiptitle'),"Warning":getTranslatedString('warningdonuttooltiptitle'),"Info":getTranslatedString('infodonuttooltiptitle'),"Fatal":getTranslatedString('fataldonuttooltiptitle'),"Waived":getTranslatedString('waiveddonuttooltiptitle')}},
						 color_range,
						 getTranslatedString('analyzeddevicestxt'),
						 '#contentContainer');
	}
	if (document.getElementById("altsummary-donut"))
	{
		var waivedData = computeAltDonutData();
		altDonut = drawSummaryDonut(waivedData,
		                 '#altsummary-donut',
						 {"Error":getTranslatedString('Error'),"Warning":getTranslatedString('Warning'),"Info":getTranslatedString('Info'),"Fatal":getTranslatedString('Fatal')},
						 [getTranslatedString('reason'), getTranslatedString('count'), getTranslatedString('pct')],
						 {titles:{"Error":getTranslatedString('errordonuttooltiptitle'),"Warning":getTranslatedString('warningdonuttooltiptitle'),"Info":getTranslatedString('infodonuttooltiptitle'),"Fatal":getTranslatedString('fataldonuttooltiptitle')}},
						 color_range,
						 getTranslatedString('devicesskipped'),
						 '#contentContainer');
	}
	
	if (document.getElementById("mainsummary-stacked-bar"))
	{
		var data = computeStackedBarData();
		mainStackedBar = drawStackedBar(data,
					   '#mainsummary-stacked-bar',
		               ["FatalCount", "ErrorCount", "WarningCount", "InfoCount", "WaivedCount"],
					   {
							createtooltip:function(elementid){
								createTooltipBar(elementid, displayCategorties);
							},
							initializetooltip:function(elementid, d){
								var summary = getTranslatedString("checks");
								var totalposttext = getTranslatedString("checksviolations");
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
								initializetooltipoutlier(elementid, outlierCountData,displayCategorties);
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
					   [getTranslatedString('rulescategory')],
					   "",
			function(d){
			var key;
			if ( d[1] <= d.data.FatalCount){
				key = "Fatal";
			} else if (d[1] <= (d.data.FatalCount + d.data.ErrorCount)){
				key = "Error";
			} else if (d[1] <= (d.data.FatalCount + d.data.ErrorCount + d.data.WarningCount)){
				key = "Warning";
			} else if (d[1] <= (d.data.FatalCount + d.data.ErrorCount + d.data.WarningCount + d.data.InfoCount)){
				key = "Info";
			}
			else {
				key = "Waived";
			}
			return d.data.Key + ":" + key;
		},
		'#contentContainer');
	}
		
		
 	if (document.getElementById("altsummary-stacked-bar"))
	{
		var ignored_data = computeAltStackedBarData();
		altStackedBar = drawStackedBar(ignored_data,
					   '#altsummary-stacked-bar',
					   ["FatalCount", "ErrorCount", "WarningCount", "InfoCount"],
					   {
							createtooltip:function(elementid){
								createTooltipBar(elementid, displayCategortiesWaived);
							},
							initializetooltip:function(elementid, d){
								var summary = getTranslatedString("checks");
								var totalposttext = getTranslatedString("checksviolations");
								initializeTooltipBar(elementid, d, summary, totalposttext, displayCategortiesWaived);
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
								createtooltipoutlier(elementid, outlierCountData, displayCategortiesWaived);
							},
							initializetooltip:function(elementid, outlierCountData){
								initializetooltipoutlier(elementid, outlierCountData,displayCategortiesWaived);
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
					   [getTranslatedString('rulescategory')],
					   "",
			function(d){
			var key;
			if ( d[1] <= d.data.FatalCount){
				key = "Fatal";
			} else if (d[1] <= (d.data.FatalCount + d.data.ErrorCount)){
				key = "Error";
			} else if (d[1] <= (d.data.FatalCount + d.data.ErrorCount + d.data.WarningCount)){
				key = "Warning";
			} else if (d[1] <= (d.data.FatalCount + d.data.ErrorCount + d.data.WarningCount + d.data.InfoCount)){
				key = "Info";
			}
			else {
				key = "Waived";
			}
			return d.data.Key + ":" + key;
		},
		'#contentContainer');

    }  
	if (document.getElementById("maindataTable")){drawDeviceTables();}
	
	initializeViews();
}

function exportPDF(){
	var hostFunction = "sdaReliability::exportAuditDashboardAsPdf";
	var params = " ";
	callTcl(hostFunction, params, null);
}

function exportCSV(){
	var hostFunction = "sdaReliability::exportAuditDashboardAsCsv";
	var params = " ";
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
			case "restoreviolationcontrol":{
					appScope.dynamicTooltipText = getTranslatedString('restoreviolationcontroltooltip');
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
		}
	}
}

function closeModalDialog(){
	removeClass('waiveModalDiv','fadingIn'); 
	document.getElementById('waiveModalDiv').style.display='none';
	document.getElementById("username").value = "";
	document.getElementById("comment").value = "";
}		

function restoreviolationcontrol(){
	var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
	if ( togglechartsviewbtnelem && togglechartsviewbtnelem.classList.contains("nonanalyzed"))
	{
		for(let row = 0; row < ignored_violations.length; row++)
		{
			var params = "";
			var messages = "\"";
			var uids = "\"";
			var user = ""; var time = ""; var comment = "";
			var first = true;									   
			let i = 0;
			for(; i < batch_command_size; i++)
			{
				 if(row == ignored_violations.length)
					break;
				
				if(isLicenseHigherThanBasicPlusPlus())
				{
					reported_violations.push(ignored_violations[row]);
				}
					
				if(!first){
					messages += "|";
					uids += "|";
				}
				var message = replaceInString(ignored_violations[row].Message);
				messages += message;
				uids += ignored_violations[row].Uid;
				first = false;
				row++;	  
			}

			messages += "\"";
			uids += "\"";
			params += messages + " 0 \"" + user + "\" \"" + time + "\" \"" + comment + "\" " + uids;
				
			var hostFunction = "sdaReliability::setWaiveFlag";
			callTcl(hostFunction, params, null);
			
			if(i % batch_command_size == 0)
			{
				row = row - 1;
				i = 0;
			}
		}
		
		if(isLicenseHigherThanBasicPlusPlus())
		{
			ignored_violations.length = 0;
			refreshAll();
			toggleChartsView();
		}
	}
	
	//reset selection to default: single selection with all waivable
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		appScope.currentSelectionMode = 0;
		appScope.disallowWaive = 2;
	}
	document.body.style.cursor = 'default';
}

function clickConfigControl(){
	addClass('configcontrol', 'configcontrolactive');
	getDesignReadOnlyStatus(function(currentReadOnlyStatus) {
		if(currentReadOnlyStatus==='1'){
			document.getElementById('queryIsDesignReadOnlytext').innerHTML = getTranslatedString('readonlyreason');
			document.getElementById('queryIsDesignReadOnly').style.display = 'block';
			addClass('queryIsDesignReadOnly', 'fadingIn');
		}
		else{
			setTimeout(runAuditConfig, 500); // Run with 1s delay so that repaint happens.
			removeClass('configcontrol', 'configcontrolactive');
		}
	});
}

function runAuditConfig(){
	document.body.style.cursor = 'progress';
	var settingsCommand = "sdaReliability::schematicAuditPreferences";
	var params = "";
	//CCMPR03193342---sdaReliability::schematicAuditPreferences is wrapped in cps::contectCall because when .brd is opened, context is switched to backend. For launching settings we need to be on schematic page context.
	var hostFunction = "cps::contextCall SCH PAGE {" + settingsCommand + "}";
	callTcl(hostFunction, params, null);
	removeClass('configcontrol','configcontrolactive');
	document.body.style.cursor = 'default';
}

function clickRerunControl(){
	addClass('reruncontrol', 'syncactive');
	getDesignReadOnlyStatus(function(currentReadOnlyStatus) {
		if(currentReadOnlyStatus==='1'){
			document.getElementById('queryIsDesignReadOnlytext').innerHTML = getTranslatedString('readonlyreason');
			document.getElementById('queryIsDesignReadOnly').style.display = 'block';
			addClass('queryIsDesignReadOnly', 'fadingIn');
			}
		else{
			var hostFunction = "sdaReliability::runSchematicAudit";
			var params = "1";
			callTcl(hostFunction, params, null);
			removeClass('reruncontrol','syncactive');
			document.body.style.cursor = 'default';
		}
	});		
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
	if(document.getElementById("viewvisibilitycontrol")){
		document.getElementById("viewvisibilitycontrol").onclick = toggleChartsView;
		document.getElementById("viewvisibilitycontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("restoreviolationcontrol")){
		document.getElementById("restoreviolationcontrol").onclick = restoreviolationcontrol;
		document.getElementById("restoreviolationcontrol").onmouseover = getToolTip;
	}
	if(document.getElementById("exportformatoption")){
		document.getElementById("exportformatoption").onmouseover = getToolTip;
	}
	if(document.getElementById("saveModalBtn")){
		document.getElementById("saveModalBtn").onclick = function(){
			removeClass('waiveModalDiv','fadingIn'); 
			document.getElementById('waiveModalDiv').style.display='none';
			setTimeout(function(){
				saveWaiveDetails();
			}, 2);
		}
	}
	if(document.getElementById("configcontrol")){
		document.getElementById("configcontrol").onclick = clickConfigControl;
		document.getElementById("configcontrol").onmouseover = getToolTip;
	}	
	if(document.getElementById("reruncontrol")){
		document.getElementById("reruncontrol").onclick = clickRerunControl;
		document.getElementById("reruncontrol").onmouseover = getToolTip;
	}
	if (document.getElementById("closeQueryIsDesignReadOnlyBtn")) {
		document.getElementById("closeQueryIsDesignReadOnlyBtn").onclick = function(){
		removeClass('reruncontrol', 'syncactive');
		removeClass('configcontrol', 'configcontrolactive');
		removeClass('queryIsDesignReadOnly', 'fadingIn');
		document.getElementById('queryIsDesignReadOnly').style.display = 'none';
		}
	}
	window.addEventListener("resize", resizecharts);
	setupLicense();
	setupUsername();
	setupDirectiveValue();	
	
	initUI();
	setupLocale(locale, localeFont);

	var loadingelem = document.getElementById('loading');
	loadingelem.style.opacity = 0;
	loadingelem.classList.add('hidden');
	var contentelem = document.getElementById('content');
	contentelem.style.opacity = 1;
});
