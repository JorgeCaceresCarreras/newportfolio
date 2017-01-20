(function () {
    $(document).ready(function() {
        var iframe = $('iframe');
        var href = '';
        
        var scormActivo = false;
        
        var tipoContenido = 'f';
        var startTime = new Date();
        
        var flipbookName = iframe.attr('src');
        var finished = false;
        
        function verIframe() {
            var hrefNuevo = iframe.contents().get(0).location.href;

            if (href != hrefNuevo) {
                href = hrefNuevo;
                if(scormActivo=="true") {
                    saveLessonLocation();
                }
            }
        }
        
        function irPagina(pagina) {
            if(pagina && pagina!=''){
                iframe.contents().get(0).location.href = flipbookName + '#p=' + pagina;
                iframe.contents().get(0).location.reload();
            }
        }
        
        function saveLessonLocation() {
            var paginas = getPageVisited();
            var pagina = 1;
            var doublePage = false;
            if(href.indexOf('#')>-1) {
                pagina = parseInt(href.substring(href.indexOf('#')+3));
            }
            if (bookConfig['FlipStyle'] =="Slide"){
                tipoContenido = 's';
                if (bookConfig['showDoublePage'] =="No"){
                    paginas[pagina-1] = 1;
                }else{
                    doublePage = true;
                }
            }else{
                doublePage = true;
            }

            if (doublePage){
                if(pagina%2 == 0) {
                    paginas[pagina] = 1;
                }
            }
            paginas[pagina-1] = 1;
            scorm.LMSSetValue("cmi.core.lesson_location", pagina);
            scorm.LMSCommit();
           
            var jsonData = {}
            jsonData.v = paginas.join('');
            jsonData.t = tipoContenido;

            if (courseConfig.hasEvaluation=="true"){
            	jsonData.i = scorm.getSuspendData().i;
                jsonData.q = scorm.getSuspendData().q;
            }
            scorm.setSuspendData(jsonData);

            var lessonStatus = scorm.LMSGetValue("cmi.core.lesson_status");
            if(lessonStatus == "incomplete" && courseConfig.setCompletedWhenCompleted == "true" && jsonData.v.indexOf("0")==-1) {
                scorm.LMSSetValue("cmi.core.lesson_status", "completed");
            }
        }
        
        function getPageVisited(){
            var suspendData = scorm.LMSGetValue("cmi.suspend_data");   
            suspendData = suspendData.replace(/'/g, "\"");
            suspendDataJSON = JSON.parse(suspendData);
            tipoContenido = suspendDataJSON.t;
            return suspendDataJSON.v.split('');
        }
        
        function initialLoad() {
            if (scormActivo!="true"){
                var result = scorm.LMSInitialize();
                scormActivo = result;    
            }
            if (result == "true") {
                var lessonStatus = scorm.LMSGetValue("cmi.core.lesson_status");
                if (lessonStatus == "not attempted" || lessonStatus == "") {
                    scorm.LMSSetValue("cmi.core.lesson_status", "incomplete");
                    scorm.LMSCommit();
                    //Inicializamos suspend_data
                    var arrayTemp = "";
                    for (i=0; i<fliphtml5_pages.length; i++){
                        arrayTemp += "0";
                    }
                    var jsonData = {};
                    jsonData.v = arrayTemp;
                    jsonData.t = tipoContenido;
                    if (courseConfig.hasEvaluation=="true"){
						jsonData.i =0;
                        jsonData.q = [];
                    }
                    scorm.setSuspendData(jsonData);
                } else {
                    var suspendData = scorm.LMSGetValue("cmi.suspend_data");   
                    suspendData = suspendData.replace(/'/g, "\"");
                    suspendDataJSON = JSON.parse(suspendData);
                    tipoContenido = suspendDataJSON.t;
                }
                var pagina_nueva = scorm.LMSGetValue("cmi.core.lesson_location");
                if(pagina_nueva != "" && pagina_nueva != false) {
                    irPagina(pagina_nueva);
                }
            }
            
            setInterval(verIframe, 50);
        }

        //No es necesario que se haya terminado de cargar el iframe para que la aplicación funcione
        //Se quita en los IE que no tienen compatibilidad con el evento onload en los iframe.
        if(iframe.get(0).attachEvent) {
            initialLoad();
        } else {
            iframe.on('load', function(){
                initialLoad();
            });
        }
        
        $(window).on('beforeunload unload', function(){
            var endTime = new Date();
            var ms = endTime.getTime() - startTime.getTime();
	        var h = Math.round(ms/(1000*60*60));
	        var m = Math.round((ms-(h*1000*60*60))/(1000*60));
	        var segundos = ms-(h*1000*60*60)-(m*1000*60);
	        if (segundos < 0)
	            segundos = segundos*(-1);
	
	        var s = Math.round(segundos/1000);
		        h=((h<10)?"0":"")+h;
		        m=((m<10)?"0":"")+m;
		        s=((s<10)?"0":"")+s;
		    if (scormActivo =="true" && !finished){
		       scorm.LMSSetValue("cmi.core.session_time", h + ":" + m + ":" + s);
	           scorm.LMSCommit();
	           scorm.LMSFinish();
	           finished = true;
            }
        });
    });
})();
