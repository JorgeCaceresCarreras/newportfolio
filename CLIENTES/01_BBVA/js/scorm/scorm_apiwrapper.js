define(function(){
  var version, commitOnSetValue;
  var debug = false;
  var output = window.console;

  // Define exception/error codes
  var _NoError = {"code":"0","string":"No Error","diagnostic":"No Error"};
  var _GeneralException = {"code":"101","string":"General Exception","diagnostic":"General Exception"};
  var _AlreadyInitialized = {"code":"103","string":"Already Initialized","diagnostic":"Already Initialized"};

  var initialized = false;
  var apiHandle = null;
  
  function init (scormVersion, autoCommit) {
    version = scormVersion;
    commitOnSetValue = autoCommit;
    // Public API
      if (version=="1.2")
      {
        return {
          "version": version,
          "initialize": doLMSInitialize,
          "finish": doLMSFinish,
          "commit": doLMSCommit,
          "getValue": doLMSGetValue,
          "setValue": doLMSSetValue,
        }
      }
      else
      {
        return {
          "version": version,
          "initialize": doInitialize,
          "finish": doTerminate,
          "commit": doCommit,
          "getValue": doGetValue,
          "setValue": doSetValue,
        }
    }  
  }

  /*******************************************************************************
  **
  **  INICIO SCORM 1.2
  **
  *******************************************************************************/
  /*******************************************************************************
  **
  ** Function: doLMSInitialize()
  ** Return:  true si la inicialización fue satisfactoria, or
  **          false si la inicialización falló.
  **
  ** Descripción:
  ** Inicializa la comunicación con el LMS
  **
  *******************************************************************************/
  function doLMSInitialize()
  {
    if (initialized) return "true";
   
    var api = getAPIHandle();
    if (api == null)
    {
        message("Unable to locate the LMS's API Implementation.\nLMSInitialize was not successful.");
        return "false";
    }

    var result = api.LMSInitialize("");
    if (result.toString() != "true")
    {
      var err = ErrorHandler();
      message("LMSInitialize failed with error code: " + err.code);
    }
    else
    {
      initialized = true;
    }
    return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doLMSFinish()
  ** Inputs:  None
  ** Return:  true si fue satisfactorio
  **          false si falló.
  **
  ** Descripción:
  ** Cierra la comunicación con el LMS
  **
  *******************************************************************************/
  function doLMSFinish()
  {
    if (! initialized) return "true";
   
    var api = getAPIHandle();
    if (api == null)
    {
      message("Unable to locate the LMS's API Implementation.\nLMSFinish was not successful.");
      return "false";
    }
    else
    {
      // call the LMSFinish function that should be implemented by the API
      var result = api.LMSFinish("");
      if (result.toString() != "true")
      {
         var err = ErrorHandler();
         message("LMSFinish failed with error code: " + err.code);
      }
    }

    initialized = false;
   
    return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doLMSGetValue(name)
  ** Inputs:  name - cadena que representa el metadato dentro del modelo de datos 
  **              scorm (ej. cmi.core.student_name)
  ** Return:  El valor asignado por el LMS al metadado dentro del modelo de datos 
  **              pasado como parámetro de la función
  **
  ** Descripción:
  ** Envuelve la llamada al método LMSGetValue del LMS
  **
  *******************************************************************************/
  function doLMSGetValue(name)
  {
     var api = getAPIHandle();
     var result = "";
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nLMSGetValue was not successful.");
     }
     else if (! initialized && ! doLMSInitialize())
     {
        var err = ErrorHandler(); // get why doLMSInitialize() returned false
        message("LMSGetValue failed - Could not initialize communication with the LMS - error code: " + err.code);
     }
     else
     {
        result = api.LMSGetValue(name);

        var error = ErrorHandler();
        if (error.code != _NoError.code)
        {
           // an error was encountered so display the error description
           message("LMSGetValue("+name+") failed. \n"+ error.code + ": " + error.string);
           result = "";
        }
     }
     return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doLMSSetValue(name, value)
  ** Inputs:  name - cadena que representa el metadato dentro del modelo de datos 
  **              scorm
  **          value - valor asignado 
  ** Return:  true si fue satisfactorio
  **          false si falló.
  **
  ** Descripción:
  ** Envuelve la llamada al método LMSGetValue del LMS
  **
  *******************************************************************************/
  function doLMSSetValue(name, value)
  {
     var api = getAPIHandle();
     var result = "false";
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nLMSSetValue was not successful.");
     }
     else if (! initialized && ! doLMSInitialize())
     {
        var err = ErrorHandler(); // get why doLMSInitialize() returned false
        message("LMSSetValue failed - Could not initialize communication with the LMS - error code: " + err.code);
     }
     else
     {
        result = api.LMSSetValue(name, value);
        if (result.toString() != "true")
        {
           var err = ErrorHandler();
           message("LMSSetValue("+name+", "+value+") failed. \n"+ err.code + ": " + err.string);
        }else{
          if (commitOnSetValue){
            doLMSCommit();  
          }
        }
     }

     return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doLMSCommit()
  ** Inputs:  None
  ** Return:  true si fue satisfactorio
  **          false si falló.
  **
  ** Descripción:
  ** Commits el dato al LMS. 
  **
  *******************************************************************************/
  function doLMSCommit()
  {
     var api = getAPIHandle();
     var result = "false";
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nLMSCommit was not successful.");
     }
     else if (! initialized && ! doLMSInitialize())
     {
        var err = ErrorHandler(); // get why doLMSInitialize() returned false
        message("LMSCommit failed - Could not initialize communication with the LMS - error code: " + err.code);
     }
     else
     {
        result = api.LMSCommit("");
        if (result != "true")
        {
           var err = ErrorHandler();
           message("LMSCommit failed - error code: " + err.code);
        }
     }

     return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doLMSGetLastError()
  ** Inputs:  None
  ** Return:  El código de error que se estableció en la última llamada al LMS
  **
  ** Descripción:
  ** Llama a la función LMSGetLastError
  **
  *******************************************************************************/
  function doLMSGetLastError()
  {
     var api = getAPIHandle();
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nLMSGetLastError was not successful.");
        //since we can't get the error code from the LMS, return a general error
        return _GeneralException.code; //General Exception
     }

     return api.LMSGetLastError().toString();
  }

  /*******************************************************************************
  **
  ** Function doLMSGetErrorString(errorCode)
  ** Inputs:  errorCode - Código de error
  ** Return:  Descripción correspondiente al código de error de entrada
  **
  ** Descripción:
  ** Llama a la función LMSGetErrorString
  **
  ********************************************************************************/
  function doLMSGetErrorString(errorCode)
  {
     var api = getAPIHandle();
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nLMSGetErrorString was not successful.");
        return _GeneralException.string;
     }

     return api.LMSGetErrorString(errorCode).toString();
  }

  /*******************************************************************************
  **
  ** Function doLMSGetDiagnostic(errorCode)
  ** Inputs:  errorCode - Código de error
  ** Return:  Descripción correspondiente al código de error de entrada
  **
  ** Descripción:
  ** Llama a la función LMSGetDiagnostic
  **
  *******************************************************************************/
  function doLMSGetDiagnostic(errorCode)
  {
     var api = getAPIHandle();
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nLMSGetDiagnostic was not successful.");
        return "Unable to locate the LMS's API Implementation. LMSGetDiagnostic was not successful.";
     }

     return api.LMSGetDiagnostic(errorCode).toString();
  }
  
  /*******************************************************************************
  **
  **  FIN SCORM 1.2
  **
  *******************************************************************************/

  /*******************************************************************************
  **
  **  INICIO SCORM 2004
  **
  *******************************************************************************/

  /*******************************************************************************
  **
  ** Function: doInitialize()
  ** Inputs:  None
  ** Return:  true si la inicialización fue satisfactoria, or
  **          false si la inicialización falló.
  **
  ** Descripción:
  ** Inicializa la comunicación con el LMS
  **
  *******************************************************************************/
  function doInitialize()
  {
     if (initialized) return "true";
     
     var api = getAPIHandle();
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nInitialize was not successful.");
        return "false";
     }
     var result = api.Initialize("");

     if (result.toString() != "true")
     {
        var err = ErrorHandler();
        message("Initialize failed with error code: " + err.code);
     }
     else
     {
        initialized = true;
     }

     return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doTerminate()
  ** Inputs:  None
  ** Return:  true si fue satisfactorio
  **          false si falló.
  **
  ** Descripción:
  ** Cierra la comunicación con el LMS
  **
  *******************************************************************************/
  function doTerminate()
  {  
     if (! initialized) return "true";
     
     var api = getAPIHandle();
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nTerminate was not successful.");
        return "false";
     }
     else
     {
        // call the Terminate function that should be implemented by the API
        var result = api.Terminate("");
        if (result.toString() != "true")
        {
           var err = ErrorHandler();
           message("Terminate failed with error code: " + err.code);
        }
     }
     
     initialized = false;

     return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doGetValue(name)
  ** Inputs:  name - cadena que representa el metadato dentro del modelo de datos 
  **              scorm (ej. cmi.learner_id)
  ** Return:  El valor asignado por el LMS al metadado dentro del modelo de datos 
  **              pasado como parámetro de la función
  **
  ** Descripción:
  ** Envuelve la llamada al método GetValue del LMS
  **
  *******************************************************************************/
  function doGetValue(name)
  {
     var api = getAPIHandle();
     var result = "";
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nGetValue was not successful.");
     }
     else if (!initialized && ! doInitialize())
     {
        var err = ErrorHandler();
        message("GetValue failed - Could not initialize communication with the LMS - error code: " + err.code);
     }
     else
     {
        result = api.GetValue(name);
        
        var error = ErrorHandler();
        if (error.code != _NoError.code)
        {
           // an error was encountered so display the error description
           message("GetValue("+name+") failed. \n"+ error.code + ": " + error.string);
           result = "";
        }
     }
     return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doSetValue(name, value)
  ** Inputs:  name - cadena que representa el metadato dentro del modelo de datos 
  **              scorm
  **          value - valor asignado 
  ** Return:  true si fue satisfactorio
  **          false si falló.
  **
  ** Descripción:
  ** Envuelve la llamada al método SetValue del LMS
  **
  *******************************************************************************/
  function doSetValue(name, value)
  {
     var api = getAPIHandle();
     var result = "false";
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nSetValue was not successful.");
     }
     else if (!initialized && !doInitialize())
     {
        var error = ErrorHandler();
        message("SetValue failed - Could not initialize communication with the LMS - error code: " + error.code);
     }
     else
     {
        result = api.SetValue(name, value);
        if (result.toString() != "true")
        {
           var err = ErrorHandler();
           message("SetValue("+name+", "+value+") failed. \n"+ err.code + ": " + err.string);
        }
        else
        {
          if (commitOnSetValue)
          {
            doCommit();  
          }
        }
     }

     return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doCommit()
  ** Inputs:  None
  ** Return:  true si fue satisfactorio
  **          false si falló.
  **
  ** Descripción:
  ** Commits el dato al LMS. 
  **
  *******************************************************************************/
  function doCommit()
  {
     var api = getAPIHandle();
     var result = "false";
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nCommit was not successful.");
     }
     else if (!initialized && ! doInitialize())
     {
        var error = ErrorHandler();
        message("Commit failed - Could not initialize communication with the LMS - error code: " + error.code);
     }
     else
     {
        result = api.Commit("");
        if (result != "true")
        {
           var err = ErrorHandler();
           message("Commit failed - error code: " + err.code);
        }
     }

     return result.toString();
  }

  /*******************************************************************************
  **
  ** Function doGetLastError()
  ** Inputs:  None
  ** Return:  El código de error que se estableció en la última llamada al LMS
  **
  ** Descripción:
  ** Llama a la función GetLastError
  **
  *******************************************************************************/
  function doGetLastError()
  {
     var api = getAPIHandle();
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nGetLastError was not successful.");
        //since we can't get the error code from the LMS, return a general error
        return _GeneralException.code;
     }

     return api.GetLastError().toString();
  }

  /*******************************************************************************
  **
  ** Function doGetErrorString(errorCode)
  ** Inputs:  errorCode - Código de error
  ** Return:  Descripción correspondiente al código de error de entrada
  **
  ** Descripción:
  ** Llama a la función GetErrorString
  **
  ********************************************************************************/
  function doGetErrorString(errorCode)
  {
     var api = getAPIHandle();
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nGetErrorString was not successful.");
        return _GeneralException.string;
     }

     return api.GetErrorString(errorCode).toString();
  }

  /*******************************************************************************
  **
  ** Function doGetDiagnostic(errorCode)
  ** Inputs:  errorCode - Código de error
  ** Return:  Descripción correspondiente al código de error de entrada
  **
  ** Descripción:
  ** Llama a la función LMSGetDiagnostic
  **
  *******************************************************************************/
  function doGetDiagnostic(errorCode)
  {
     var api = getAPIHandle();
     if (api == null)
     {
        message("Unable to locate the LMS's API Implementation.\nGetDiagnostic was not successful.");
        return "Unable to locate the LMS's API Implementation. GetDiagnostic was not successful.";
     }

     return api.GetDiagnostic(errorCode).toString();
  }
 
  /*******************************************************************************
  **
  ** Function findObjective(objId)
  ** Inputs:  objId - el id del objetivo
  ** Return:  el índice donde se ha localizado el objetivo
  **
  ** Descripción:
  ** Esta función busca el objetivo dentro del conjunto de objetivos y devuelve
  ** el índice en el que se encóntra o se crea un nuevo objetivo y devuelve el 
  ** nuevo índice.
  **
  *******************************************************************************/
  function findObjective(objId) 
  {
      var num = doGetValue("cmi.objectives._count");
      var objIndex = -1;

      for (var i=0; i < num; ++i) {
          if (doGetValue("cmi.objectives." + i + ".id") == objId) {
              objIndex = i;
              break;
          }
      }

      if (objIndex == -1) {
          message("Objective " + objId + " not found.");
          objIndex = num;
          message("Creating new objective at index " + objIndex);
          doSetValue("cmi.objectives." + objIndex + ".id", objId);
      }
      return objIndex;
  }

  /*******************************************************************************
  ** NOTA: Característica de la Cuarta Edición (4th) del SCORM 2004 .
  *
  ** Function findDataStore(id)
  ** Inputs:  id - el id del dato almacenado
  ** Return:  el índice donde el dato almacenado se ha localizado, -1 si no se 
  ** ha encontrado.
  **
  ** Description:
  ** Esta función busca el dato almacenado dentro de la colección de datos y 
  ** devuelve el índice en el que se encontró, o -1 si no se encontró en la 
  ** colección.
  **
  ** Uso:
  ** var dsIndex = findDataStore("myds");
  ** if (dsIndex > -1)
  ** {
  **    doSetValue("adl.data." + dsIndex + ".store", "save this info...");
  ** }
  ** else
  ** {
  **    var appending_data = doGetValue("cmi.suspend_data");
  **    doSetValue("cmi.suspend_data", appending_data + "myds:save this info");
  ** }
  *******************************************************************************/
  function findDataStore(id) 
  {
      var num = doGetValue("adl.data._count");
      var index = -1;
      
      // if the get value was not null and is a number 
      // in other words, we got an index in the adl.data array
      if (num != null && ! isNaN(num))
      { 
         for (var i=0; i < num; ++i) 
         {
             if (doGetValue("adl.data." + i + ".id") == id) 
             {
                 index = i;
                 break;
             }
         }
     
         if (index == -1) 
         {
             message("Data store " + id + " not found.");
         }
      }
      
      return index;
  }

  /*******************************************************************************
  **
  **  FIN SCORM 2004
  **
  *******************************************************************************/

  /*******************************************************************************
  **
  ** Function ErrorHandler()
  ** Inputs:  None
  ** Return:  El error actual
  **
  ** Descripción:
  ** Determina si se encontró un error en la llamada anterior al API
  ** y de ser así, devuele el error
  **
  ** Uso:
  ** var last_error = ErrorHandler();
  ** if (last_error.code != _NoError.code)
  ** {
  **    message("Encountered an error. Code: " + last_error.code + 
  **                                "\nMessage: " + last_error.string +
  **                                "\nDiagnostics: " + last_error.diagnostic);
  ** }
  *******************************************************************************/
  function ErrorHandler()
  {
    var error = {"code":_NoError.code, "string":_NoError.string, "diagnostic":_NoError.diagnostic};
    var api = getAPIHandle();
    if (api == null)
    {
      message("Unable to locate the LMS's API Implementation.\nCannot determine LMS error code.");
      error.code = _GeneralException.code;
      error.string = _GeneralException.string;
      error.diagnostic = "Unable to locate the LMS's API Implementation. Cannot determine LMS error code.";
      return error;
    }

    // check for errors caused by or from the LMS
    if (version=="1.2")
    {
      error.code = api.LMSGetLastError().toString(); 
    }
    else
    {
      error.code = api.GetLastError().toString(); 
    }
    
    if (error.code != _NoError.code)
    {
      // an error was encountered so display the error description
      if (version=="1.2")
      {
        error.string = api.LMSGetErrorString(error.code);
        error.diagnostic = api.LMSGetDiagnostic(""); 
      }
      else
      {
        error.string = api.GetErrorString(error.code);
        error.diagnostic = api.GetDiagnostic(""); 
      }
    }
     return error;
  }

  /******************************************************************************
  **
  ** Function getAPIHandle()
  ** Inputs:  None
  ** Return:  valor contenido en APIHandle
  **
  ** Descripción:
  ** Devuelve una referencia al objeto API si se ha establecido anteriormente, 
  ** en caso contrario null
  **
  *******************************************************************************/
  function getAPIHandle()
  {
     if (apiHandle == null)
     {
        apiHandle = getAPI();
     }

     return apiHandle;
  }

  /*******************************************************************************
  **
  ** Function findAPI(win)
  ** Inputs:  win - un objeto window
  ** Return:  Si se encuentra el API, se devuelve, en caso contrario null
  **
  ** Descripción:
  ** Esta función busca el objeto API en el padre o ventana abiertas.
  ** Para SCORM 2004 busca un objeto que se llame API_1484_11.
  **
  *******************************************************************************/
  function findAPI(win)
  {
    var findAPITries = 0;
    if (version=="1.2")
    {
      try {
          while ((win.API == null) && (win.parent != null) && (win.parent != win))
          {
            findAPITries++;
            if (findAPITries > 10) 
            {
              message("Error finding API -- too deeply nested.");
              return null;
            }
            
            win = win.parent;
          }

      return win.API;  
  } catch (e) { return null }
    }
    else
    {
      while ((win.API_1484_11 == null) && (win.parent != null) && (win.parent != win))
      {
        findAPITries++;
      
        if (findAPITries > 500) 
        {
          message("Error finding API -- too deeply nested.");
          return null;
        }
      
        win = win.parent;

      }
      return win.API_1484_11;
    }
  }

  /*******************************************************************************
  **
  ** Function getAPI()
  ** Inputs:  none
  ** Return:  Si se encuentra el API, se devuelve, en caso contrario null
  **
  ** Descripción:
  ** Esta función busca el objeto API, en primer lugar en la jerarquía de frames
  ** de la ventana actual y después, si es necesario, en la jerarquía de ventanas
  ** abiertas desde la actual. 
  ** Para SCORM 2004 busca un objeto que llame API_1484_11
  **
  *******************************************************************************/
  function getAPI()
  {
     var theAPI = findAPI(window);
     if ((theAPI == null) && (window.opener != null) && (typeof(window.opener) != "undefined"))
     {
        theAPI = findAPI(window.opener);
     }
     if (theAPI == null)
     {
        message("Unable to find an API adapter");
     }
     return theAPI
  }

  /*******************************************************************************
  **
  ** Function message(str)
  ** Inputs:  String - mensaje que se quiere enviar a la salida
  ** Return:  none
  ** Depends on: boolean debug para indicar si se quiere mostrar la salida
  **             object output para manejar los mensajes. Se debe implementar a
  **             una función log(string)
  **
  ** Descripción:
  ** Esta función saca mensajes a una salida específica. 
  *******************************************************************************/
  function message(str)
  {
     if(debug)
     {
        output.log(str);
     }
  }


  return {
    'init': init
  }
});
