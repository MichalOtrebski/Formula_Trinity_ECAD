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

var mainDonut;
var altDonut;
var toggleableCategories = ["Waived", "Ignore","Unanalyzed"];

class SummaryDonut {

	constructor(config) {
		this.configure(config);
		this.init();
	}

	configure(config) {
		Object.assign(this, config);
	}

	init(animate = true) {
		const { margin, legend, arcmult, cornerradius, data, keytitle, keyinternal, showpolyline, legendheadings, tooltip, colorrange, iscentertextshown, centertextsuffix, viewId, contId } = this;
		var viewportwidth = d3.select(viewId).node().clientWidth;
		var viewportheight = d3.select(viewId).node().clientHeight - 40;

		var legendheightcomputed = Object.keys(data).length * 35;

		var legendonright = true;
		var tablevcelem = document.getElementById('tablevisibilitycontrol');
		if (tablevcelem && !tablevcelem.classList.contains('showtable')) {
			legendonright = false;
		}

		var width = viewportwidth - margin.left - margin.right;
		var height = viewportheight - margin.top - margin.bottom;

		if (legendonright) { width -= legend.legendwidth; }
		if (!legendonright) { height -= legend.legendheight; }

		const radius = Math.min(width, height) / 2;
		const elementid = this.element;

		var fontsize = "12px";
		if (radius < 50)
			fontsize = "10px";
		else if (radius < 60)
			fontsize = "11px";

		// Get the category domain
		var categorydomain = Object.keys(data);
		// Create colors over the category domain and color range.
		let color = d3.scaleOrdinal()
			.domain(categorydomain)
			.range(colorrange);
		// Create the donut arc
		let arc = d3.arc()
			.innerRadius(radius * arcmult.inner)
			.outerRadius(radius * arcmult.outer)
			.cornerRadius(cornerradius);
		// Compute percentages of slices to be used in tooltips and lables
		var totalCount = 0;
		for (var key in data) { totalCount += data[key]; }

		var percentages = [];
		for (var key in data) { var perc = (data[key] / totalCount) * 100; perc.toFixed(); percentages.push(perc); }

		// Filter container for slices selected via categories
		var categories_selected = [];


		// Create path animation helper for mouse hover and click	
		let pathAnim = function (path, dir) {
			switch (dir) {
				case 0:
					path.transition()
						.duration(500)
						.attr('d', d3.arc()
							.innerRadius(radius * arcmult.inner)
							.outerRadius(radius * arcmult.outer)
							.cornerRadius(cornerradius)
						)
						.attr("stroke-width", 1);
					break;
				case 1:
					path.transition()
						.attr('d', d3.arc()
							.innerRadius(radius * arcmult.inner)
							.outerRadius(radius * arcmult.outerexp)
							.cornerRadius(cornerradius)
						)
						.attr("stroke-width", 1);
					break;
			}
		};

		// Create handlers for various events on the slices	and labels			
		let mouseOverHandler = function (d, i) {
			pathAnim(d3.select(this), 1);
			let donuttooltip = d3.select(elementid + " div.donuttooltip");
			let tooltiptitle;
			let tooltipcount;
			let tooltipperc;
			tooltipcount = d.data.value;
			let perc = 100 * (d.data.value / totalCount);
			perc = perc.toFixed();
			tooltipperc = perc + "%";
			var key = d.data.key;
			var donutTooltipTitlekey = key.toLowerCase() + "donuttooltiptitle";
			tooltiptitle = "<b>" + getTranslatedString(donutTooltipTitlekey) + "</b>";
			donuttooltip.select(".title").html(tooltiptitle);
			donuttooltip.select(".count").html(tooltipcount);
			donuttooltip.select(".percentage").html(tooltipperc);
			donuttooltip
				.style('display', 'inline-block')
				.style('position', 'absolute')
				.style('left', d3.event.pageX + 10 + "px")
				.style('top', d3.event.pageY + 10 + "px")
		};
		let mouseMoveHandler = function (d, i) {
			let donuttooltip = d3.select(elementid + " div.donuttooltip");
			let tooltiptitle;
			let tooltipcount;
			let tooltipperc;
			tooltipcount = d.data.value;
			let perc = 100 * (d.data.value / totalCount);
			perc = perc.toFixed();
			tooltipperc = perc + "%";
			var key = d.data.key;
			var donutTooltipTitlekey = key.toLowerCase() + "donuttooltiptitle";
			tooltiptitle = "<b>" + getTranslatedString(donutTooltipTitlekey) + "</b>";
			donuttooltip.select(".title").html(tooltiptitle);
			donuttooltip.select(".count").html(tooltipcount);
			donuttooltip.select(".percentage").html(tooltipperc);
			donuttooltip
				.style('left', d3.event.pageX + 10 + "px")
				.style('top', d3.event.pageY + 10 + "px")
		};

		var mouseOutHandler = function (d, i) {
			var thisPath = d3.select(this);
			if (!thisPath.classed('clicked')) {
				pathAnim(thisPath, 0);
			}
			let donuttooltip = d3.select(elementid + " div.donuttooltip");
			donuttooltip.style('display', 'none');
		};

		var mouseClickHandler = function (d) {
			resetBarSelections();
			disableBarFilterResetButton();

			var thisPath = d3.select(this);
			var clicked = thisPath.classed('clicked');
			pathAnim(thisPath, ~~(!clicked));
			thisPath.classed('clicked', !clicked);
			var category = d.data.key;
			if (toggleableCategories.indexOf(category) !== -1) {
				toggleChartsView();
				if (altDonut) { refreshAltSummaryDonut(false); }

			}
			else {
				if (!clicked)
					categories_selected.push(category);
				else {
					categories_selected = categories_selected.filter(function (ele) { return ele != category; });
				}

				var appElement = document.querySelector(contId);
				var angElement = angular.element(appElement);
				if (angElement && angElement.scope()) {
					var appScope = angElement.scope();
					appScope.doughnutSelection = categories_selected;
					appScope.refreshTable();
				}


				if (categories_selected.length == 0) {
					disableDonutFilterResetButton();
				} else {
					enableDonutFilterResetButton();
				}

				if (mainStackedBar) { refreshMainStackedBar(false); }
				if (altStackedBar) { refreshAltStackedBar(false); }
			}
		};

		var labelClickHandler = function (d) {
			if (d.data.value != 0) {
				resetBarSelections();
				disableBarFilterResetButton();

				var thisPath = d3.select('path.' + d.data.key);
				var clicked = thisPath.classed('clicked');
				pathAnim(thisPath, ~~(!clicked));
				thisPath.classed('clicked', !clicked);
				var category = d.data.key;
				if (category === "Waived") {
					toggleChartsView();
				}
				else {
					if (!clicked)
						categories_selected.push(category);
					else {
						categories_selected = categories_selected.filter(function (ele) { return ele != category; });
					}
				}

				var appElement = document.querySelector(contId);
				var angElement = angular.element(appElement);
				if (angElement && angElement.scope()) {
					var appScope = angElement.scope();
					appScope.doughnutSelection = categories_selected;
					appScope.refreshTable();
				}

				if (categories_selected.length == 0) {
					disableDonutFilterResetButton();
				} else {
					enableDonutFilterResetButton();
				}

				if (mainStackedBar) { refreshMainStackedBar(false); }
				if (altStackedBar) { refreshAltStackedBar(false); }
			}

		};

		var legendClickHandler = function (d) {
			labelClickHandler(d);
		}

		var legendMouseOver = function (d) {
			d3.select(this).style("cursor", "pointer");
			var category = keytitle[d.data.key];
			
			let tooltip; var showtooltip = true;
			switch (category) {
				case "Beyond Minimum Temp": {
					tooltip = getTranslatedString('beyondminimumtemplegendtooltip');
					break;
				}
				case "Low": {
					tooltip = getTranslatedString('lowlegendtooltip');
					break;
				}
				case "Moderate": {
					tooltip = getTranslatedString('moderatelegendtooltip');
					break;
				}
				case "High": {
					tooltip = getTranslatedString('highlegendtooltip');
					break;
				}
				case "Over": {
					tooltip = getTranslatedString('overlegendtooltip');
					break;
				}
				default: showtooltip = false;
			}
			if (showtooltip) {
				let legendtooltip = d3.select(elementid + " div.legendtooltip");
		
				legendtooltip.select(".text").html(tooltip);
				
				legendtooltip
					.style('left', d3.event.pageX + 10 + "px")
					.style('top', d3.event.pageY + 10 + "px")
					.style('display', 'inline-block')
					.style('position', 'absolute');
				
			}
			else {
				let legendtooltip = d3.select(elementid + " div.legendtooltip");
				legendtooltip.style('display', 'none');
			}
		}
		var arcTweenFn = function arcTween(d) {
			var i = d3.interpolate(d.startAngle, d.endAngle);
			return function (t) {
				d.endAngle = i(t);
				return arc(d);
			};
		}

		// Create the svg placeholder for the chart			
		let svg = d3.select(this.element)
			.append("svg")
			.attr("viewBox", "0 0 " + viewportwidth + " " + viewportheight)
			.attr("preserveAspectRatio", "xMidYMid meet")

			;
		// Create the g placeholder for the chart and tranform to the chart's center.
		let overallxoffset = 0;
		let overallyoffset = 0;
		if (!legendonright) { overallxoffset = width / 2 - radius; }
		if (legendonright) { overallyoffset = height / 2 - radius; }
		let g = svg
			.append("g")
			.attr("transform", "translate(" + (margin.left + radius + overallxoffset) + "," + (margin.top + radius + overallyoffset) + ")");

		// Draw the chart only if there is something to show				
		if (totalCount) {

			// Get the pie data and use this instead of directly using the data
			// Various modifications to the data can be made here, to get better interactivity from charts
			let pie = d3.pie().value(function (d) {
				if ((d.value != 0) && (d.value / totalCount) < 0.02) {
					return totalCount * 0.02;
				} else {
					return d.value;
				}
			}).sort(null);
			let data_ready = pie(d3.entries(data));


			// Create tooltip placeholder		
			let donuttooltip = d3.select(this.element)
				.append('div')
				.attr('class', 'donuttooltip')
				.style('display', 'none');

			var titlerow = donuttooltip.append("div").attr("class", "title");
			var countrow = donuttooltip.append("div").attr("class", "countrow");
			countrow.append("div").attr("class", "counttext").text(getTranslatedString("counttext"));
			countrow.append("div").attr("class", "count");
			var percrow = donuttooltip.append("div").attr("class", "percentagerow");
			percrow.append("div").attr("class", "percentagetext").text(getTranslatedString("percentagetext"));
			percrow.append("div").attr("class", "percentage");
			var strokecolor = "#393939";
			if (theme == "light") { strokecolor = "#ffffff"; }

			// Create donut slices and set mouse event handlers
			var paths = g.selectAll('allSlices')
				.data(data_ready)
				.enter()
				.append('path')
				.on("mouseover", mouseOverHandler)
				.on("mouseout", mouseOutHandler)
				.on("mousemove", mouseMoveHandler)
				.on("click", mouseClickHandler)
				.style('fill', function (d, i) { return color(d.data.key); })
				.attr("class", function (d) { return d.data.key; })
				.attr("id", function (d) { return d.data.key; })
				.attr("stroke", strokecolor)
				.attr("stroke-width", 2)
				.attr("opacity", 1)
				.attr('d', arc)
				.exit()
				.remove()
				;

			var animationDuration = 1000;
			document.getElementById(elementid.slice(1)).classList.add("nopointerevent");

			if (animate) {
				var animatepaths = g.selectAll('path').data(data_ready);
				animatepaths.transition().duration(animationDuration).attrTween('d', arcTweenFn);
			}

			setTimeout(function () {
				document.getElementById(elementid.slice(1)).classList.remove("nopointerevent");
			}, animationDuration + 20);


			if (showpolyline) {

				// Create polylines
				g.selectAll('allPolylines')
					.data(data_ready)
					.enter()
					.append('polyline')
					.attr("stroke", "gray")
					.style("fill", "none")
					.attr("stroke-width", 1)
					.attr('points', function (d) {
						var posA = arc.centroid(d) // line insertion in the slice
						var outerarcmultiplier = polylinemult[d.data.key];
						var outerArc = d3.arc()
							.innerRadius(radius * outerarcmultiplier)
							.outerRadius(radius * outerarcmultiplier)
							.cornerRadius(cornerradius)
						var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
						var posC = outerArc.centroid(d); // Label position = almost the same as posB
						var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
						posC[0] = radius * outerarcmultiplier * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
						return [posA, posB, posC]
					})

				// Create clickable labels
				g.selectAll('allLabels')
					.data(data_ready)
					.enter()
					.append('text')
					.text(function (d) {
						var perc = (d.data.value / totalCount) * 100;
						perc = perc.toFixed(2);
						return perc + "%";
					})
					.attr('transform', function (d) {
						var outerarcmultiplier = polylinemult[d.data.key];
						var outerArc = d3.arc()
							.innerRadius(radius * outerarcmultiplier)
							.outerRadius(radius * outerarcmultiplier)
							.cornerRadius(cornerradius)
						var pos = outerArc.centroid(d);
						var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
						pos[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
						pos[1] -= 5;
						return 'translate(' + pos + ')';
					})
					.on('click', labelClickHandler)
					.on("mouseover", function (d) { d3.select(this).style("cursor", "pointer"); })
					.on("mouseout", function (d) { d3.select(this).style("cursor", "default"); })
					.style('text-anchor', function (d) {
						var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
						return (midangle < Math.PI ? 'end' : 'start')
					})
					.attr('class', 'labeltextfgcolor')
					.style('font-size', '12px')
					.style('text-decoration', 'underline')
			}

			// Create legend
			let legendgroup = g.append('g')
				.attr('text-anchor', 'start')
				.attr('class', 'legend-group')
				;
			var legendyoffset = 2;
			var legendfontsize = fontsize;
			var col1width = 140;
			var col2width = 100;

			var legendx = margin.left + 1.05 * radius;
			var legendy = -legend.legendheight / 2;
			if (!legendonright) {
				legendx = -legend.legendwidth / 2 + 0.1 * radius;
				legendy = 1.05 * radius - 25;
			}

			let legendtooltip = d3.select(this.element)
				.append('div')
				.attr('class', 'legendtooltip')
				.style('display', 'none');
			var textrow = legendtooltip.append("div").attr("class", "textrow");
			textrow.append("div").attr("class", "text");

			legendgroup
				.append('text')
				.attr('x', legendx)
				.attr('y', legendy + legend.size + legend.spacing)
				.attr('font-size', legendfontsize)
				.attr('font-weight', 'bold')
				.attr('class', 'legendtextfgcolor')
				.text(legendheadings[0])
			legendgroup
				.append('text')
				.attr('x', legendx + col1width)
				.attr('y', legendy + legend.size + legend.spacing)
				.attr('font-size', legendfontsize)
				.attr('font-weight', 'bold')
				.attr('class', 'legendtextfgcolor')
				.text(legendheadings[1])
			legendgroup
				.append('text')
				.attr('x', legendx + col1width + col2width)
				.attr('y', legendy + legend.size + legend.spacing)
				.attr('font-size', legendfontsize)
				.attr('font-weight', 'bold')
				.attr('class', 'legendtextfgcolor')
				.text(legendheadings[2])
			var legendtablebody = legendgroup.selectAll('g')
				.data(data_ready)
				.enter()
				.append('g')
				.attr('transform', (d, i) => `translate(${legendx},${25 - margin.top + legendy + i * (legend.size + legend.spacing)})`)
				.on('click', legendClickHandler)
				.on("mouseover", function (d) {
					if (mode == "STRESS") {
						legendMouseOver(d);
					} else {
						d3.select(this).style("cursor", "pointer");
                    }
				})
				.on("mouseout", function (d) {
					if (mode == "STRESS") {
						let legendtooltip = d3.select(elementid + " div.legendtooltip");
						legendtooltip.style('display', 'none');
					}
					else
						d3.select(this).style("cursor", "default");
				})
				;
			legendtablebody
				.append('rect')
				.attr('width', legend.size)
				.attr('height', legend.size)
				.attr('x', 0)
				.attr('y', legend.spacing)
				.style('fill', function (d) { return (color(d.data.key)); })
			legendtablebody
				.append('text')
				.attr('x', legend.size + legend.spacing)
				.attr('y', legend.size + legend.spacing - legendyoffset)
				.attr('font-size', legendfontsize)
				.attr('class', 'legendtextfgcolor')
				.text(function (d) { return getTranslatedString(keytitle[d.data.key]); })

			legendtablebody
				.append('text')
				.style("text-anchor", "end")
				.attr('x', col1width + 35)
				.attr('y', legend.size + legend.spacing - legendyoffset)
				.attr('font-size', legendfontsize)
				.attr('class', 'legendtextfgcolor')
				.text(function (d) { return d.data.value; })
			legendtablebody
				.append('text')
				.style("text-anchor", "end")
				.attr('x', col1width + col2width + 40)
				.attr('y', legend.size + legend.spacing - legendyoffset)
				.attr('font-size', legendfontsize)
				.attr('class', 'legendtextfgcolor')
				.text(function (d) { var perc = (d.data.value / totalCount) * 100; perc = perc.toFixed(); return perc + "%"; })

			// Add text in the center of the donut
			if (iscentertextshown) {
				var centertextfontsize = '18px';
				var centertextsuffixsize = '12px';
				if (radius > 80 && radius < 95) { centertextfontsize = '16px'; centertextsuffixsize = '9px'; }
				else if (radius < 80) { centertextfontsize = '14px'; centertextsuffixsize = '6px'; }

				g.append("text")
					.attr('text-anchor', 'middle')
					.attr("dy", -0.02 * radius)
					.attr('class', 'centertextfgcolor')
					.style('font-weight', 'bold')
					.style('font-size', centertextfontsize)
					.text(totalCount);
				g.append("text")
					.attr("text-anchor", "middle")
					.attr("dy", 15 - 0.02 * radius)
					.attr('class', 'centertextfgcolor')
					.style('font-weight', 'bold')
					.style('font-size', centertextsuffixsize)
					.text(centertextsuffix)
					;
			}

		}
	}

	update(summaryData, animate = true) {
		this.data = summaryData;
		d3.select(this.element).selectAll('svg').remove();
		if (this === mainDonut) {
			this.centertextsuffix = getTranslatedString("analyzeddevicestxt");

			this.legendheadings[0] = getTranslatedString("maindonutregion");
			this.legendheadings[1] = getTranslatedString("count");
			this.legendheadings[2] = getTranslatedString("pct");
		} else if (this === altDonut) {
			this.centertextsuffix = getTranslatedString("devicesskipped");

			this.legendheadings[0] = getTranslatedString("reason");
			this.legendheadings[1] = getTranslatedString("count");
			this.legendheadings[2] = getTranslatedString("pct");
		}
		var tooltipcountext = document.getElementsByClassName("counttext");
		if (tooltipcountext) {
			var i = 0;
			while (i < tooltipcountext.length) {
				tooltipcountext[i].innerHTML = getTranslatedString("counttext");
				i++;
			}
		}

		var percenttext = document.getElementsByClassName("percentagetext");
		if (percenttext) {
			var i = 0;
			while (i < percenttext.length) {
				percenttext[i].innerHTML = getTranslatedString("percentagetext");
				i++;
			}
		}
		this.init(animate);
	}
}

function drawSummaryDonut(donutData, donutId, keyTitle, legendHeadings, toolTip, colorRange, centerTextSuffix, c_id, keyInternal = {}) {
	var child = document.getElementById(donutId.slice(1)).children;
	var emptyDonutElem = document.getElementById(child[0].id);

	var parentElem = document.getElementById(donutId.slice(1));
	var parentId = parentElem.parentNode;

	var totalCount = 0;
	for (var key in donutData) { totalCount += donutData[key]; }
	if (totalCount == 0)
		emptyDonutElem.style.display = "block";
	else
		emptyDonutElem.style.display = "none";
	var legendheightcomputed = Object.keys(donutData).length * 35;
	var obj = new SummaryDonut({
		element: donutId,
		margin: { top: 0, right: 0, bottom: 0, left: 0 },
		legend: { size: 12, spacing: 10, legendwidth: 320, legendheight: legendheightcomputed },
		arcmult: { inner: 0.55, outer: 0.75, outerexp: 0.85 },
		cornerradius: 5,
		data: donutData,
		keytitle: keyTitle,
		keyinternal: keyInternal,
		showpolyline: false,
		legendheadings: legendHeadings,
		tooltip: toolTip,
		colorrange: colorRange,
		iscentertextshown: true,
		centertextsuffix: centerTextSuffix,
		viewId: parentId,
		contId: c_id,
	});
	return obj;
}



