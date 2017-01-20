var CargaIni = (function(initPagina){
    if(typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
          return this.replace(/^\s+|\s+$/g, ''); 
        }
    }
    var headHeight = null;
    var estructura = null;
    var lastLoadedPage = 0;
    var basePath = 'content/deployed';

    //Número de secciones a cargar, si es false se descargan todas. 
    var numberOfSectionsToLoad = false;
    var suspendData = null;
    var location = "";
    var pagesVisited = new Array();
    var pagesStored = null;
    var scorm_APIWrapper = null;
    var scorm = null;
    var scormActive = false;
    var lmsFinish = false;
    var scormVersion="1.2";

    $(document).ready(function(){
        headHeight = $('header').height();
        setMenuHeight();

        //Redimensión de pantalla
        var rtime = new Date(1, 1, 2000, 12,00,00);
        var timeout = false;
        var delta = 200;
        function onResize() {
            rtime = new Date();
            if (timeout === false) {
                timeout = true;
                setTimeout(isResizeEnd, delta);
            }
        }

        function isResizeEnd() {
            if (new Date() - rtime < delta) {
                setTimeout(isResizeEnd, delta);
            } else {
                timeout = false;
                onResizeEnd();
            }
        }

        function onResizeEnd() {
            setMenuHeight();
        }

        $(window).resize(onResize);
    });


    function setMenuHeight() {
        var height = $(window).height() - headHeight;
        $('#menu').css('max-height', height+'px');
    }

    function parseSearchData(data){
        var search = document.location.search;
        var aSearch = unescape(search).split("&");
        for (var i = 0; i < aSearch.length; i++){
            var sVar = aSearch[i].split("=");
            var param = sVar[0].indexOf("?") != -1 ? sVar[0].substring(sVar[0].indexOf("?") + 1): sVar[0];
            var value = sVar[1];
            if (param.toLowerCase() == data.toLowerCase()){
                return value;
            }
        }
        return null;
    }

    function populateMenu() {
        var ulmenu = $('menu ul');
        
        for (var i=0; i<estructura.paginas.length; i++) {
            var pagina = estructura.paginas[i];
            var link = $('<a>')
                    .attr('href', '#')
                    .attr('data-menu-id', pagina.id)
                    .text(pagina.titulo)
                    .click(scrollToId);
            ulmenu.append($('<li>').append(link));
        }
    }

    function populateTitle() {
        var title = $('h1');
        title.text(estructura.titulo);
    }

    function parseEstructura(data) {
        var xmlDoc = data;
        if(!data || !data.documentElement) {
            if(window.DOMParser) {
                var parser = new DOMParser();
                try {
                    xmlDoc = parser.parseFromString(data.responseText, "text/xml");
                } catch (e) {};
            } else {
                xmlDoc = data.responseXML;
            }
        }
        estructura = {};
        var xml = $(xmlDoc);
        estructura['titulo'] = xml.find('modulo').attr('nombre');

        var paginas = [];
        var apartados = $(xmlDoc).find('apartado');
        for (var i=0; i<apartados.length; i++) {
            var apartado = $(apartados[i]);
            var pagina = {
                'titulo' : apartado.attr('nombre'),
                'id' :  apartado.attr('uniqid'),
                'file' : apartado.find('pagina').attr('nombrefichero')
            };
            paginas.push(pagina);
        }

        estructura['paginas'] = paginas;
        if (!numberOfSectionsToLoad) {
            numberOfSectionsToLoad = paginas.length;
        }
    }

    var pathContents = basePath+(parseSearchData('pathContents')?parseSearchData('pathContents'):'/modelos/');

    var requestEstructura = $.get(pathContents+'estructura.xml');
    
    requestEstructura.done(function(data) {
        parseEstructura(data);
        populateMenu();
        populateTitle();
    });

    $(window).scroll(function(){
        if  (($(document).height() - $(window).height() - $(window).scrollTop()) < 100) {
            if (lastLoadedPage < estructura.paginas.length){
                AddMoreContent();
            }
        }
        checkScormSection();
    });
    
    $(window).load(function(){
        requestEstructura.then(initScorm).then(AddMoreContent);
    });
    
    $(window).on('beforeunload unload', function(){
        finishScorm();
    });    

    function initScorm(){
        scorm_APIWrapper = Module_Scorm_APIWrapper(scormVersion,true);
        scorm = Module_Scorm(scorm_APIWrapper);
        suspendData = {};
        var lessonStatus = null;

        //Returns Scorm Initialize
        scormActive = scorm_APIWrapper.initialize();
        if (scormActive=="true"){

            //Set Start Time
            scorm.setStartTime();
            //Status
            lessonStatus = scorm.getCompletionStatus();
            if (lessonStatus == "not attempted") {
                scorm.setCompletionStatus("incomplete");
                //Inicialize suspend_data
                var arrayTemp = new Array();
                for (i=0; i<estructura['paginas'].length; i++){
                    arrayTemp.push(0);
                }
                suspendData.v = arrayTemp.toString();
                suspendData.i = "0";
                suspendData.q = [];
                location = estructura['paginas'][0].id;
                scorm.setLocation(location);
                scorm.setSuspendData(suspendData);
            }else{
                location = scorm.getLocation();
                suspendData = scorm.getSuspendData();
                scrollToId(null, location);
            }    
            pagesStored = suspendData.v;
            pagesVisited = pagesStored.split(",");
            setInterval(function(){ checkSetData(); }, 1000);
        }
    }
 
    function finishScorm () {
        if (scormActive=="true"){
            if (lmsFinish!="true"){
                setScormData();
                scorm.setSessionTime();
                lmsFinish = scorm_APIWrapper.finish();    
            }
        }
    }

    function checkScormSection(){
        var section = new Array();
        var heightTop = $(window).height()+$(this).scrollTop();
        var sectionHeight=0;
        var lessonStatus ="";
        if (scormActive=="true"){
            //suspendData = scorm.getSuspendData();
            pagesVisited = suspendData.v.split(",");
        }
        //get Section info
        $('section.img-background').each(function(){
            section.push({"dataId": $(this).attr('data-id'), "height": $(this).height()})
        });
        //sort section by dataId
        function sortSection(a,b) {
          if (a.dataId < b.dataId)
            return -1;
          if (a.dataId> b.dataId)
            return 1;
          return 0;
        }
        section.sort(sortSection);
        
        for (var i=0; i<section.length; i++){
            sectionHeight+=parseInt(section[i].height);
            if (heightTop>sectionHeight){
                location = section[i].dataId;
                if (pagesVisited[i]!="1"){
                    pagesVisited[i] = "1";
                    //SCORM Active send Information
                    //setScormData();
                }
            }
        }
    }

    function checkSetData(){
        if (pagesStored != pagesVisited.join(",")){
            pagesStored = pagesVisited.join(",");
            setScormData();
        }
    }

    function setScormData(){
        if (scormActive=="true"){
            if (location!=""){
                scorm.setLocation(location);    
            }
            suspendData.v = pagesVisited.toString();
            scorm.setSuspendData(suspendData);

            if(suspendData.v.lastIndexOf("0") < 0){
                lessonStatus = scorm.getCompletionStatus();
                if (lessonStatus != "completed" && lessonStatus != "failed" && lessonStatus != "passed"){
                    scorm.setCompletionStatus("completed");
                }
            }
        }
    }

    function AddMoreContent() {
        var d = new $.Deferred();

        var deferreds = [];
        
        var lastLoadedPageOriginal = lastLoadedPage;
        for (var i=0; i < numberOfSectionsToLoad && lastLoadedPage < estructura.paginas.length; i++) {
            deferreds.push($.get(pathContents+estructura.paginas[lastLoadedPage].file));
            lastLoadedPage++;
        }

        $.when.apply($, deferreds).done(function(){
            var contenedorPrincipal = $('#contenedor-principal');
            if (deferreds.length==1) {
                arguments = [arguments];
            }

            for (i = 0; i < arguments.length; i++) {
                var data = arguments[i][0]; //De cada argumento el primer elemento del array es el data de la petición
                (function(i){
                    lastLoadedPageOriginal++;
                    var nPage = lastLoadedPageOriginal - 1;
                    var section = $(data.trim()).attr('data-id', estructura.paginas[nPage].id);
                    section.appendTo(contenedorPrincipal);
                    initPagina.init(section);
                    
                })(i)
            }
            
            //Reactivamos los plugins de parallax
            $(window).data('plugin_stellar').destroy();
            $(window).data('plugin_stellar').init();
            if(Scroll.iScrollInstance ==! undefined) {
                Scroll.iScrollInstance.refresh();    
            }
            d.resolve();
        });
        return d.promise();
    }

    function scrollToId(event,id) {
        $("#menu").hide();
        if(event!=null){
            var li = $(event.currentTarget);
            id = li.data('menu-id');
        }
        var offset = $('[data-id="'+id+'"]').offset();
        if (typeof offset != 'undefined')
        {
            $('html, body').animate({
                scrollTop: offset.top-headHeight
            }, 2000);    
        }
        while(typeof offset == 'undefined' && lastLoadedPage < estructura.paginas.length)
        {
            AddMoreContent().done(function(){
                offset = $('[data-id="'+id+'"]').offset();
                if (typeof offset != 'undefined')
                {
                    offsetNotChange();
                    $('html, body').animate({
                        scrollTop: offset.top-headHeight
                    }, 2000);
                }
            });

        }
        if(event!=null){
           event.preventDefault();
       }
    }

    function offsetNotChange(id, time, increment)
    {
        var currentTime = (new Date()).getTime();
        var endTime = currentTime+time;

        var offset = $('[data-id="'+id+'"]').offset();
        for (var i = currentTime; i < endTime; i = i+increment) {
            var newOffset = $('[data-id="'+id+'"]').offset();
            if ((newOffset-offset)<0.0001) {
                return "";
            } else {
                offset = newOffset;
            }
        }
        return "";
    }

    return {
        'estructura' : estructura,
    }
})(initPagina);