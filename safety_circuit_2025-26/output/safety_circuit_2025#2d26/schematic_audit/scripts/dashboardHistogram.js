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

var mainStackedBar;
var altStackedBar;

class SummaryHistogram{
	static get defaults() {
		return {
			margin: {top: 10, right: 10, bottom: 55, left: 35},
		};
	}
	
	constructor(config) {
        this.configure(config);
        this.init();
    }
	
	configure(config) {
        Object.assign(this, SummaryHistogram.defaults, config);
    }
	
	init(animate = true) {
        const { parentcontainerid, margin, data, tooltiphelpers, colorrange, min, max, filterKey, key, xaxistitlestr, getselectedcategory, contId} = this;
		
		var viewportwidth = d3.select(parentcontainerid).node().clientWidth;
		var viewportheight = d3.select(parentcontainerid).node().clientHeight - 40; // Take away the title bar height			
		var smallheight = false;
		if(viewportheight < 90)
			smallheight = true;
		var axisfontsize = '12px';
		if (smallheight){
			axisfontsize = '8px';
		}

		const width = viewportwidth - margin.left - margin.right;
		const height = viewportheight - margin.top - margin.bottom;
		const separation = 5;
		const elementid = this.element;
		var categories_selected = [];
		// let maxTotal = function d3.max(bins, function(d) { return d.length; });
		
		let tickSpaces = 5;
		if(viewportheight < 100)
			tickSpaces = 1;
		else if (viewportheight < 120)
			tickSpaces = 2;
		else if (viewportheight < 140)
			tickSpaces = 3;
		else if ( viewportheight < 160)
			tickSpaces = 4;

		// Create tooltip placeholders
		if ((typeof tooltiphelpers !== 'undefined') && tooltiphelpers != null){		
			tooltiphelpers.createtooltip(elementid);
		}
		// // Create path animation helper for mouse hover and click	
		let pathAnim = function(path, dir) {
			switch(dir) {
				case 0:
					path
						.transition()
						.duration(500)
						.style("fill", colorrange[0]);
					break;
				case 1:
					path
						.transition()
						.style("fill", colorrange[1]);
					break;
			}
		};
		

		let mouseOverHandler = function(d){
			pathAnim(d3.select(this), 1);
			if ((typeof tooltiphelpers !== 'undefined') && tooltiphelpers != null){	
				tooltiphelpers.showtooltip(elementid, d);
			}
		}
		let mouseMoveHandler = function(d){
			if ((typeof tooltiphelpers !== 'undefined') && tooltiphelpers != null){	
				tooltiphelpers.initializetooltip(elementid, d);
			}
		
		}
		let mouseOutHandler = function(d){
			var thisPath = d3.select(this);
			var clicked = thisPath.classed('clicked');
			if(clicked)
				pathAnim(d3.select(this), 1);
			else
				pathAnim(d3.select(this), 0);
			if ((typeof tooltiphelpers !== 'undefined') && tooltiphelpers != null){	
				tooltiphelpers.hidetooltip(elementid);
			}
		}
		
		let mouseClickHandler = function(d){
				pathAnim(d3.select(this), 1);
				resetDonutSelections();
			    disableDonutFilterResetButton();
				if(mainDonut){refreshMainSummaryDonut(false);}
			    if(altDonut){refreshAltSummaryDonut(false);}
				
				var thisPath = d3.select(this);
				var category = [];
				var items = d.forEach(obj => {
					category.push(obj[filterKey]);
				})
				var clicked = thisPath.classed('clicked');
				pathAnim(thisPath, ~~(!clicked));
				thisPath.classed('clicked', !clicked);
				
				if(!clicked){
					if(categories_selected.length == 0)
						categories_selected = category;
					else
						categories_selected = categories_selected.concat(category);
				} else{
					categories_selected = categories_selected.filter(item => !category.includes(item));
				}
				
				var appElement = document.querySelector(contId);
				var angElement = angular.element(appElement);
				if (angElement && angElement.scope()){
					var appScope = angElement.scope();
					appScope.barChartSelection = categories_selected;
					appScope.refreshTable();
				}
				
				if(categories_selected.length == 0) {
					disableBarFilterResetButton();
				} else {
					enableBarFilterResetButton();	
				}
		}
		
		var customFormat = function(d)
		{
			if(d == 0)
				return 0;
			else if(d >= 1e-3)
				return d;
			else
				return d.toExponential();
		}
		// Create the svg placeholder for the chart
		let svg = d3.select(this.element)
				.append("svg")
					.attr("viewBox", "0 0 " + viewportwidth + " " + viewportheight)
					.attr("preserveAspectRatio", "xMinYMin meet");
	
		// Get the g-placeholder for the chart and transform				
		let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + (margin.top + separation) + ")");
		
		if(data.length)
		{
 			var strokecolor = "#393939";
			if ( theme == "light"){strokecolor = "white";}
			// Initialize the X-Axis
			var tempRise = d3.max(data, function (d) { return +d[key] });
			if (Math.abs(tempRise-0.01) < 0.000001||tempRise==0.00) {
			    tempRise = 0.1;
			}
			var x = d3.scaleLinear()
			    .domain([0, tempRise])
			    .range([0, width]);

			let xaxis = g.append("g")
				.attr("class", "x-axis")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x).tickFormat(customFormat))
				.selectAll("text")
				.attr("font-size",axisfontsize);
				
			// set the parameters for the histogram
			var histogram = d3.histogram()
							.value(function(d) { return d[key]; })
							.domain(x.domain())
							.thresholds(x.ticks(40));

			// And apply this function to data to get the bins
			var bins = histogram(data);

			// Initialize the Y-Axis
			var y = d3.scaleLinear()
					.range([height, 0])
					.domain([0, d3.max(bins, function(d) { return d.length; })]);
		
			let yaxis = g.append("g")
				.attr("class", "y-axis")
				.call(d3.axisLeft(y).ticks(tickSpaces).tickSizeInner(-width).tickSizeOuter(0))
				.selectAll("text")
					.attr("font-size",axisfontsize);
					
			// append the bar rectangles to the svg element
			  svg.selectAll("rect")
					.data(bins)
					.enter()
						.append("rect")
							.on("mouseover", mouseOverHandler)
							.on("mouseout", mouseOutHandler)
							.on("mousemove", mouseMoveHandler)
							.on("click", mouseClickHandler)
							.style("stroke-width","1")
							.style("opacity",'1')
							.attr("class","bars")
							.attr("stroke", strokecolor)
							.attr("x", 1)
							.attr("y", 0)
							.attr("transform", function(d) { return "translate(" + (x(d.x0) + margin.left )+ "," + (y(d.length) + margin.top + separation) + ")"; })
							.attr("width", function(d) { return x(d.x1) - x(d.x0); })
							//.attr("height", function(d) {return height - y(d.length);})
							.attr("height", function(d) {
                                            if(animate)
                                                return 0;
                                            else
                                                return height - y(d.length);
                                            })
							.style("fill", colorrange[0])
							
			var animationDuration = 600;
			if (animate){
				svg.selectAll("rect")
					.transition().ease(d3.easeLinear).duration(animationDuration)
					.attr("height", function(d) { return ( height - y(d.length)); })
					//.delay(function (d, i) {return i * 50;})
			}
			
			let xaxistitle = g.append("g")
				.attr("class","x-axis-title")
				.attr("text-anchor","end");
			xaxistitle
				.append("text")
					.attr("transform", "translate(" + 0 + "," + 0 + ")")
					.attr("x", width)
					.attr("y", height+32)
					.attr('font-size', axisfontsize)
					.text(getTranslatedString(xaxistitlestr));
		}
	}

	update(summaryData, animate = true) {
		d3.select(this.element).selectAll('svg').remove();
		this.data = summaryData;
		this.init(animate);
	}
} 

function drawHistogram(barData, barId, toolTipHelpers, colorRange, minValue, maxValue, filterkey, xKey, xTitle, getSelectedCategory, c_id)
{
	var margintop = 20, marginbottom = 40, marginright = 20, marginleft = 40;
	var childeElem = document.getElementById(barId.slice(1)).children;
	var emptyHistogramElem = document.getElementById(childeElem[0].id);
	
	var parentElem = document.getElementById(barId.slice(1));
	var parentId = parentElem.parentNode;
	
	if(barData.length == 0 || barData == 0)
		emptyHistogramElem.style.display = "block";
	else 
		emptyHistogramElem.style.display = "none";
	
	var obj = new SummaryHistogram({
		element:barId,
		parentcontainerid:parentId,
		margin:{top:margintop, right:marginright, bottom:marginbottom, left:marginleft},
		data:barData,
		tooltiphelpers:toolTipHelpers,
		colorrange:colorRange,
		min:minValue,
		max:maxValue,
		filterKey:filterkey,
		key:xKey,
		xaxistitlestr:xTitle,
		getselectedcategory:getSelectedCategory,
		contId:c_id
	});
	return obj;
}
