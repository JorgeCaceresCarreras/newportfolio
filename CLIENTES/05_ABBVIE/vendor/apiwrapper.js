var scorm = {

    API : null,

    LMSInitialize : function () {
	    var result = "false";
	    var theAPI = this.getAPI("No se puede ejecutar LMSInitialize()");  
	    if (theAPI != null) {
		    result = theAPI.LMSInitialize("").toString();
	    }
	    return result;
    },

    LMSFinish : function () {
	    var result = "false";
	    var theAPI = this.getAPI();
	    if (theAPI != null) {
		    result = theAPI.LMSFinish("").toString();
	    }
	    return result;
    },

    LMSGetValue : function (element) {
	    var result = "false";
	    var theAPI = this.getAPI();
	    if (theAPI != null) {
		    result = theAPI.LMSGetValue(element).toString();
	    }
	    return result;
    },

    LMSSetValue : function (element, value) {
	    var result = "false";
	    var theAPI = this.getAPI();
	    if (theAPI != null) {
		    result = theAPI.LMSSetValue(element, value).toString();
	    }
	    return result;
    },

    LMSCommit : function () {
	    var result = "false";
	    var theAPI = this.getAPI();
	    if (theAPI != null) {
		    result = theAPI.LMSCommit("").toString();
	    }
	    return result;
    },

    LMSGetLastError : function () {
	    var result = "false";
	    var theAPI = this.getAPI();
	    if (theAPI != null) {
		    result = theAPI.LMSGetLastError().toString();
	    }
	    return result;
    },

    LMSGetErrorString : function (errorCode) {
	    var result = "false";
	    var theAPI = this.getAPI();
	    if (theAPI != null) {
		    result = theAPI.LMSGetErrorString(errorCode).toString();
	    }
	    return result;
    },

    getAPI : function (errorMessage) {
	    if (this.API == null) {
		    this.API = this.findAPI(window);
		    if (this.API == null && errorMessage != null) {
			    //window.alert(errorMessage);   /*DEBUGFD*/
		    }
	    }
	    return this.API;
    },

    // Busca el adaptador del API a partir de la ventana indicada
    findAPI : function (win)
    {
	    // Variable donde se guardará la referencia al adaptador del API
	    var theAPI = null;

	    // Si la ventana actual lo tiene
	    if (win.API != null  ||win.API_1484_11 !=null ) { 
		    if (win.API != null)
		    {
		    theAPI = win.API;
		    }
		    else
		    {
			    theAPI = win.API_1484_11;
		    }
	    // Si tiene un marco superior buscaremos en él
	    } else if (win.parent != null && win.parent != win) {
		    theAPI = this.findAPI(win.parent);
	    // Si tiene una ventana que la abierto buscaremos en ella
	    } else if (win.opener != null && typeof(win.opener) != "undefined") {
		    theAPI = this.findAPI(win.opener);
	    } else {
		    //window.alert("No se encuentra el adaptador del API"); /* DEBUGFD */
	    }
	    return theAPI;
    },
    
    setSuspendData : function (jsonData){
        var jsonString = JSON.stringify(jsonData);
        jsonString = jsonString.replace(/\"/g, "'");
        this.LMSSetValue("cmi.suspend_data", jsonString);
        
        var sum = 0;
        for(i=0; i<jsonData.v.length; i++) {
            sum += parseInt(jsonData.v[i]);
        }
        
        var porcentaje = Math.floor(sum*100/jsonData.v.length);
        
        if(porcentaje==100 && courseConfig.hasEvaluation!="true") {
            scorm.LMSSetValue("cmi.core.lesson_status","completed");
        }
        this.LMSCommit();
    },

    getSuspendData : function (jsonData){
    	var suspendData = this.LMSGetValue("cmi.suspend_data");   
    	suspendData = suspendData.replace(/'/g, "\"");
   		suspendDataJSON = JSON.parse(suspendData);
    	return suspendDataJSON;
    }
         
}
