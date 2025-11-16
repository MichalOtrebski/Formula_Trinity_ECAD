//ELECTRICAL STRESS
function viewEstimatedPeakValue() {
	var toggleBtn = document.getElementById("estimatePeakValueBtn");
	toggleBtn.click();
	var okBtn = document.getElementById("closeEstimatedPeakValueOkBtn");
	okBtn.click();
}

//THERMAL ANALYSIS
function changeThermalSlider(newtemp) {
	slevel = newtemp;
	drawRangeSlider();
	refreshAll();
}
function viewEstimatedJunctionTemperature(){
	var toggleBtn=document.getElementById("estimateJunctionTemperatureBtn");
	toggleBtn.click();
}
function dumpUIAsXML(elem) {
	var xml = '';
	if (elem.style.display !== "none") {
		if (elem.tagName.toLowerCase() === "button") {
			xml += elem.outerHTML + "\n";
		}
		else if (elem.childElementCount == 0) {
			xml += elem.outerHTML + "\n";
		}
		else {
			for (var i = 0; i < elem.children.length; i++) {
				xml += dumpUIAsXML(elem.children[i]);
			}
		}
	}
	return xml;
}
function dumpUI(address) {
	var xml = dumpUIAsXML(document.body);
	var hostFunction = "sdaReliability::dumpXML";
	var params = " \{" + address + "\} \{" + xml + "\}";
	callTcl(hostFunction, params, null);
}