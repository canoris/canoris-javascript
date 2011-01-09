/**
 * @author ciskavriezenga
 * @fileoverview <br>The canorisLib library is a javascript library for Canoris.</br> 
 */

/**
 * @class CAN is the namespace of the canoris javascript library 
 */
var CAN = new function()
{
	this._LOGADDRESS = 'post.php';
	
	this._URI_FILES = '/files';
	this._URI_FILE = '/files/<file_key>';
	this._URI_FILE_SERVE = '/files/<file_key>/serve';
	this._URI_FILE_ANALYSIS = '/files/<file_key>/analysis/<filter>';
	this._URI_FILE_CONVERSIONS = '/files/<file_key>/conversions';
	this._URI_FILE_CONVERSION = '/files/<file_key>/conversions/<conversion>';
	this._URI_FILE_VISUALIZATIONS = '/files/<file_key>/visualizations';
	this._URI_FILE_VISUALIZATION = '/files/<file_key>/visualizations/<visualization>';
	this._URI_COLLECTIONS = '/collections';
	this._URI_COLLECTION = '/collections/<coll_key>';
	this._URI_COLLECTION_FILES = '/collections/<coll_key>/files';
	this._URI_COLLECTION_FILE = '/collections/<coll_key>/files/<file_key>';
	this._URI_COLLECTION_SIMILAR = '/collections/<coll_key>/similar/<file_key>/<preset>/<results>';
	this._URI_TEMPLATES = '/processing/templates';
	this._URI_TEMPLATE = '/processing/templates/<tpl_name>';
	this._URI_TASKS = '/processing/tasks';
	this._URI_TASK = '/processing/tasks/<task_id>';
	this._URI_PHONEMES = '/language/text2phonemes';
	
 	/**
 	 * Method to create uri for request. 
 	 * @param {string} uri Contains the standerd string for request. 
 	 * @param {array} args Contains the arguments that needs to be placed in standard string.
 	 * @returns {string} uri Contains the total uri for the request.
 	 */
	this._uri = function(uri, args){
		for (a in args) {
			uri = uri.replace(/<[\w_]+>/, args[a]);
		};
		uri = CAN.CanorisData.getBaseUri() + uri;
		return uri;
	};
	
	/**
	 * Method to split reference uri in uri and paramters
	 * @param {string} uri Contains the uri to split in uri and parameters 
	 */
	this._splitUri = function(uri)
	{
		//test uri for ? -> contains parameters
		if(/\?/.test(uri)){
			//split up uri
			var splittedUri = uri.split(/\?/);
			//save baseUri
			var baseUri = splittedUri[0];
			//save parameters
			var parameters = splittedUri[1];
			//test params for & -> contains more then one parameter
			if(/\&/.test(parameters)){	
				//split parameters
				var params =  parameters.split(/\&/); 
			}
			//else safe single parameter in array to be able to create parameter object
			else{var params = [parameters]; };
			//create object to place parameters in
			var parametersObject = {}; 
			//split up parameters strings and place in object
			for( a in params)
			{	
				var param = params[a].split(/\=/);
				eval("parametersObject."+ param[0] + "=\"" + param[1] + "\"");
			}
			//return array with baseUri and paramtersObject
			return [baseUri, parametersObject];
		} else{
			return [uri, false];	
		}
	}
}

/*======================================================================*/
/*================================= Log ================================*/
/*======================================================================*/
	/**
	 * @class Log class contains the two loggers, one console logger and one server logger
	 * @constructor
	 */
	CAN.Log = function(){};
	
	//static  log variable to hold a console logger and a server logger
	CAN.Log.log = false;
	
	/**
	 * create the logger and appenders and set these to the passed levels
	 * @param {string} cLogLevel Contains the level for the console logger.
	 * @param {string} sLogLevel Contains the level for the server logger.
	 */
	CAN.Log.setLogger = function(cLogLevel, sLogLevel){
		CAN.Log.log = log4javascript.getLogger("logger");
		if(CAN.Log.checkLevel(cLogLevel)){
			var popUpAppender = new log4javascript.PopUpAppender();
			popUpAppender.setThreshold(eval("log4javascript.Level." + cLogLevel));
			CAN.Log.log.addAppender(popUpAppender);
		}
		if(CAN.Log.checkLevel(sLogLevel)){
			var ajaxAppender = new log4javascript.AjaxAppender(CAN._LOGADDRESS);
			ajaxAppender.setThreshold( eval("log4javascript.Level." + sLogLevel));
			CAN.Log.log.addAppender(ajaxAppender);
		}
	}
	
	/**
	 * check level method is used to check if the passed level is available
	 * @param {string} level
	 */
	CAN.Log.checkLevel = function(level){
		if( level == "ALL" 	|| level == "TRACE" || level == "DEBUG" || level == "INFO" || 
			level == "WARN" || level == "ERROR"	|| level == "FATAL"	|| level == "OFF")
		{	return level; }
		else {return false}
	}					
	
	/**
	 * Method to be able to show object in logger 
	 * @param {Object} obj Contains the object that needs to be shown in logger
	 * @param {level} level Contains the level, used for spaceing when object contains objects
	 */
	CAN.Log.showObject = function(obj, level){
		var str = '';
		if(!level){ var level = 0;};
	    var space = "\n";
		for(var i = 1 ; i <= level; i++){ space +="	";}  
		for(property in obj){
	    	//append property to string
	        str += space + property + " = " + obj[property];
			 // and we are inside the required number of levels
	        if((typeof(obj[property]) == 'object') && (obj[property] != null) && property != 'object')
	        { str += CAN.Log.showObject(obj[property], level + 1);} 
			else if((typeof(obj[property]) == 'object') && (obj[property] != null) && property == 'object')
			{ str += " --> Contains itself."}
			 
	    }
	    return str;
	}
	
	CAN.Log.setLogAddress = function(address){
		if(address){CAN._LOGADDRESS = address;}	
	}
/*======================================================================*/
/*============================= CanorisData ============================*/
/*======================================================================*/
/**
 * @class CanorisData class contains the API key that is necesarry for requests.
 * Without API key, RequestCreator request method won't run.
 * CanaorisData class contains the base uri of Canoris 
 * Static variables and methods.
 * @constructor
 */
CAN.CanorisData = function(){};
CAN.CanorisData.apiKey = false;
CAN.CanorisData.baseUri = 'http://api.canoris.com';

/**
 * Set Api key method, checks if handed api_key exists and saves this to CanorisData.api_key
 * @static
 * @param {string} a_key Contains the api key that is going to be used.
 */
CAN.CanorisData.setApiKey = function(aKey){
	CAN.Log.log.debug("inside setApiKey function, passed key = " + aKey);
	CAN.CanorisData.apiKey = aKey;	
};

/**
 * get api key method
 * @static
 * @returns {string} apiKey Contains the used api key.
 */
CAN.CanorisData.getApiKey = function(){
	if(CAN.CanorisData.apiKey){ return CAN.CanorisData.apiKey; }
	else {throw ("Api key is not loaded.")}; 
};

/**
 * Set base uri method, checks if handed base_uri exists and saves this to CanorisData.prototype.base_uri
 * @static
 * @param {string} bUri Contains the base uri that is going to be used.
 */
CAN.CanorisData.setBaseUri = function(bUri){
	CAN.CanorisData.baseUri = bUri;
};

/**
 * get base uri method
 * @static
 * @returns {string} baseUri Contains the base uri that is used.
 */
CAN.CanorisData.getBaseUri = function(){
	return CAN.CanorisData.baseUri;
};


/*======================================================================*/
/*=========================== RequestCreator ===========================*/
/*======================================================================*/
/**
 * @class RequestCreator is a class with a static method to create a ajax jsonp request
 * @constructor 
 */
CAN.RequestCreator = function(canObject){
};

//timeout variable, is used for jsonp requests, when request didn't succeeded in timeout time -> request Error
CAN.RequestCreator.timeout = 45000;
//boolean to set use of json or jsonp
CAN.RequestCreator.useJson = false;

/**
 * Set timeout method.
 * @static
 * @param {number} tOut Used for jsonp requests timeout time.
 */
CAN.RequestCreator.setTimeout = function(tOut){
	if(!isNaN(tOut)){ CAN.RequestCreator.timeout = tOut; };
}

/**
 * Set use of useJson to true or false
 * @static
 * @param {boolean} json
*/
CAN.RequestCreator.setUseJson = function(json){
	if(json == true){
		CAN.Log.log.debug("inside RequestCreator setUseJson, use of json is turned on."); 
		CAN.RequestCreator.useJson = true;
	};
}

/**
 * Standard error function, used whith json request when no error callback method is passed.
 * @static
 * @param {object} XMLHttpRequest
 * @param {string} textStatus Describes the type of error that occurred.
 * @param {object} errorThrown Optional exception object.
 */
CAN.RequestCreator.standardErrorMethod = function(XMLHttpRequest, textStatus, errorThrown){	
	CAN.Log.log.error( "Request failed, request = \n" + CAN.Log.showObject(XMLHttpRequest) + 
						"\nerror of Request =  " + textStatus +	"\nthrown error =  " + errorThrown); 
	CAN.Log.log.error( "Request failed, request = \n" + CAN.Log.showObject(XMLHttpRequest) + 
						"\nerror of Request =  " + textStatus + "\nthrown error =  " + errorThrown); 
	throw new Error("RequestCreator error " + textStatus);
};

/**
 * Create a request to server. 
 * @static
 * @param {string} uri Holds the uri for the request.
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 * @param {array} params Contains the parameters as String that need to be send with the request.
 */
CAN.RequestCreator.createGetReq = function(uri, succesCallback, errorCallback, params){	
	CAN.Log.log.debug(	"inside RequestCreator.createGetReq, passed args:" +
							"\n__uri: " + uri + 
							"\n__succesCallback is: " + succesCallback + 
							"\n__errorCallback is: " + errorCallback + 
		 					"\n__parameters: " + CAN.Log.showObject(params));
	//get api key, needed to create a request	
	var aKey = CAN.CanorisData.getApiKey();
	//create parameter object, with api key and passed paramameters
	var dataParams = {api_key: aKey};
	//if params are passed, extend dataParams with params
	if (params) { $.extend(dataParams, params); };
	//check if errorCallback is a function, 
	//if not -> use standard error method, else combine standard errorCallback with passed errorcallback
	if(!$.isFunction(errorCallback)){	
		var errorCallback = CAN.RequestCreator.standardErrorMethod;
	} else {
		var errorCallback = function(XMLHttpRequest, textStatus, errorThrown){
			CAN.RequestCreator.standardErrorMethod(XMLHttpRequest, textStatus, errorThrown);
			errorCallback(XMLHttpRequest, textStatus, errorThrown);
		};
	}; 
	//check with wich type of json the request needs to be made
	if(CAN.RequestCreator.useJson){
		//send a json XMLHttpRequest 
		$.ajax({
			url: uri,
			dataType: 'json',
			data: dataParams,
			success: succesCallback,
			error: errorCallback,
			type: 'GET'
		});
		
	} else{
		//send a jsonp request
		$.jsonp({
			url: uri + "?callback=?",
			data: dataParams,
			timeout: CAN.RequestCreator.timeout,
			success: succesCallback,
			error: errorCallback
		});
	}
}	


/*======================================================================*/
/*============================ CanorisObject ===========================*/
/*======================================================================*/
/**
 * @class CanorisObject class is used to create a base object for File, Collection, Template, Task, etc.
 * @constructor 
 * @param {object} inProperties Contains the properties of the CanorisObject
 */
CAN.CanorisObject = function(inProperties){
	this.object = this;
	this.loaded = true;
	CAN.Log.log.debug("inside CanorisObject constructor, passed properties: " + CAN.Log.showObject(inProperties));
	//save properties in properties variable
	if (inProperties) { this.properties = inProperties;	}
	else {throw new Error("No properties passed to constructor of CanorisObject.")};
};

/**
 * Get item of CanorisObject
 * @param {string} item Contains the item name.
 * @returns {object/string} item 
 */
CAN.CanorisObject.prototype.getItem = function(item){
	//check if CanorisObject object properties are loaded
	if(this.loaded){
		var myString =  "this.properties." + item;
		//check if propertie asked for exists
		if (eval(myString)) {
			return eval(myString);
		}
		//propertie doesn't exist, throw error
		else{throw new SyntaxError( item + " does not exist in " + this)}
	}
	//properties aren't loaded, throw error
	else {throw new Error("Properties of " + this + " are not loaded.")};
}

/**
 * Get key of CanorisObject
 * @returns {string} key of CanorisObject
 */
CAN.CanorisObject.prototype.key = function(){
	return this.properties.key;
}

/**
 * Reload the CanorisObject.
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails (no XMLHttpRequest passed and specified error with use of jsonp).
 */
CAN.CanorisObject.prototype.update = function(succesCallback, errorCallback){
	if(this.properties.ref)
	{
		//split uri into uri and parameters object
		var uriAndParams = CAN._splitUri(this.properties.ref);
		//save this (file, collection, pager, that is calling the update method) inside var object	
		var object = this;
		//create clossure around object, with which properties can be set 
		var setProps = new function(props){
		return function(props){ object.properties = props;}
		}
		//call createGetReq method, use above setProps method in callback method to be able to save properties
		CAN.RequestCreator.createGetReq(uriAndParams[0], function(inProperties){
			setProps(inProperties);
			if($.isFunction(succesCallback)){succesCallback(inProperties); };
		}, errorCallback, uriAndParams[1]);	
		this.properties = false; 	
	}else{ throw new Error("properties of object does not exist, unable to update because no ref. is present");};
}


/*======================================================================*/
/*================================ Pager ===============================*/
/*======================================================================*/
/**
 * @class Pager class, is used to get a page of files or collections 
 * @constructor
 * @augments CAN.CanorisObject
 */
CAN.Pager = function(){this.object = this;}

/**
 * Creates a files Pager object, saves it with passed pager-save function
 * @static 
 * @param {function} savePage Is used to save the created Pager object.
 * @param {number} pageNr The nr of the page to letwhere the pager needs to point to. 
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails 
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 */
CAN.Pager.getFilesPager = function(savePager, pageNr, succesCallback, errorCallback){
 	CAN.Pager.createPager(CAN._uri(CAN._URI_FILES), savePager, pageNr, succesCallback, errorCallback);
}
 
/**
 * Creates a collections Pager object, saves it with passed pager-save function
 * @static
 * @param {function} savePage Is used to save the created Pager object
 * @param {number} pageNr The nr of the page where the pager needs to point to.  
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails 
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 */
CAN.Pager.getCollectionsPager = function(savePager, pageNr, succesCallback, errorCallback){
	CAN.Pager.createPager(CAN._uri(CAN._URI_COLLECTIONS), savePager, pageNr, succesCallback, errorCallback);
}
 
 /**
 * Creates a collection files Pager object, saves it with passed pager-save function
 * @static
 * @param {string} cKey Contains a collection key.
 * @param {Object} savePager Is used to save the created Pager object
 * @param {Number} pageNr The nr of the page where the pager needs to point to. 
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 */
CAN.Pager.getCollectionFilesPager = function(cKey, savePager, pageNr, succesCallback, errorCallback){
 	CAN.Pager.createPager(CAN._uri(CAN._URI_COLLECTION_FILES, [cKey]), savePager, pageNr, succesCallback, errorCallback);
}
 	 
/**
 * Creates a file or a collection Pager object, saves it with passed pager-save function.
 * @static
 * @param {string} uri Contains the uri for the request.
 * @param {Object} savePage Is used to save the created Pager object
 * @param {Number} pageNr The nr of the page to let the pager point to.  
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 */
CAN.Pager.createPager = function(uri, savePager, pageNr, succesCallback, errorCallback){
	CAN.Log.log.debug(	"inside Pager.createPager method" + "\n__uri = " + uri + 
						"\n__pageNr = " + pageNr + "\n__savePager = " + savePager);
	//check if pageNr is passed, if not set pageNr to 0
	if(pageNr < 0 || !pageNr) {	pageNr = 0};
	//create Request
	CAN.RequestCreator.createGetReq(uri, function(inProperties){
		//create a new Pager object and a new CanorisObject 
		var newPager = new CAN.Pager();
		var newCanorisObject = new CAN.CanorisObject(inProperties);
		//use jQuery.extend to let newPager inherited from newCanorisObjectl
		$.extend(newPager, newCanorisObject);	
		//save newFile, by using passed clossures 
		savePager(newPager);
		//run passed callback method	
		if($.isFunction(succesCallback)){succesCallback(newPager); };
	}, errorCallback, {page: pageNr});
 }
 
 /**
 * Function to set Pager to previous page.
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 */
CAN.Pager.prototype.previous = function(succesCallback, errorCallback){
 	//check if Pager has a previous page
 	if(this.properties.previous){	
		//call prevNext method to create request
		this.prevNext(this.properties.previous, succesCallback, errorCallback); 
	}
	else{ throw new SyntaxError("Pager does not contain previous page, not loaded or already at page 0.")};
}
 
/**
 * Function to set Pager to next page.
 * @param {function} callback Will be called when the request succeeds.
 */
CAN.Pager.prototype.next = function(succesCallback, errorCallback){
 	//check if Pager has a next page
	if(this.properties.next){	
		//call prevNext method to create request
	 	this.prevNext(this.properties.next, succesCallback, errorCallback); 
	}
	else{ throw new SyntaxError("Pager does not contain next page, not loaded or no more pages available.")};
}
 
/**
 * 
 * @param {string} uri Contains the uri for the request.
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {function} errorCallback Will be called when the request fails 
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 * @param {Object} params Contains the parameters.
 */
CAN.Pager.prototype.prevNext = function(uri, succesCallback, errorCallback){
	//split ref uri into uri and parameters object
	var uriAndParams = CAN._splitUri(uri);
	//save this in object var
	var object = this;
	//create clossure around object, with which properties can be set 
	var setProps = new function(props){
		return function(props){ object.properties = props;}
	}	
	//call createGetReq method, use above setProps method in callback method to be able to save properties	
	CAN.RequestCreator.createGetReq(uriAndParams[0], function(inProperties){
		setProps(inProperties);
		if($.isFunction(succesCallback)){succesCallback(inProperties); };
	}, errorCallback, uriAndParams[1]);	 	
	this.properties = false;
}
 
/**
 * Function to get total files of the collection which the pager points to. 
 * @returns {Number} total_files Contains the total files.
 */
CAN.Pager.prototype.getTotal = function(){
 	if(this.properties.total_collections){
		return this.properties.total_collections;	
	} else if(this.properties.total_files){
		return this.properties.total_files	
	} else{ 
		throw "Pager does not contain next page, not loaded or already at page 0.";
	}
}
 


/*======================================================================*/
/*================================ File ================================*/
/*======================================================================*/
/**
 * @class File class, is used to get a file. 
 * @constructor 
 * @augments CAN.CanorisObject
 */
CAN.File = function(){this.object = this;};

/**
 * Gets corresponding file properties and create a file object
 * saves it with passed file-save function
 * @static 
 * @param {string} fKey Contains a file key.
 * @param {function} saveFile Is used to save the created File object.
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {function} errorCallback Will be called when the request fails
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 */
CAN.File.getFile = function(fKey, saveFile, succesCallback, errorCallback){
	CAN.Log.log.debug("inside File.getFile method, passed key= " + fKey);
	//call createGetReq and pass it file uri, file key and callback function
	CAN.RequestCreator.createGetReq(CAN._uri(CAN._URI_FILE, [fKey]), function(inProperties)
	{
		//create a new File object and a new CanorisObject 
		var newFile = new CAN.File();
		var newCanorisObject = new CAN.CanorisObject(inProperties);
		//use jQuery.extend to let newFile inherited from newCanorisObjectl
		$.extend(newFile, newCanorisObject);	
		//save newFile, by using passed clossures 
		saveFile(newFile);		
		//call succesCallback method
		if($.isFunction(succesCallback)){succesCallback(newFile); };
	}, errorCallback);

}

/**
 * Get analyses of File object and pass these to the passed callback method 
 * @param {int} showAll Contains 0 or 1. 0 -> get recommended descriptors, if 1 -> get all descriptors
 * @param {array} filter Contains Strings that contain names of wanted descriptor, to get corresponding analyses. 
   See <a href="http://docs.canoris.com/howto_analysis.html" target="_blank">canoris_doc - howto_analysis</a>.
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 */
CAN.File.prototype.getAnalyses = function(showAll, filter, succesCallback, errorCallback){
	CAN.Log.log.debug("inside File.prototype.getAnalyses method " + 
						"\n__showAll = " + showAll + "\nfilter = " + filter);
	//if showAll is undefined -> set to 0
	if (!showAll) { showAll = 0;};
	//place showAll in object and save to params variable for request	
	var params = {all: showAll};
	//if filter is undefined -> set to array with one empty string
	if (!filter) { 	filter = [""];}
	//create request	
	CAN.RequestCreator.createGetReq(
		CAN._uri(CAN._URI_FILE_ANALYSIS, [this.properties.key, filter.join("/")]), 
		succesCallback, errorCallback, params
	);
}

/**
 * Get url of uploaded file. 
 * @returns {string} url Contians the url of the file.
 */
CAN.File.prototype.getFileUrl = function()
{
	var url = 	CAN._uri(CAN._URI_FILE_SERVE, [ this.properties.key]) + 
				"?&api_key=" + CAN.CanorisData.getApiKey() + "&format=json"; 
	return url;
}

/**
 * Get available conversion types and pass these to passed callback function. 
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 */
CAN.File.prototype.getConversions = function(succesCallback, errorCallback)
{
	//retrieve a dictionary showing the available convserions
	CAN.RequestCreator.createGetReq(CAN._uri(CAN._URI_FILE_CONVERSIONS, [this.properties.key]), succesCallback, errorCallback);
}

/**
 * Get the url of the passed conversion type of the file.
 * @param {string} conversionType Contains the conversion type that is needed.
 * @returns {string} url Contains the url of the conversion.
 */
CAN.File.prototype.getConversionUrl = function(conversionType)
{
	if(conversionType)
	{	
		var url = 	CAN._uri(CAN._URI_FILE_CONVERSION, [ this.properties.key, conversionType]) + 
					"?&api_key=" + CAN.CanorisData.getApiKey() +	"&format=json"; 
		return url;
	}else{ throw new SyntaxError("no conversionType passed to CAN.File.prototype.getConversionIrl");};
}

/**
 * Get available visualisation types and pass these to passed callback function.
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails 
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp)
 */
CAN.File.prototype.getVisualisations =function(succesCallback, errorCallback)
{
	//retrieve a dictionary showing the available visualisations
	CAN.RequestCreator.createGetReq(CAN._uri(CAN._URI_FILE_VISUALIZATIONS, [this.properties.key]), succesCallback, errorCallback);	
}


/**
 * Get the url of the spectrum/waveForm 
 * @param {string} visualisationKey Contains "spectrum" or "waveForm", to get corresponding waveForm.
 * @returns {string} url Contains the url of the spectrum/waveform.
 */
CAN.File.prototype.getVisualisationUrl = function(visualisationKey)
{
	if(visualisationKey)
	{
		var url = 	CAN._uri(CAN._URI_FILE_VISUALIZATION, [ this.properties.key, visualisationKey]) + 
						"?&api_key=" + CAN.CanorisData.getApiKey() +	"&format=json"; 
		return url;
	}else{ throw new SyntaxError("no visualisationKey passed to CAN.File.prototype.getVisualisationUrl");};
}


/*======================================================================*/
/*============================= Collection =============================*/
/*======================================================================*/
/** 
 * @class Collection class, is used to get a Collection
 * @constructor 
 * @augments CAN.CanorisObject
 */
CAN.Collection = function(){this.object = this;};

/**
 * Get corresponding Collection properties and create a Collection object
 * saves it with passed collection-save function
 * @static 
 * @param {string} c_key Contains a collection key.
 * @param {function} saveCollection Is used to save the created Collection object.
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp) 
 */
CAN.Collection.getCollection = function(cKey, saveCollection, succesCallback, errorCallback){
	CAN.Log.log.debug("inside Collection.getCollection method, passed key= " + cKey);
	//call createGetReq and pass it collection uri, collection key and callback functions
	CAN.RequestCreator.createGetReq(CAN._uri(CAN._URI_COLLECTION, [cKey]), function(inProperties)
	{
		//create a new File object and a new CanorisObject 
		var newCollection = new CAN.Collection();
		var newCanorisObject = new CAN.CanorisObject(inProperties);
		//use jQuery.extend to let newFile inherited from newCanorisObjectl
		$.extend(newCollection, newCanorisObject);	
		//save newFile, by using passed clossures 
		saveCollection(newCollection);
		//call succesCallback method
		if($.isFunction(succesCallback)){succesCallback(newCollection); };
	}, errorCallback);

}

/**
 * Show files that belong to collection
 * @param {number} pageNr Contains the collection page that is needed. 
 */
CAN.Collection.prototype.getFiles = function(pageNr, succesCallback, errorCallback){
	if(isNaN(pageNr)){var page = {page: 0}} else {var page = {page: pageNr};};
	//call createGetReq and pass it collection files uri, collection key, callback functions and pageNr
	CAN.RequestCreator.createGetReq(CAN._uri(CAN._URI_COLLECTION_FILES, [this.properties.key]), 
		succesCallback, errorCallback, page);
}
	
/**
 * Get similar files and similarity
 * @param {string} fKey Contains the file key of the file on which similarity search will be done.
 * @param {string} searchPreset Contains the type of preset for the similarity search. "music", "rhythm" or "lowlevel"
 * @param {int} nrResults Contains the number of results that the response need to have.
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails
 * (no XMLHttpRequest and specified error passed to errorCallback with use of jsonp) 
 */
CAN.Collection.prototype.getSimilar = function(fKey, searchPreset, nrResults, succesCallback, errorCallback){
	//check if fKey, searchPreset and nrResults are passed
	if(!fKey){ throw new SyntaxError("Collection.getSimilar needs a file key")};
	if(!searchPreset){ throw new SyntaxError("Collection.getSimilar needs a searchPreset, music / rhythm / lowlevel")};
	if(!nrResults){nrResults = 5;};
	//call createGetReq and pass it collection similar uri, collection key, callback functions and pageNr
	CAN.RequestCreator.createGetReq(CAN._uri(CAN._URI_COLLECTION_SIMILAR, [this.properties.key, fKey, searchPreset, nrResults]), 
		succesCallback, errorCallback); 
}



/*======================================================================*/
/*=========================== Text2Phonemes ============================*/
/*======================================================================*/
/**
 * @class Text2Phonemes class contains method text to phonemes to generate phonemes
 */
CAN.Text2Phonemes = function(){}

/**
 * Method to generate the phonemes that you need for the vocaloid processing operation.
 * @static
 * @param {string} text Contains the text to be translated to phonemes
 * @param {function} succesCallback Will be called when the request succeeds.
 * @param {fucntion} errorCallback Will be called when the request fails 
 * @param {string} voice Contains the voice to adapt the possible output phonemes to the database for. 'arnau' or 'ona'
 * @param {string} language Contains the language the text is in. 'spanish' or 'english'  
 */
CAN.Text2Phonemes.translate = function(text, succesCallback, errorCallback, voice, language){
	//check if text and callback are passed
	if(!text || !callback){throw "No text and/or callback passed to Text2Phonemes.translate method."};
	//if no parameter is passed for languages -> set to 'spanish'
	if(!language){language = 'spanish'};
	var params = {language: language, text: text};
	if(voice){params.voice = voice};
	//call createGetReq and pass it phonemes callback functions and parameters
	CAN.RequestCreator.createGetReq(CAN._uri(CAN._URI_PHONEMES), succesCallback, errorCallback, params);
};


/*======================================================================*/
/*=============================== canoris ==============================*/
/*======================================================================*/
/**
 * @class Canoris class is the API of the Canoris Javascript Library
 * @constructor
 * @param {String} aKey Contains the api key that is going to be used.
 * @param {Boolean} useJson Contains a boolean indicating the use of Json, otherwise Jsonp
 * @param {String} levelConsoleLog Contains the level of the consoleLogger available levels are: 
 * ALL TRACE DEBUG INFO WARN ERROR FATAL OFF
 * @param {String} levelServerLog Contains the level of the serverLogger, available levels see levelDebugLog
 * @param {String} serverLogAddress Contains the addres to which the serverLogger makes calls
 * @returns {Object} { pagers, getFilesPager, getCollectionsPager, getCollectionFilesPager, files, 
 * 			getFile, collections, getCollection, text2phonemes, setTimeout }. 
 * <br/>See <a href="canorisLib_howto.html">How-to</a> on how to use canoris object.
 */
Canoris = function(aKey, useJson, levelConsoleLog, levelServerLog, serverLogAddress){
//
//\npagers -> contains the pagers created with getFilesPager, getCollectionsPager, getCollectionFilesPager methods
	
	//check if there already exist a object of Canoris class (singleton)
	if(!Canoris.object)
	{
		if (aKey) {
			
			//set use of json, logAddress and loggers levels
			CAN.RequestCreator.setUseJson(useJson);
			CAN.Log.setLogAddress(serverLogAddress);	
			CAN.Log.setLogger(levelConsoleLog, levelServerLog);
					
			//empty pagers object, will be ued to hold pagers
			var pagers = {};
			//savePager function to be able to store pagers(by using a closure for pagers variable)
			var savePager = function(name){
				return function(val){
					pagers[name] = val;
				}
			};
			//getFilesPager function to call CAN.Pager.getFilesPager with pagers clossure function
			var getFilesPager = function(namePager, pageNr, succesCallback, errorCallback)
			{	CAN.Pager.getFilesPager(savePager(namePager), pageNr, succesCallback, errorCallback); };
			//getCollectionsPager function to call CAN.Pager.getCollectionsPager with pagers clossure function
			var getCollectionsPager = function(namePager, pageNr, succesCallback, errorCallback)
			{	CAN.Pager.getCollectionsPager(savePager(namePager), pageNr, succesCallback, errorCallback); };
			//getCollectionFilesPager function to call CAN.Pager.getCollectionFilesPager with pagers clossure function
			var getCollectionFilesPager = function(cKey, namePager, pageNr, succesCallback, errorCallback)
			{	CAN.Pager.getCollectionFilesPager(cKey, savePager(namePager), pageNr, succesCallback, errorCallback); };
						
			//empty files object, will be used to hold files 
			var files = {};
			//saveFile function to be able to store files (by using a closure for files variable) 
			var saveFile = function(name){
				return function(val){
					files[name] = val;
				}
			};
			//getFile function to call CAN.File.getFile with files clossure function
			var getFile = function(fKey, nameFile, succesCallback, errorCallback)
			{	CAN.File.getFile(fKey, saveFile(nameFile), succesCallback, errorCallback); };
			
			//empty collections object, will be used to hold collections 
			var collections = {};
			//saveCollection function to be able to store collections (by using a closure for collection variable) 
			var saveCollection = function(name){
				return function(val){
					collections[name] = val;
				}
			};
			//getCollection function to call CAN.Collection.getCollection with collections clossure function
			var getCollection = function(cKey, nameCollection, succesCallback, errorCallback)
			{	CAN.Collection.getCollection(cKey, saveCollection(nameCollection), succesCallback, errorCallback); };
				
			//set api key
			CAN.CanorisData.setApiKey(aKey); 
			 			
			//create Canoris object, containing public variables and methods of Canoris Library						
			var object = {
				
				pagers: pagers,
				getFilesPager:  getFilesPager, 
				getCollectionsPager: getCollectionsPager,
				getCollectionFilesPager: getCollectionFilesPager,
				
				files: files,
				getFile: getFile, 

				collections: collections,
				getCollection: getCollection,
								
				text2phonemes: CAN.Text2Phonemes.translate,
				
				setTimeout: CAN.RequestCreator.setTimeout
				
//change this in a reset method -> all files change like this right? ASK VINCENT what he wants!
			};
		}
		//no correct api key passed -> throw error
		else {throw "you didn't pass a api_key to constructor canoris"; }
	}
	
	//return object of Canoris class

	return object;	
}

