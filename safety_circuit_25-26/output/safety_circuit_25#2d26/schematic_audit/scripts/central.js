(hostEmulator = function (fun, params) {
    "use strict";
    if (typeof hostEmulator.functionTable == 'undefined') {
        hostEmulator.functionTable = [];
        hostEmulator.functionTable["cps::getTheme"] = function (args) {
            return "dark";
        }
		hostEmulator.functionTable["cps::getAppLanguageCode"] = function (args) {
            return "en";
        }
		hostEmulator.functionTable["sdaReliability::getUsername"] = function (args) {
            return "Default";
        }
		hostEmulator.functionTable["sdaReliability::getLicenseType"] = function (args) {
            return "BASIC";
        }
		hostEmulator.functionTable["cps::getDirectiveValue MTBF PCB_TARGET_LIFE"] = function (args) {
            return 20;
        }
		hostEmulator.functionTable["cps::getDirectiveValue THERMAL LAST_LAYOUT_FILE_PATH"] = function (args) {
            return "";
        }
		hostEmulator.functionTable["cps::getDirectiveValue MTBF USE_STRESS_RESULT"] = function (args) {
            return false;
        }
		hostEmulator.functionTable["sdaReliability::getMTBFEnvironment"] = function (args) {
            return "Ground, Benign";
        }
		hostEmulator.functionTable["cps::getDirectiveValue MTBF MTBF_STANDARD"] = function (args) {
            return "MIL-HDBK-217F";
        }
		hostEmulator.functionTable["cps::isDesignReadOnly"] = function (args) {
            return false;
		}
		hostEmulator.functionTable["sdaReliability::designReadOnlyReason"] = function (args) {
            return "";
        }																 	 
    }

    var ret = "";
    if (fun != null) {
        var f = hostEmulator.functionTable[fun];
        if (f != undefined) {
            ret = f(params);
        }
    }
    return ret;
})(null, null);


function isHosted() {
    return window.hasOwnProperty("cdsCPHBridge");
}

function isOnline() {
    return false;
}

function callTcl(procName, args, f) {
	
	var ret = null;
	
    if (isHosted()) {
		if( f != null || f != undefined) {
			window.cdsCPHBridge.orPrmConnector("executeTclNoDisplay", procName + " " + args , f);
		} else {
			window.cdsCPHBridge.orPrmConnector("executeTclNoDisplay", procName + " " + args);
		}
	}		
	else {
		ret = hostEmulator(procName, args);
    }
    return ret;
}

function returnHandler(continuation, value) {
	continuation.call(value);
}


function insertCSS(href) {
    var link = document.createElement("link");
    link.href = href;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
}

function getAppTheme(f) {
    var hostFunction = "cps::getTheme";
    var params = "";
    callTcl(hostFunction, params, f);
}

function getAppLocale(f) {
    var hostFunction = "cps::getAppLanguageCode";
    var params = "";
    callTcl(hostFunction, params, f);
}

function getAppLocaleFont(f) {
    var hostFunction = "cps::getAppLanguageFont";
    var params = "";
    callTcl(hostFunction, params, f);
}

function getTargetLife(f) {
	var hostFunction = "cps::getDirectiveValue MTBF PCB_TARGET_LIFE";
	var params = "";
	callTcl(hostFunction, params, f);
}

function getAppLicense(f) {
	var hostFunction = "sdaReliability::getLicenseType";
	var params = "";
	callTcl(hostFunction, params, f);
}

function getUsername(f) {
	var hostFunction = "sdaReliability::getUsername";
	var params = "";
	callTcl(hostFunction, params, f);
}

function getAuditDirective(f){
	var hostFunction = "sdaReliability::getDisallowWaiveDirectiveValue";
	var params = "1";
	callTcl(hostFunction, params, f);
}

function getBoardFile(f) {
	var hostFunction = "cps::getDirectiveValue THERMAL LAST_LAYOUT_FILE_PATH";
	var params = "";
	callTcl(hostFunction, params, f);
}
function getDesignReadOnlyReason(f) {
    var hostFunction = "sdaReliability::designReadOnlyReason";
    var params = "";
    callTcl(hostFunction, params, f);
}
function getDesignReadOnlyStatus(f) {
    var hostFunction = "cps::isDesignReadOnly";
    var params = "";
    callTcl(hostFunction, params, f);
}									 
var theme = "dark";
function setupTheme() {
    getAppTheme(function(currentTheme) {
		if (currentTheme == "light") {
			theme = currentTheme;
			insertCSS("./css/dashboardstyle-light.css");
		}
	});
}

function setupLocale(locale, localeFont){
	getAppLocaleFont(function(currentLocaleFont) {
		localeFont = currentLocaleFont;
	});

	getAppLocale(function(currentLocale) {
		locale = currentLocale;
	});
}

var license = "BASIC";
function setupLicense() {
	getAppLicense(function(currentLicense) {
		setLicense(currentLicense);
	});
}

var username = "Default";
function setupUsername() {
	getUsername(function(currentUsername) {
		setUsername(currentUsername);
	});
}

var directiveValue = "";
function setupDirectiveValue() {
	getAuditDirective(function(currentDirectiveValue) {
		directiveValue = currentDirectiveValue;
		setDirective(currentDirectiveValue);
	});
}

var targetlife = 20;
function setupTargetLife() {
	getTargetLife(function(currentTargetLife) {
		var pcbLife = currentTargetLife;
		if ( pcbLife > 0 )
			targetlife = pcbLife;
	});
}

var brdFileName = "";
function setupBrdFile() {
	getBoardFile(function(currentBrdFile) {
		var brdFile = currentBrdFile;
			brdFileName = brdFile;
	});
}

function initUI() {
    setupTheme();
	setupTargetLife();
	setupBrdFile();
}

initUI();
