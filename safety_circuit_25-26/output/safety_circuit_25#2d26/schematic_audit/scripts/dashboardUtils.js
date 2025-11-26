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

// ==========================temperature tab functions==============================
function setActiveTemperature(opTemp)
{
	activeTemperature = opTemp;
}

var firstVisibleTemperatureIndex = 0;
var lastVisibleTemperatureIndex = 0;
function drawTemperatureTabs(){
	var tempdivElem = document.querySelector("#temperaturetabs");
	if ( tempdivElem){
		var isFirst = true;
		var index = 0;
		for(var i = 0; i < dashboardData.length; ++i){
			var newItem = document.createElement("a"); 
			newItem.setAttribute('href', '#');
			if ( isFirst == true){
				newItem.setAttribute('class', 'active');
				isFirst = false;
			}
			newItem.innerHTML = dashboardData[i]["OpTemp"] + "&nbsp;&#8451;";
			newItem.style.display = "inline";			
			tempdivElem.appendChild(newItem);
			index++;
		}
		firstVisibleTemperatureIndex = 0;
		lastVisibleTemperatureIndex = index-1;
	}
	redrawTemperatureTabs(); // Show/hide based on width available
}

function setStateOfScrollButtons(){
	// Enable/Disable Scroll buttons based on conditions
	var tempdivElem = document.querySelector("#temperaturetabs");
	if (tempdivElem){
		var scrollLeftElem = document.getElementById("scrolltempleft");
		var scrollRightElem = document.getElementById("scrolltempright");
		if (tempdivElem.firstElementChild.style.display === "none"){ // Since first child is hidden, make left scroll enabled
			scrollLeftElem.classList.remove('disable');			
			scrollLeftElem.classList.add('enable');
			scrollLeftElem.classList.remove('nodisplay');
		} else { // Since first child is visible, no need to enable left scroll
			scrollLeftElem.classList.remove('enable');			
			scrollLeftElem.classList.add('disable');
			scrollLeftElem.classList.add('nodisplay');
		}
		if (tempdivElem.lastElementChild.style.display === "none"){ // Since last child is hidden, make right scroll enabled
			scrollRightElem.classList.remove('disable');			
			scrollRightElem.classList.add('enable');
			scrollRightElem.classList.remove('nodisplay');
		} else { // Since last child is visible, no need to enable right scroll
			scrollRightElem.classList.remove('enable');			
			scrollRightElem.classList.add('disable');
			scrollRightElem.classList.add('nodisplay');
		}
	}
}

function redrawTemperatureTabs(){
	var tempdivElem = document.querySelector("#temperaturetabs");
	var availablewidth = window.innerWidth-20;
	if (tempdivElem){
		var index = 0;
		var childrenElem = tempdivElem.firstElementChild;
		lastVisibleTemperatureIndex = firstVisibleTemperatureIndex;
		while (childrenElem){
			if ( index >= firstVisibleTemperatureIndex){
				if((80*(index - firstVisibleTemperatureIndex + 1)) < availablewidth){
					childrenElem.style.display = "inline";
					lastVisibleTemperatureIndex = index;
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

function scrollTemperaturesRight(){
	var tempdivElem = document.querySelector("#temperaturetabs");
	var availablewidth = window.innerWidth-20;
	if ( tempdivElem){
		firstVisibleTemperatureIndex = lastVisibleTemperatureIndex;
		redrawTemperatureTabs();
	}
}

function scrollTemperaturesLeft(){
	var tempdivElem = document.querySelector("#temperaturetabs");
	var availablewidth = window.innerWidth-20;
	if ( tempdivElem){
		lastVisibleTemperatureIndex = firstVisibleTemperatureIndex;
		var ind = 1;
		while ( (80*(ind+1)) < availablewidth){
			firstVisibleTemperatureIndex = lastVisibleTemperatureIndex - ind;
			ind++;
		}
//		firstVisibleTemperatureIndex -= (lastVisibleTemperatureIndex - firstVisibleTemperatureIndex);
		if ( firstVisibleTemperatureIndex < 0)
			firstVisibleTemperatureIndex = 0;
		redrawTemperatureTabs();
	}
}

// ==================================Chart refresh functions====================================

function refreshMainSummaryDonut(animate = true){
	if( mainDonut ){
		var summaryData = computeDonutData();
		var emptyMainDonutElem = document.getElementById("empty-mainsummary-donut");
		var totalCount = 0;
		for(var key in summaryData){totalCount += summaryData[key];}
		if(totalCount == 0)
			emptyMainDonutElem.style.display = "block";
		else 
			emptyMainDonutElem.style.display = "none";
		mainDonut.update(summaryData,animate)
	}
}

function refreshAltSummaryDonut(animate = true){
	if ( altDonut ){
		var summaryData = computeAltDonutData();
		var emptyaltDonutElem = document.getElementById("empty-altsummary-donut");
		var totalCount = 0;
		for(var key in summaryData){totalCount += summaryData[key];}
		if(totalCount == 0)
			emptyaltDonutElem.style.display = "block";
		else 
			emptyaltDonutElem.style.display = "none";
		altDonut.update(summaryData,animate);
	}
}

function refreshAltStackedBar(animate = true){
	if ( altStackedBar ){
		var data = computeAltStackedBarData();
		var emptyaltStackedBarElem = document.getElementById("empty-altsummary-stackedbar");
		if(data.barCount.length == 0)
			emptyaltStackedBarElem.style.display = "block";
		else 
			emptyaltStackedBarElem.style.display = "none";
		altStackedBar.update(data,animate);
	}
}

function refreshMainStackedBar(animate = true){
	if ( mainStackedBar ){
		var data = computeStackedBarData();
		var emptyMainStackedBarElem = document.getElementById("empty-mainsummary-stackedbar");
		if(data.barCount.length == 0)
			emptyMainStackedBarElem.style.display = "block";
		else 
			emptyMainStackedBarElem.style.display = "none";
		mainStackedBar.update(data,animate);
	}
}

function initializeViews(){
	var mainsummaryelem = document.getElementById('mainsummary-donut');
	if ( mainsummaryelem ){
		mainsummaryelem.style.display = 'block';
	}
	var altsummaryelem = document.getElementById('altsummary-donut');
	if ( altsummaryelem ){
		altsummaryelem.style.display = 'none';
	}
	var mainsummarybarelem = document.getElementById('mainsummary-stacked-bar');
	if ( mainsummarybarelem ){
		mainsummarybarelem.style.display = 'block';
	}
	var altsummarybarelem = document.getElementById('altsummary-stacked-bar');
	if ( altsummarybarelem ){
		altsummarybarelem.style.display = 'none';
	}
	var maintableelem = document.getElementById('maindataTable');
	if ( maintableelem ){
		maintableelem.style.display = 'block';
	}	
	var alttableelem = document.getElementById('alttable');
	if ( alttableelem ){
		alttableelem.style.display = 'none';
	}	
}
var notations= {
 	'a': 1e-18,      //Atto 
 	'f': 1e-15,      //Femto 
 	'p': 1e-12,      //Pico 
 	'n': 1e-9,      //Nano 
 	'u': 1e-6,      //Micro 
 	'm': 1e-3,      //Milli 
 	'K': 1e+3,      //Kilo 
 	'M': 1e+6,      //Mega 
 	'G': 1e+9,      //Giga 
 	'T': 1e+12,    //Tera 
  	'P': 1e+15,    //Peta 
};

var unitPriority = { 
 	'A' : 1,
 	'\u2103' : 2, //unicode for degC
  	'V' : 3,
 	'W' : 4
} 

function getComparableValue(str) { 
	var parts = str.split(' '); 
	if (parts.length !== 2) return { value: 0, unit: '' }; 
	 
	var match = parts[0].match(/^(-?\d*\.?\d+)([a-zA-Z]*)$/); 
	if (!match) return { value: 0, unit: '' }; 
	 
	var number = parseFloat(match[1]); 
	var prefix = match[2] || ''; 
	var multiplier = notations[prefix] || 1; 
	  
	var numericValue = number * multiplier; 
	var unit = parts[1]; 
	 
	return { value: numericValue, unit: unit }; 
}
// =========================================Toolbar buttons functions==========================================================

function toggleChartsView(){
	document.body.style.cursor = 'progress';
	var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
	if ( togglechartsviewbtnelem ){
		if ( togglechartsviewbtnelem.classList.contains("nonanalyzed") ){
			togglechartsviewbtnelem.classList.remove('nonanalyzed');
			getChartHeaderText();
			var mainsummarydonutlegend = document.getElementById('mainsummary-donut-label');
			if(mainsummarydonutlegend) { mainsummarydonutlegend.style.display = 'block';}
			// Check the visibility of the charts
			var chartvcelem = document.getElementById('chartvisibilitycontrol');
			if ( chartvcelem && !chartvcelem.classList.contains('hidechart')) {
				var restoreviolationelem = document.getElementById('restoreviolationcontrol');
				if( restoreviolationelem && restoreviolationelem.classList.contains('showchart') ) 
					restoreviolationelem.classList.remove('showchart');
				refreshMainSummaryDonut();
				var mainsummaryelem = document.getElementById('mainsummary-donut');
				if ( mainsummaryelem ){
					mainsummaryelem.style.display = 'block';
				}
				var altsummaryelem = document.getElementById('altsummary-donut');
				if ( altsummaryelem ){
					altsummaryelem.style.display = 'none';
				}
				var mainsummarybarelem = document.getElementById('mainsummary-stacked-bar');
				if ( mainsummarybarelem ){
					mainsummarybarelem.style.display = 'block';
				}
				var altsummarybarelem = document.getElementById('altsummary-stacked-bar');
				if ( altsummarybarelem ){
					altsummarybarelem.style.display = 'none';
				}
				refreshMainStackedBar();
			}
			refreshDashboardTable();
			var railselectionelem = document.getElementById('tabselection');
			if ( railselectionelem ){
				refreshTabsSelection();
			}
			var mainTableElem = document.getElementById('maindataTable');
			if ( mainTableElem ){
				mainTableElem.style.display = 'block';
			}
			var altTableElem = document.getElementById('alttable');
			if ( altTableElem ){
				altTableElem.style.display = 'none';
			}
		} else {
			togglechartsviewbtnelem.classList.add('nonanalyzed');
			getChartHeaderText();
			var mainsummarydonutlegend = document.getElementById('mainsummary-donut-label');
			if(mainsummarydonutlegend){ mainsummarydonutlegend.style.display = 'none'; }
			// Check the visibility of the charts
			var chartvcelem = document.getElementById('chartvisibilitycontrol');
			if ( chartvcelem && !chartvcelem.classList.contains('hidechart')) {
				var restoreviolationelem = document.getElementById('restoreviolationcontrol');
				if(restoreviolationelem){
					if( ignored_violations.length )
						restoreviolationelem.classList.add('showchart');
				}
				refreshAltSummaryDonut();
				var mainsummaryelem = document.getElementById('mainsummary-donut');
				if ( mainsummaryelem ){
					mainsummaryelem.style.display = 'none';
				}
				var altsummaryelem = document.getElementById('altsummary-donut');
				if ( altsummaryelem ){
					altsummaryelem.style.display = 'block';
				}
				var mainsummarybarelem = document.getElementById('mainsummary-stacked-bar');
				if ( mainsummarybarelem ){
					mainsummarybarelem.style.display = 'none';
				}
				var altsummarybarelem = document.getElementById('altsummary-stacked-bar');
				if ( altsummarybarelem ){
					altsummarybarelem.style.display = 'block';
				}
				refreshAltStackedBar();
			}
			refreshDashboardTable();
			var railselectionelem = document.getElementById('tabselection');
			if ( railselectionelem ){
				refreshTabsSelection();
			}
			var maintableelem = document.getElementById('maindataTable');
			if ( maintableelem ){
				maintableelem.style.display = 'none';
			}
			var alttableelem = document.getElementById('alttable');
			if ( alttableelem ){
				alttableelem.style.display = 'block';
			}
		}
		
		var appElement = document.querySelector('#contentContainer');
		var angElement = angular.element(appElement);
		if (angElement && angElement.scope()){
			var appScope = angElement.scope();
			appScope.doughnutSelection = [];
			appScope.barChartSelection = [];
			appScope.refreshTable();
			disableDonutFilterResetButton();
			disableBarFilterResetButton();
		}
	}
	document.body.style.cursor = 'default';
}

function clickFilterModeControl()
{
	document.body.style.cursor = 'progress';
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		var searchmodeelem = document.getElementById('searchmodecontrol');
		if (searchmodeelem) {
			if ( !searchmodeelem.classList.contains('enablefiltermode')){ // Filter mode is off currently.
				searchmodeelem.classList.add('enablefiltermode');
				appScope.filtermode = true;
			} else { // Filter mode is on currently.
				searchmodeelem.classList.remove('enablefiltermode');
				appScope.filtermode = false;
			}
			appScope.refreshTable();
		}
	}
	document.body.style.cursor = 'default';
}		

function clickTableVisibilityControl(){
	document.body.style.cursor = 'progress';
	var tablevcelem = document.getElementById('tablevisibilitycontrol');
	if ( tablevcelem ) {
		if ( !tablevcelem.classList.contains('showtable')){ // Table is hidden currently
			tablevcelem.classList.add('showtable');
			// Show the table in the current feature
			var tableselem = document.getElementById('dashboardtable');
			if ( tableselem ){
				tableselem.style.display = 'block';
			}
			// In case the chart is visible, reduce the height of the table and the chart
			var chartselem = document.getElementById('dashboardcharts');
			if ( tableselem && chartselem && chartselem.style.display !== 'none'){
				tableselem.classList.remove('tableexpand');
				tableselem.classList.add('tableheight');
				chartselem.classList.remove('chartsheightexpand');
				chartselem.classList.add('chartsheight');
				redrawDashboardCharts();
			} 
			// else if chart is invisible, expand the height of the table
			else if (tableselem && chartselem && chartselem.style.display === 'none'){
				tableselem.classList.remove('tableheight');
				tableselem.classList.add('tableexpand');
			}
		} else {
			tablevcelem.classList.remove('showtable');
			// Hide the table
			var tableselem = document.getElementById('dashboardtable');
			if ( tableselem ){
				tableselem.style.display = 'none';
			}
			// If the chart is displayed, expand it's height as the table is no longer displayed
			var chartselem = document.getElementById('dashboardcharts');
			if ( tableselem && chartselem && chartselem.style.display !== 'none' ){
				chartselem.classList.remove('chartsheight');
				chartselem.classList.add('chartsheightexpand');
				redrawDashboardCharts();
			} else {
				clickChartVisibilityControl();
			}			
		}
	}
	document.body.style.cursor = 'default';
}

function clickChartVisibilityControl(){
	document.body.style.cursor = 'progress';
	var chartvcelem = document.getElementById('chartvisibilitycontrol');
	if ( chartvcelem ) {
		if ( !chartvcelem.classList.contains('showchart')){ // Chart is hidden currently.
			chartvcelem.classList.add('showchart');
			// Show the chart in the current feature.
			var chartselem = document.getElementById('dashboardcharts');
			if ( chartselem ){
				chartselem.style.display = 'inline-block';
			}
			// If the table is displayed, reduce it's height because chart will take space
			var tableselem = document.getElementById('dashboardtable');
			if ( tableselem && tableselem.style.display !== 'none' ){
				tableselem.classList.remove('tableexpand');
				tableselem.classList.add('tableheight');
				chartselem.classList.remove('chartsheightexpand');
				chartselem.classList.add('chartsheight');
				redrawDashboardCharts();
				var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
				if ( togglechartsviewbtnelem ){
					var mainDonutElem = document.getElementById('mainsummary-donut');
					var mainStackedBarElem = document.getElementById('mainsummary-stacked-bar');
					var altDonutElem = document.getElementById('altsummary-donut');
					var altStackedBarElem = document.getElementById('altsummary-stacked-bar');
					if ( togglechartsviewbtnelem.classList.contains("nonanalyzed") ){
						if ( mainDonutElem ){mainDonutElem.style.display = 'none';}
						if ( mainStackedBarElem ){mainStackedBarElem.style.display = 'none';}
						if ( altDonutElem ){altDonutElem.style.display = 'block';}
						if ( altStackedBarElem ){altStackedBarElem.style.display = 'block';}
					}
					else 
					{
						if ( mainDonutElem ){mainDonutElem.style.display = 'block';}
						if ( mainStackedBarElem ){mainStackedBarElem.style.display = 'block';}
						if ( altDonutElem ){altDonutElem.style.display = 'none';}
						if ( altStackedBarElem ){altStackedBarElem.style.display = 'none';}
					}
				}
			}
			// Else if table is hidden, then expand the chart's height.
			else if ( chartselem && tableselem && tableselem.style.display === 'none'){
				chartselem.classList.remove('chartsheight');
				chartselem.classList.add('chartsheightexpand');
				redrawDashboardCharts();
				var togglechartsviewbtnelem = document.querySelector("#viewvisibilitycontrol");
				if ( togglechartsviewbtnelem ){
					var mainDonutElem = document.getElementById('mainsummary-donut');
					var mainStackedBarElem = document.getElementById('mainsummary-stacked-bar');
					var altDonutElem = document.getElementById('altsummary-donut');
					var altStackedBarElem = document.getElementById('altsummary-stacked-bar');
					if ( togglechartsviewbtnelem.classList.contains("nonanalyzed") ){
						if ( mainDonutElem ){mainDonutElem.style.display = 'none';}
						if ( mainStackedBarElem ){mainStackedBarElem.style.display = 'none';}
						if ( altDonutElem ){altDonutElem.style.display = 'block';}
						if ( altStackedBarElem ){altStackedBarElem.style.display = 'block';}
					}
					else 
					{
						if ( mainDonutElem ){mainDonutElem.style.display = 'block';}
						if ( mainStackedBarElem ){mainStackedBarElem.style.display = 'block';}
						if ( altDonutElem ){altDonutElem.style.display = 'none';}
						if ( altStackedBarElem ){altStackedBarElem.style.display = 'none';}
					}
				}
			}
		} else { // Chart is visible currently
			chartvcelem.classList.remove('showchart');
			// Hide the charts in the current feature
			var chartselem = document.getElementById('dashboardcharts');
			if ( chartselem ){
				chartselem.style.display = 'none';
			}
			// If the table is displayed, expand it's height as the chart is no longer displayed
			var tableselem = document.getElementById('dashboardtable');
			if ( tableselem && tableselem.style.display !== 'none'){
				tableselem.classList.remove('tableheight');
				tableselem.classList.add('tableexpand');
			} else {
				clickTableVisibilityControl();
			}
		}
	}
	document.body.style.cursor = 'default';
}

function clickClearFilterControl()
{
	document.body.style.cursor = 'progress';
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		var clearfilterelem = document.getElementById('filtercontrol');
		if ( clearfilterelem) {
			if ( clearfilterelem.classList.contains('enableclearfilter')){ // Filters are applied currently.
				appScope.searchText = "";
				refreshAll();
			}
		}
	}
	document.body.style.cursor = 'default';
}

function enableDonutFilterResetButton(){
	var defbuttonelem = document.getElementById("donutChart-filter");
	if ( defbuttonelem && !defbuttonelem.classList.contains("active-btn")){
		defbuttonelem.classList.add("active-btn");
	}
	defbuttonelem.blur();
}

function disableDonutFilterResetButton(){
	var defbuttonelem = document.getElementById("donutChart-filter");
	if (defbuttonelem){
		if ( defbuttonelem.classList.contains("active-btn")){
			defbuttonelem.classList.remove("active-btn");
		}
		defbuttonelem.blur();
	}
}

function resizecharts(){
	if( mainDonut ){refreshMainSummaryDonut(false);}
	if( altDonut ){refreshAltSummaryDonut(false);}
	if( mainStackedBar ){refreshMainStackedBar(false);}
	if( altStackedBar){refreshAltStackedBar(false);}
	
	var isMainView = 0;
	var chartSelection = [];
				
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		let clickEvent = new MouseEvent("click", {
										bubbles: true,
										cancelable: true
						});
		if(appScope.doughnutSelection.length){
			chartSelection = appScope.doughnutSelection;
			var mainDonutElem = document.getElementById('mainsummary-donut');
			if ( mainDonutElem && mainDonutElem.style.display === 'block')
				isMainView = 1;
				
			for(let s = 0; s < chartSelection.length; s++){
				var id = "#" + chartSelection[s];
				if(isMainView){
					d3.select('#mainsummary-donut').select(id).node().dispatchEvent(clickEvent);
				}
				else
					d3.select('#altsummary-donut').select(id).node().dispatchEvent(clickEvent);
			}
		}
		else if(appScope.barChartSelection.length){
			chartSelection = appScope.barChartSelection;
			var mainStackedBarElem = document.getElementById('mainsummary-stacked-bar');
			if ( mainStackedBarElem && mainStackedBarElem.style.display === 'block')
				isMainView = 1;

			if(isMainView){
				var d = d3.select('#mainsummary-stacked-bar').selectAll("rect").each(function(d,i){
				if(Array.isArray(d)){
					var currId = d.data["Key"] + ":" + d.stackKey.replace("Count", "");
					if(chartSelection.includes(currId))
						d3.select(this).on('click').apply(this, arguments);
					}
				});
			}
			else{
				var d = d3.select('#altsummary-stacked-bar').selectAll("rect").each(function(d,i){
				if(Array.isArray(d)){
					var currId = d.data["Key"] + ":" + d.stackKey.replace("Count", "");
					if(chartSelection.includes(currId))
						d3.select(this).on('click').apply(this, arguments);
					}
				});
			}
		}
	}
}				

function enableBarFilterResetButton(){
	var defbuttonelem = document.getElementById("stackedBarChart-filter");
	if ( defbuttonelem && !defbuttonelem.classList.contains("active-btn")){
		defbuttonelem.classList.add("active-btn");
	}
}

function disableBarFilterResetButton(){
	var defbuttonelem = document.getElementById("stackedBarChart-filter");
	if (defbuttonelem){
		if ( defbuttonelem.classList.contains("active-btn")){
			defbuttonelem.classList.remove("active-btn");
		}
		defbuttonelem.blur();
	}
}

function redrawDashboardCharts(){
	if ( mainDonut ) {refreshMainSummaryDonut();}
	if ( altDonut ) {refreshAltSummaryDonut();}
	if ( mainStackedBar ){refreshMainStackedBar();}
	if ( altStackedBar ){refreshAltStackedBar();}
				
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		appScope.barChartSelection = [];
		appScope.doughnutSelection = [];
		appScope.refreshTable();
		disableBarFilterResetButton();
		disableDonutFilterResetButton();
	}
}

function resetRulesCheckFilters(){
	refreshAll();
	resetBarSelections();
	disableBarFilterResetButton();
}

function resetViolationsFilters(){
	refreshAll();
	resetDonutSelections();
	disableDonutFilterResetButton();
}

function resetBarSelections(){
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		appScope.barChartSelection = [];
		if ( appScope.searchText ){
			var clearfilterelem = document.getElementById('filtercontrol');
			if ( clearfilterelem ) {
				clearfilterelem.classList.add('enableclearfilter');
			}
		}else{
			var clearfilterelem = document.getElementById('filtercontrol');
			if ( clearfilterelem ) {
				clearfilterelem.classList.remove('enableclearfilter');
			}
		}
	}
}

function resetDonutSelections(){
	var appElement = document.querySelector('#contentContainer');
	var angElement = angular.element(appElement);
	if (angElement && angElement.scope()){
		var appScope = angElement.scope();
		appScope.doughnutSelection = [];
		if ( appScope.searchText ){
			var clearfilterelem = document.getElementById('filtercontrol');
			if ( clearfilterelem ) {
				clearfilterelem.classList.add('enableclearfilter');
			}
		}else{
			var clearfilterelem = document.getElementById('filtercontrol');
			if ( clearfilterelem ) {
				clearfilterelem.classList.remove('enableclearfilter');
			}
		}
	}
}

// ===========================================Bar chart tooltip functions================================================

function createTooltipBar(elementid, displayCat){
	var tooltip = d3.select(elementid)
						.append('div')
						.attr('class', 'stackedbartooltip')
						.style('display', 'none');
	var titlerow = tooltip.append("div").attr("class","titlerow");
	titlerow.append("div").attr("class","titletext");
	titlerow.append("div").attr("class","titlecount");
	var i;
	for(i = 0; i < displayCat.length; i++){
		if( i == 0 || i%2 == 0)
			this[displayCat[i] + "Row"] = tooltip.append("div").attr("class","evenrow");
		else
			this[displayCat[i] + "Row"] = tooltip.append("div").attr("class","oddrow");
		this[displayCat[i] + "Row"].append("div").attr("id",[displayCat[i]+"text"]).attr("class","tooltiprowtext");
		this[displayCat[i] + "Row"].append("div").attr("id",[displayCat[i]+"count"]).attr("class","tooltiprowcount");
	}
	if( i == 0 || i%2 == 0)
		var totalrow = tooltip.append("div").attr("class","evenrow");
	else
		var totalrow = tooltip.append("div").attr("class","oddrow");
	totalrow.append("div").attr("class","totaltext");
	totalrow.append("div").attr("class","totalcount");
}

function createtooltipoutlier(elementid, outlierCountData, displayCat){
	let legendtooltip = d3.select(elementid)
						.append('div')
						.attr('class', 'stackedbarlegendtooltip')
						.style('display', 'none');
	legendtooltip.append("div").attr("class","caption");
	var titlerow = legendtooltip.append("div").attr("class","titlerow");
	titlerow.append("div").attr("id", "titlekey").attr("class","titlekey");
							
	for(var i = 0; i < displayCat.length; i++){
		titlerow.append("div").attr("id","title"+[displayCat[i]]).attr("class","legendrowheader");
	}
	titlerow.append("div").attr("id", "titletotal").attr("class","legendrowheader");

	for(var i= 0; i < outlierCountData.length; ++i){
		var indexclass = "index"+i;
		var oddevenclass;
		if(i%2){oddevenclass="oddrow";} else {oddevenclass="evenrow";}
		var contentclasses = "contentrow " + indexclass + " " + oddevenclass; 
		var contentrow = legendtooltip.append("div").attr("class",contentclasses);
		contentrow.append("div").attr("class","contentkey");
		for(var j = 0; j < displayCat.length; j++){
			contentrow.append("div").attr("class","legendrow").attr("id","content"+[displayCat[j]]);
		}
		contentrow.append("div").attr("class","contenttotal");
	}
}

function initializeTooltipBar(elementid, d, summary, totalposttext, displayCat){
	let tooltip = d3.select(elementid + " div.stackedbartooltip");
	let pageY, pageX;
	pageX = d3.event.pageX - 320;
	if(d3.event.pageY > 500)
		pageY = d3.event.pageY - 160;
	else
		pageY = d3.event.pageY + 10;
	tooltip
		.style("left", pageX + "px")
		.style("top", pageY + "px");
	let tooltiptitletext,tooltiptitlecount;
	let tooltiptotaltext, tooltiptotalcount;
	tooltiptitletext = "<b>" + d.data.Key.toUpperCase() + summary + "</b>";
	tooltiptitlecount = "<b>" + getTranslatedString("count") + "</b>";
	tooltiptotaltext = getTranslatedString("total") + d.data.Key + totalposttext ;
	tooltiptotalcount = d.data.TotalCount;
	
	tooltip.select(".titletext").html(tooltiptitletext);
	tooltip.select(".titlecount").html(tooltiptitlecount);
	tooltip.select(".totaltext").html(tooltiptotaltext);
	tooltip.select(".totalcount").html(tooltiptotalcount);
	
	for(var i = 0; i < displayCat.length; i++){
		var dataCount = displayCat[i] + "Count";
		this[displayCat[i] + "text"] = getTranslatedString(displayCat[i]);
		this[displayCat[i] + "count"] = d.data[dataCount];

		var tooltipRowText = "#" + displayCat[i]+"text";
		tooltip.select(tooltipRowText).html(this[displayCat[i] + "text"]);
		var tooltipRowCount = "#" + displayCat[i]+"count";
		tooltip.select(tooltipRowCount).html(this[displayCat[i] + "count"]);
	}
}

function initializetooltipoutlier(elementid, outlierCountData, displayCat){
	let legendtooltip = d3.select(elementid + " div.stackedbarlegendtooltip");
	let tooltipcaption = "<b>" + getTranslatedString('outliertitletooltip') + "</b>";
	let titlekey = "<b>" + getTranslatedString('outliertitledevicecol') + "</b>";
	legendtooltip.select(".caption").html(tooltipcaption);
	legendtooltip.select(".titlekey").html(titlekey);
	let titletotal = "<b>" + getTranslatedString('outliertitletotalcol') + "</b>";
	legendtooltip.select("#titletotal").html(titletotal);
	
	for (var i = 0; i < displayCat.length; i++){
		var displayCatText = displayCat[i];
		if (mode == "STRESS") {
			if (displayCat[i] == "Low_Stressed") {
				displayCatText = getTranslatedString("Low");
			}
			else if (displayCat[i] == "Moderately_Stressed") {
				displayCatText = getTranslatedString("Moderate");
			}
			else if (displayCat[i] == "Highly_Stressed") {
				displayCatText = getTranslatedString("High");
			}
			else if (displayCat[i] == "Over_Stressed") {
				displayCatText = getTranslatedString("Over");
			}
			else if (displayCat[i] == "Unanalyzed") {
				displayCatText = getTranslatedString("Unanalyzed");
			}
			else {
				displayCatText = getTranslatedString("Beyond Minimum Temp");
            }
        }
		this["title" + displayCat[i]] = "<b>" + getTranslatedString(displayCatText).toUpperCase() + "</b>";
		var tooltipRowText = "#title" + displayCat[i];
		legendtooltip.select(tooltipRowText).html(this["title"+displayCat[i]]);
	}
	for(var i= 0; i < outlierCountData.length; ++i){
		let key = "<b style=\"white-space: nowrap;\">" + outlierCountData[i]["Key"] + "</b>";
		let contentrow = legendtooltip.select(".index"+i);
		contentrow.select(".contentkey").html(key);
		for(var j = 0; j < displayCat.length; j++){
			var dataCount = displayCat[j] + "Count";
			this[displayCat[j]+"data"] = outlierCountData[i][dataCount];
			contentrow.select("#content"+displayCat[j]).html(this[displayCat[j]+"data"]);
		}
		let total = outlierCountData[i]["TotalCount"];
		contentrow.select(".contenttotal").html(total);							
	}
	let pageY, pageX;
	var w = parseInt(legendtooltip.style('width'));
	pageX = d3.event.pageX - w;
	if(d3.event.pageY > 500){
		var h = parseInt(legendtooltip.style('height'));
		pageY = d3.event.pageY - h - 10;
	}
	else
		pageY = d3.event.pageY + 10;
	legendtooltip
		.style("left", pageX + "px")
		.style("top", pageY + "px");
}

function showTooltipBar(elementid, d){
	let tooltip = d3.select(elementid + " div.stackedbartooltip");
	let pageY, pageX;
	pageX = d3.event.pageX - 320;
	if(d3.event.pageY > 500)
		pageY = d3.event.pageY - 160;
	else
		pageY = d3.event.pageY + 10;
	tooltip
		.style("left", pageX + "px")
		.style("top", pageY + "px")
		.style('display', 'inline-block')
		.style('position', 'absolute');
}

function hideTooltipBar(elementid){
	let tooltip = d3.select(elementid + " div.stackedbartooltip");
	tooltip.style('display', 'none');
}

function showtooltipoutlier(elementid){
	let legendtooltip = d3.select(elementid + " div.stackedbarlegendtooltip");
	legendtooltip
		.style('display', 'inline-block')
		.style('position', 'absolute');
}

function hidetooltipoutlier(elementid){
	let legendtooltip = d3.select(elementid + " div.stackedbarlegendtooltip");
	legendtooltip.style('display', 'none');
}

function createtooltipHist(elementid){
	var tooltip = d3.select(elementid)
		.append('div')
			.attr('class', 'stackedbartooltip')
			.style('display', 'none');
	var titlerow = tooltip.append("div").attr("class","titlerow");
	titlerow.append("div").attr("class","titletext");
	titlerow.append("div").attr("class","titlecount");
	var rangerow = tooltip.append("div").attr("class","evenrow");
	rangerow.append("div").attr("class","safetext");
	rangerow.append("div").attr("class","safecount");
	var countrow = tooltip.append("div").attr("class","oddrow");
	countrow.append("div").attr("class","moderatetext");
	countrow.append("div").attr("class","moderatecount");
}

function countDecimalDigits(value) { 
    if ((value % 1) != 0) 
        return value.toString().split(".")[1].length;  
    return 0;
}

function initializetooltipHist(elementid, d, summary){
	let tooltip = d3.select(elementid + " div.stackedbartooltip");
	let pageY, pageX;
	var w = parseInt(tooltip.style('width'));
	pageX = d3.event.pageX - w;
	if(d3.event.pageY > 500){
		var h = parseInt(tooltip.style('height'));
		pageY = d3.event.pageY - h - 10;
	}
	else
		pageY = d3.event.pageY + 10;
	tooltip
		.style("left", pageX + "px")
		.style("top", pageY + "px");
	
	let tooltiptitletext,tooltiptitlecount;
	let tooltiprangetext, tooltiprangecount;
	let tooltipcounttext, tooltipcount;
	
	tooltiptitletext = "<b>" + summary + "</b>";
	tooltiptitlecount = "";
	tooltiprangetext = getTranslatedString("Range");
	var countOfx0 = countDecimalDigits(d.x0);
	var countOfx1 = countDecimalDigits(d.x1);
	if(countOfx0>2)
		d.x0=Number(d.x0).toFixed(2);
	if(countOfx1>2)
		d.x1=Number(d.x1).toFixed(2);
	tooltiprangecount = d.x0 + " - " + d.x1;
	tooltipcounttext = getTranslatedString("counttext");
	tooltipcount = d.length;
	
	tooltip.select(".titletext").html(tooltiptitletext);
	tooltip.select(".titlecount").html(tooltiptitlecount);
	tooltip.select(".safetext").html(tooltiprangetext);
	tooltip.select(".safecount").html(tooltiprangecount);
	tooltip.select(".moderatetext").html(tooltipcounttext);
	tooltip.select(".moderatecount").html(tooltipcount);
}

//======================================Callback to be called when the document is ready===========================================
function onReady(callback) {
	callback.call();
}

function addClass(selector, className) {
	document.getElementById(selector).classList.add(className);
}

function removeClass(selector, className) {
	document.getElementById(selector).classList.remove(className);
}
