/**
 * @author ciskavriezenga
 */

var apiKey = "";
var fileKey = "";
var collectionKey = ""; 

var loadSettings = function(){ 
	$.ajax({
		async: false,
		url: 'settings_local.json',
		dataType: 'json',
		data: {},
		success: createVariables
	});
}


var createVariables = function(settings){
	apiKey = settings.apiKey;
	fileKey = settings.fileKey;
	collectionKey = settings.collectionKey;
}