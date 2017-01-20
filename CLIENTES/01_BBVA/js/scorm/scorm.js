define(['scorm/scorm_apiwrapper'], function(scorm_APIWrapperClass) {
    
    var scorm_APIWrapper;
    function init (scormVersion, autoCommit) {
        scorm_APIWrapper = scorm_APIWrapperClass.init(scormVersion, autoCommit);
    }
    
    function initializeWrapper() {
        return scorm_APIWrapper.initialize();
    }
    
	var startTime ="";

	/*******************************************************************************
  	**
  	** Function setStartTime()
  	** Inputs:  None
  	**
  	** Descripción:
  	** Establece starTime a hora actual
  	**
  	*******************************************************************************/
	function setStartTime() 
	{
		startTime = new Date();
	}

	/*******************************************************************************
	**
	** Function: reportSessionTime()
	** Inputs:  None
	** Return: true si fue satisfactorio
  	**         false si falló.
	**
	** Descripción:
	** Guarda el tiempo de la sessión actual
	**
	*******************************************************************************/
	function reportSessionTime() 
	{
		var finishTime = new Date();
		var numberMiliSecond = finishTime.getTime() - startTime.getTime();
		if (scorm_APIWrapper.version=="1.2"){
			sessionTime = millisecondsToCMIDuration(numberMiliSecond);
			return scorm_APIWrapper.setValue("cmi.core.session_time",sessionTime);
		}else{
			sessionTime = millisecondsSCORM2004Time(numberMiliSecond);
			return scorm_APIWrapper.setValue("cmi.session_time",sessionTime);
		}
	}

	/*******************************************************************************
	**
	** Function: millisecondsToCMIDuration(n)
	** Inputs:  n - numero de milisegundos de la sessión actual
	** Return:  devuelve una cadena con los milisegundos en formato 0000:00:00.00
	**
	** Descripción:
	** Convierte el tiempo de milisegundos al formato 0000:00:00.00
	**
	*******************************************************************************/
	function millisecondsToCMIDuration(n)
	{
		var hms = "";
		var dtm = new Date();	dtm.setTime(n);
		var h = "000" + Math.floor(n / 3600000);
		var m = "0" + dtm.getMinutes();
		var s = "0" + dtm.getSeconds();
		var cs = "0" + Math.round(dtm.getMilliseconds() / 10);
		hms = h.substr(h.length-4)+":"+m.substr(m.length-2)+":";
		hms += s.substr(s.length-2)+"."+cs.substr(cs.length-2);
		return hms
	}

	/*******************************************************************************
	**
	** Function: millisecondsSCORM2004Time(n)
	** Inputs:  n - numero de milisegundos de la sessión actual
	** Return:  devuelve una cadena con los milisegundos en formato P[yY][mM][dD][T[hH][mM][s[.s]S]]
	**
	** Descripción:
	** Convierte el tiempo de milisegundos al formato P[yY][mM][dD][T[hH][mM][s[.s]S]]
	**
	*******************************************************************************/
	function millisecondsSCORM2004Time(n)
	{
		var scormTime = "";
		var centiSecond;
		var seconds;	// 100 hundreths of a seconds
		var minutes;	// 60 seconds
		var hours;		// 60 minutes
		var days;		// 24 hours
		var months;		// assumed to be an "average" month (figures a leap year every 4 years) = ((365*4) + 1) / 48 days - 30.4375 days per month
		var years;		// assumed to be 12 "average" months

		var hundred_centiSecond = 100;
		var minute_centiSecond = hundred_centiSecond * 60;
		var hour_centiSecond = minute_centiSecond * 60;
		var day_centiSecond = hour_centiSecond * 24;
		var month_centiSecond = day_centiSecond * (((365 * 4) + 1) / 48);
		var year_centiSecond = month_centiSecond * 12;

		centiSecond = Math.floor(n/10);

		years = Math.floor(centiSecond / year_centiSecond);
		centiSecond -= (years * year_centiSecond);
	
		months = Math.floor(centiSecond / month_centiSecond);
		centiSecond -= (months * month_centiSecond);
	
		days = Math.floor(centiSecond / day_centiSecond);
		centiSecond -= (days * day_centiSecond);
	
		hours = Math.floor(centiSecond / hour_centiSecond);
		centiSecond -= (hours * hour_centiSecond);
	
		minutes = Math.floor(centiSecond / minute_centiSecond);
		centiSecond -= (minutes * minute_centiSecond);
	
		seconds = Math.floor(centiSecond / hundred_centiSecond);
		centiSecond -= (seconds * hundred_centiSecond);

		if (years > 0) {
			scormTime += years + "Y";
		}
		if (months > 0){
			scormTime += months + "M";
		}
		if (days > 0){
			scormTime += days + "D";
		}

		if ((centiSecond + seconds + minutes + hours) > 0 ){
			scormTime += "T";
		
			if (hours > 0){
				scormTime += hours + "H";
			}
			if (minutes > 0){
				scormTime += minutes + "M";
			}
			if ((centiSecond + seconds) > 0){
				scormTime += seconds;
				if (centiSecond > 0){
					scormTime += "." + centiSecond;
				}
				scormTime += "S";
			}
		}
		if (scormTime == ""){
			scormTime = "0S";
		}
	
		scormTime = "P" + scormTime;
	
		return scormTime;
	}

	

	/*******************************************************************************
	**
	** Function: getCompletionStatus()
	** Inputs:  None
	** Return: cadena con el estado de la lección (completed, incomplete, not attempted)
	**
	** Descripción:
	** Devuelve el estado de la lección actual
	**
	*******************************************************************************/
	function getCompletionStatus()
	{
		if (scorm_APIWrapper.version=="1.2"){
			return scorm_APIWrapper.getValue("cmi.core.lesson_status");
		}else{
			return scorm_APIWrapper.getValue("cmi.completion_status");
		}
	}

	/*******************************************************************************
	**
	** Function: getLocation()
	** Inputs: None
	** Return: Posición del alumno en el contenido
	**
	** Descripción:
	** Devuelve el punto donde el alumno abandonó el contenido en una sesión aterior
	**
	*******************************************************************************/
	function getLocation()
	{
		if (scorm_APIWrapper.version=="1.2"){
			return scorm_APIWrapper.getValue("cmi.core.lesson_location");
		}else{
			return scorm_APIWrapper.getValue("cmi.location");
		}
	}
	/*******************************************************************************
	**
	** Function: getScore()
	** Inputs:  None
	** Return: Puntuación del alumno
	**
	** Descripción:
	** Devuelve la nota/puntuación guardada en el LMS
	**
	*******************************************************************************/
	function getScore()
	{
		if (scorm_APIWrapper.version=="1.2"){
			return scorm_APIWrapper.getValue("cmi.core.score.raw");
		}else{
			return scorm_APIWrapper.getValue("cmi.score.raw");
		}
	}
	/*******************************************************************************
	**
	** Function: getSuspendData()
	** Inputs:  None
	** Return: json con la contenido del metadato suspend_data
	**
	** Descripción:
	** Devuelve el suspend data transformando de cadena a json 
	**
	*******************************************************************************/
	function getSuspendData()
	{
		var suspendData =scorm_APIWrapper.getValue("cmi.suspend_data");
        suspendData = suspendData.replace(/'/g, "\"");
    	suspendDataJSON = JSON.parse(suspendData);
    	return suspendDataJSON;
	}
	/*******************************************************************************
	**
	** Function: getStudentName()
	** Inputs: None
	** Return: Nombre del alumno obtenido del LMS
	**
	** Descripción:
	** Devuelve el nombre del alumno guardado en el metadato correspondiente
	**
	*******************************************************************************/
	function getStudentName()
	{
		if (scorm_APIWrapper.version=="1.2"){
			return scorm_APIWrapper.getValue("cmi.core.student_name");
		}else{
			return scorm_APIWrapper.getValue("cmi.learner_name");
		}
	}
	/*******************************************************************************
	**
	** Function: getStudentPreference()
	** Inputs: key - cadena con la preferencia a obtener
	** Return: Preferencia  del alumno obtenido del LMS
	**
	** Descripción:
	** Devuelve la preferencia del alumno pasada como parámetro que está almacenada en el LMS
	**
	*******************************************************************************/
	function getStudentPreference(key)
	{
		if (scorm_APIWrapper.version=="1.2"){
			return scorm_APIWrapper.getValue("cmi.student_preference."+key);
		}else{
			return scorm_APIWrapper.getValue("cmi.learner_preference."+key);
		}
	}

	/*******************************************************************************
	**
	** Function: setCompletionStatus(value)
	** Inputs: value - cadena con el valor del estado de la lección actual
	** Return: true si fue satisfactorio
  	**         false si falló.
	**
	** Descripción:
	** Guarda el estado de la lección en el metadato correspondiente
	**
	*******************************************************************************/
	function setCompletionStatus(value)
	{
		if (scorm_APIWrapper.version=="1.2"){
			return scorm_APIWrapper.setValue("cmi.core.lesson_status", value);
		}else{
			return scorm_APIWrapper.setValue("cmi.completion_status", value);
		}
	}

	/*******************************************************************************
	**
	** Function: setLocation(value)
	** Inputs: value - cadena con el valor que indica el punto dentro de la lección
	** Return: true si fue satisfactorio
  	**         false si falló.
	**
	** Descripción:
	** Guarda la posición actual del alumno dentro del contenido
	**
	*******************************************************************************/
	function setLocation(value)
	{
		if (scorm_APIWrapper.version=="1.2"){
			return scorm_APIWrapper.setValue("cmi.core.lesson_location", value);
		}else{
			return scorm_APIWrapper.setValue("cmi.location", value);
		}
	}
	/*******************************************************************************
	**
	** Function: setScore(min,max,score)
	** Inputs: min - cadena con el mínimo valor dentro del rango de la puntuación
	**		   max - cadena con el máximo valor dentro del rango de la puntuación
	**		   score - cadena con la puntuación obtenida
	** Return: true si fue satisfactorio
  	**         false si falló.
	**
	** Descripción:
	** Guarda la puntuación obtenida 
	**
	*******************************************************************************/
	function setScore(min,max,score)
	{
		if (scorm_APIWrapper.version=="1.2"){
			scorm_APIWrapper.setValue("cmi.core.score.min", min);
			scorm_APIWrapper.setValue("cmi.core.score.max", max);
			return scorm_APIWrapper.setValue("cmi.core.score.raw", score);
		}else{
			scorm_APIWrapper.setValue("cmi.score.min", min);
			scorm_APIWrapper.setValue("cmi.score.max", max);
			return scorm_APIWrapper.setValue("cmi.score.raw", score);
		}
	}
	/*******************************************************************************
	**
	** Function: setSuspendData(jsonData)
	** Inputs:  jsonData - json con la información a guardar en el suspend_data
	** Return: true si fue satisfactorio
  	**         false si falló.
	**
	** Descripción:
	** Guarda el suspend data transformando el json a cadena
	**
	*******************************************************************************/
	function setSuspendData(jsonData)
	{
		var jsonString = JSON.stringify(jsonData);
    	jsonString = jsonString.replace(/\"/g, "'");
    	if (scorm_APIWrapper.version=="1.2" && jsonString.length>4096){
    		alert ("Error Saving DATA.");
    	}else{
			return scorm_APIWrapper.setValue("cmi.suspend_data",jsonString);
    	}
	}
	/*******************************************************************************
	**
	** Function: getStudentPreference()
	** Inputs: key - cadena de la preferencia a guardar
	**		   value - valor de la preferencia a guardar
	** Return: true si fue satisfactorio
  	**         false si falló.
	**
	** Descripción:
	** Guarda la preferencia del alumno pasada como parámetro
	**
	*******************************************************************************/
	function setStudentPreference(key,value)
	{
		if (scorm_APIWrapper.version=="1.2"){
			return scorm_APIWrapper.setValue("cmi.student_preference."+key, value);
		}else{
			return scorm_APIWrapper.setValue("cmi.learner_preference."+key, value);
		}
	}

    function finish() {
        return scorm_APIWrapper.finish()
    }

 	// Public API
  	return {
    	"setStartTime": setStartTime,
    	"setLocation": setLocation,
    	"setScore": setScore,
    	"setSuspendData": setSuspendData,
    	"setCompletionStatus": setCompletionStatus,
    	"setStudentPreference": setStudentPreference,
    	"setSessionTime": reportSessionTime,
    	"getStudentName": getStudentName,
    	"getLocation": getLocation,
    	"getScore": getScore,
    	"getSuspendData": getSuspendData,
    	"getCompletionStatus": getCompletionStatus,
    	"getStudentPreference": getStudentPreference,
    	"init": init,
    	"initializeWrapper": initializeWrapper,
        'finish': finish
   	};
});	
