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
var toggleableCategories = ["Waived", "Ignore","Unanalyzed"];

class SummaryStackedBar{
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
        Object.assign(this, SummaryStackedBar.defaults, config);
    }
	
	init(animate = true) {
        const { parentcontainerid, margin, data, maxy, colorrange, xkey, ykey, xaxistitlestr, yaxistitlestr, stackkeys, tooltiphelpers, legendtooltiphelpers, getselectedcategory, angle, contId} = this;
		
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
		var barwidth = 60;
		var tablevcelem = document.getElementById('tablevisibilitycontrol');
		if ( tablevcelem && !tablevcelem.classList.contains('showtable')){
			barwidth = 80;
		}
		const computedData = this.data;
		const barChartCountData = computedData.barCount;
		const outlierCountData = computedData.outlierCount;
		var categories_selected = [];
		let outlierKeys = [getTranslatedString("outliers")];
		let maxTotal = maxy(barChartCountData, ykey);
		
		let tickSpaces = 5;
		if(viewportheight < 100)
			tickSpaces = 1;
		else if (viewportheight < 120)
			tickSpaces = 2;
		else if (viewportheight < 140)
			tickSpaces = 3;
		else if ( viewportheight < 160)
			tickSpaces = 4;

		let tickInterval =  Math.ceil(maxTotal/tickSpaces);
		tickInterval -= (tickInterval%tickSpaces);
		if ( tickInterval < tickSpaces)
			tickInterval = 2;//previously 1 now set to 2 to avoid overlap
		let maxTick = (1 + Math.ceil(maxTotal/tickInterval)) * tickInterval;

		// Initialize scales
		let x = d3.scaleBand()
			.domain(barChartCountData.map(function(d) { return d[xkey]; }))
			.rangeRound([0,computedData.barCount.length * (barwidth) ])
			.padding([0.5]);
				
		let y = d3.scaleLinear()
			.domain([0, maxTick])
			.rangeRound([height, 0]);
			
		let z = d3.scaleOrdinal()
			.domain(stackkeys)
			.range(colorrange)
		;
		
		// Create tooltip placeholders
		if ((typeof tooltiphelpers !== 'undefined') && tooltiphelpers != null){		
			tooltiphelpers.createtooltip(elementid);
		}
		if ((typeof legendtooltiphelpers !== 'undefined') && legendtooltiphelpers != null){	
			legendtooltiphelpers.createtooltip(elementid, outlierCountData);
		}
		
		// Create path animation helper for mouse hover and click	
		let pathAnim = function(path, dir) {
			switch(dir) {
				case 0:
					path
						.transition()
						.duration(500)
						.attr("width", x.bandwidth())
						.style("stroke-width",0.5);
					break;
				case 1:
					path
						.transition()
						.attr("width",1.3 * x.bandwidth())
						.style("stroke-width",0.5);
					break;
			}
		};
		
		let mouseOverLegendHandler = function(d){
			if ((typeof legendtooltiphelpers !== 'undefined') && legendtooltiphelpers != null){	
				legendtooltiphelpers.showtooltip(elementid);
			}
		}	
		
		let mouseOutLegendHandler = function(d){
			if ((typeof legendtooltiphelpers !== 'undefined') && legendtooltiphelpers != null){	
				legendtooltiphelpers.hidetooltip(elementid);
			}
		}
		
		let mouseMoveLegendHandler = function(d){
			if ((typeof legendtooltiphelpers !== 'undefined') && legendtooltiphelpers != null){	
				legendtooltiphelpers.initializetooltip(elementid, outlierCountData);
			}
		}
		
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
			if (!thisPath.classed('clicked')) {
				pathAnim(thisPath, 0);
			}
			if ((typeof tooltiphelpers !== 'undefined') && tooltiphelpers != null){	
				tooltiphelpers.hidetooltip(elementid);
			}
		}
		
		let mouseClickHandler = function(d){
				resetDonutSelections();
			    disableDonutFilterResetButton();
				if(mainDonut){refreshMainSummaryDonut(false);}
			    if(altDonut){refreshAltSummaryDonut(false);}
				
				var thisPath = d3.select(this);
				var category = getselectedcategory(d);
				var clicked = thisPath.classed('clicked');
				pathAnim(thisPath, ~~(!clicked));
				thisPath.classed('clicked', !clicked);
				
				var categorySelected = category.split(":").pop();
				category = category.replace("Beyond_Minimum_Temp", "Frozen");
				if(toggleableCategories.indexOf(categorySelected) !== -1) {
					toggleChartsView();
					if(altStackedBar){refreshAltStackedBar();}
				}
				else{
					if(!clicked){
						categories_selected.push(category);
					} else{
						categories_selected = categories_selected.filter(function(ele){return ele != category;});
					}
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
		let wrap = function(text, width){
			text.each(function() {
				var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(), 
				word,
				line = [],
				lineNumber = 0,
				x = text.attr("x"),
				y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				lineHeight = 2.3, // ems
				tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + 0.3 + "em");   
				while (word = words.pop()) {
					line.push(word); 
					tspan.text(line.join(" "));
					var textWidth = tspan.node().getComputedTextLength();
					if (textWidth > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						++lineNumber;
						tspan = text.append("tspan").attr("x", 0).attr("y", 0).attr("dy", lineNumber * lineHeight + dy + "em").attr("vertical-align", "middle").text(word);
					}
				}
			});
		} 
		var insertLinebreaks=function(d){
			var el=d3.select(this);
			var words=d.split(' ');
			el.text('');
			var tspan=el;
			if(words.length>1){
				for(var i=0;i<words.length-1;i++){
					tspan=el.append('tspan').text(words[i]);
					if(i>0)
						tspan.attr('x',0).attr('dy','15');
				}
				tspan.style("text-anchor", "middle");
			}
			else
			{
				var el=d3.select(this);
				el.text('');
				var tspan=el;
				var words=d.match(/.{1,15}/g);
				for(var i=0;i<words.length;i++){
					tspan=el.append('tspan').text(words[i]);
					if(i>0)
						tspan.attr('x',0).attr('dy','15');
				}
				tspan.style("text-anchor", "end").attr("dx", "-5px");
				
			}
		};			
		// Create the svg placeholder for the chart		
		let svg = d3.select(this.element)
				.append("svg")
					.attr("viewBox", "0 0 " + viewportwidth + " " + viewportheight)
					.attr("preserveAspectRatio", "xMinYMin meet")
			;
					
		// Get the g-placeholder for the chart and transform				
		let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + (margin.top + separation) + ")");
		
		if(barChartCountData.length)
		{
			
			// Initialize the X-Axis
			let xaxis = g.append("g")
			  .attr("class", "x-axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(d3.axisBottom(x).ticks().tickSizeOuter(0))
			  .selectAll("text")
			  .attr("transform", `rotate(${angle})`)
			  .attr("font-size",axisfontsize)
			  .attr("dx", function(d) { 
									if(angle)
										return "-5px";
									else
										return "0px";})
			  .style("text-anchor", function(d) { 
									if(angle)
										return "end";
									else
										return "middle";});
	
			// Initalize the Y-Axis
			
			
			
			let yaxis = g.append("g")
			  .attr("class", "y-axis")
	//		  .call(d3.axisLeft(y).ticks(tickInterval, d3.format(",s")).tickSize(-width,0).tickValues(d3.range(0,maxTotal,tickInterval)));
			  .call(d3.axisLeft(y).ticks(tickInterval).tickSizeInner(-width).tickSizeOuter(0).tickValues(d3.range(0,maxTick,tickInterval)))
			  .selectAll("text")
				.attr("font-size",axisfontsize)
			  ;
			  
			var strokecolor = "#393939";
			if ( theme == "light"){strokecolor = "white";}
			// Initialize the stacked layers
			g.append("g").selectAll("g")
				.data(d3.stack().keys(stackkeys)(barChartCountData))
				.enter()
					.append("g")
						.attr("fill", function(d) { return z(d.key);})
						.selectAll("rect")
							.data(function(d) { d.forEach(obj => {obj["stackKey"] = d.key;});
												return d; })
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
									.attr("x", function(d) { return (x(d.data[xkey])); })
									.attr("y", function(d) { return y(d[1]);})
									.attr("rx",2)
									.attr("ry",2)
									.attr("width", x.bandwidth())
									.attr("height", function(d) { 
													if(animate){
														return 0; //(y(d[0]) - y(d[1]));
													} else {
														return (y(d[0]) - y(d[1]));
													} 
												})

			var animationDuration = 1000;
			document.getElementById(elementid.slice(1)).classList.add("nopointerevent");
			
			if (animate){
				g.selectAll("rect")
					.transition().ease(d3.easeLinear).duration(animationDuration)
					.attr("height", function(d) { return ( y(d[0]) - y(d[1])); })
					//.delay(function (d, i) {return i * 50;})
			}
			
			setTimeout(function(){
			document.getElementById(elementid.slice(1)).classList.remove("nopointerevent");
				
			}, animationDuration+20);							
		 
		
			let xaxistitle = g.append("g")
				.attr("class","x-axis-title")
				.attr("text-anchor","end");
			xaxistitle
				.append("text")
					.attr("transform", "translate(" + 0 + "," + 0 + ")")
					.attr("x", width)
					.attr("y", height+15)
					.attr('font-size', axisfontsize)
					.text(xaxistitlestr[0])
					;
			if ( xaxistitlestr.length >= 2){
				xaxistitle
					.append("text")
						.attr("transform", "translate(" + 0 + "," + 0 + ")")
						.attr("x", width)
						.attr("y", height+30)
						.attr('font-size', axisfontsize)
						.text(xaxistitlestr[1])
			}
			
			let yaxistitle = g.append("g")
				.attr("class","y-axis-title")
				.attr("text-anchor","start");
			yaxistitle
				.append("text")
					.attr("transform", "translate(" + 0 + "," + 0 + ")")
					.attr("x", -margin.left+5)
					.attr("y", -margin.top+12)
					.attr('font-size', axisfontsize)
					.text(yaxistitlestr);
						
			if ( outlierCountData.length)
			{
				// Initialize the legends	  
				let legend = g.append("g")
								.attr("class","legendtextfgcolor")
								.attr("text-anchor", "start")
								.selectAll("g")
									.data(outlierKeys.slice())
									.enter().append("g")
									.attr("transform", function(d, i) { return "translate("+ (width-90)+"," + (height+margin.top+margin.bottom-40) + ")"; })
									.on("mouseover", mouseOverLegendHandler)
									.on("mousemove", mouseMoveLegendHandler)
									.on("mouseout", mouseOutLegendHandler);

				var legendItemSize = 12;
				var legendSpacing = 10;
				legend.append("rect")
						  .attr("x", 0)
						  .attr("y", 0)
						  .attr("width", legendItemSize)
						  .attr("height", legendItemSize)
						  .attr("fill", ["#BA55D3"]);
				legend.append("text")
						  .attr("x", legendItemSize+legendSpacing)
						  .attr("y", legendItemSize/2)
						  .attr("dy", "0.32em")
						  .attr('font-size', axisfontsize)
						  .text(function(d) { return d; });
			}
		}
	}

	update(summaryData, animate = true) {
		d3.select(this.element).selectAll('svg').remove();
		this.data = summaryData;
		if(mode === "AUDIT")
			this.xaxistitlestr[0] = getTranslatedString("rulescategory");
		else
		{
			if ( this === mainStackedBar){
				this.xaxistitlestr[0] = getTranslatedString("analyzeddevicestxt");
			} else if ( this === altStackedBar) {
				this.xaxistitlestr[0] = getTranslatedString("devicesskipped");
			}
		}
		this.init(animate);
	}
} 

function drawStackedBar(barData, barId, stackKeys, toolTipHelpers, legendHelpers, colorRange, Angle, xKey, yKey, xTitle, yTitle, getSelectedCategory, c_id)
{
	var margintop = 20, marginbottom = 50, marginright = 20, marginleft = 55;
	
	var childeElem = document.getElementById(barId.slice(1)).children;
	var emptyStackedBarElem = document.getElementById(childeElem[0].id);
	
	var parentElem = document.getElementById(barId.slice(1));
	var parentId = parentElem.parentNode;
	
	if(barData.barCount.length == 0)
		emptyStackedBarElem.style.display = "block";
	else 
		emptyStackedBarElem.style.display = "none";
	
	var obj = new SummaryStackedBar({
		element:barId,
		parentcontainerid:parentId,
		margin:{top:margintop, right:marginright, bottom:marginbottom, left:marginleft},
		data:barData,
		maxy:function getMaxY(barData, yKey){
			return d3.max(barData, function(d){return d[yKey];});
		},
		colorrange:colorRange,
		xkey:xKey,
		ykey:yKey,
		xaxistitlestr:xTitle,
		yaxistitlestr:yTitle,
		stackkeys:stackKeys,
		tooltiphelpers:toolTipHelpers,
		legendtooltiphelpers:legendHelpers,
		getselectedcategory:getSelectedCategory,
		angle:Angle,
		contId:c_id
	});
	return obj;
}
