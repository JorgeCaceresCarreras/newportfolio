define([ "jquery", "LZString", "parameters", "smartresize", "decorator", "scorm/scorm", "ispring" ], function($, LZString, parameters, smartresize, decorator, scorm, ispring) {
    var localStorageIspring = {};
    var localStorageKey;
    var jsonIspringString = "";
    var iframe = null;
    var suspendData = null;
    var locationPage = "";
    var pagesVisited = new Array();
    var pagesStored = null;
    var scormActive = false;
    var lmsFinish = false;
    var courseLang = null;
    var launchCourse = false;
    var quizSlideNumber = -1;
    var ispringWindowContent;
    var eventIspringWindow = false;
    var initialize = function() {
        $(document).ready(function() {
            $(window).on("beforeunload unload", function() {
                if (ispringWindowContent) {
                    ispringWindowContent.close();
                }
                finishScorm();
            });
            initializeContent().done(function() {
                intializeAfterIspring();
            });
            ispring.init(onInitIspring);
        });
    };
    function intializeAfterIspring() {
        decorator.init(courseLang);
    }
    function initializeContent() {
        var navigatorLang = navigator.language;
        if (navigatorLang.indexOf("-") != -1) {
            navigatorLang = navigatorLang.split("-")[0];
        }
        if (parameters.arrayLang.indexOf(navigatorLang) != -1) {
            courseLang = navigatorLang;
        } else {
            courseLang = arrayLang[0];
        }
        //Inicializamos el SCORM
        initializeScorm();
        if (parameters.whereIspringContent == "window") {
            ispringWindowContent = window.open(courseName + "/" + courseLang + "/index.html", "contenido", "");
            $(ispringWindowContent).on("beforeunload unload", function() {
                if (eventIspringWindow) {
                    finishScorm();
                }
            });
        } else {
            var content = $(".ispring-responsive");
            iframe = $('<iframe id="ispring_content" allowfullscreen="true">');
            iframe.appendTo(content);
            return loadSpringContent(courseLang);
        }
    }
    function initializeScorm() {
        scorm.init(parameters.scormVersion, true);
        suspendData = {};
        var lessonStatus = null;
        var StudentPreferenceLanguage = "";
        //Returns Scorm Initialize
        scormActive = scorm.initializeWrapper();
        if (scormActive == "true") {
            //Set Start Time
            scorm.setStartTime();
            StudentPreferenceLanguage = scorm.getStudentPreference("language");
            if (StudentPreferenceLanguage != "") {
                courseLang = StudentPreferenceLanguage;
            } else {
                setCourseLang(courseLang);
            }
        }
    }
    function finishScorm() {
        if (scormActive == "true") {
            if (lmsFinish != "true") {
                scorm.setSessionTime();
                lmsFinish = scorm.finish();
            }
        }
    }
    function loadSpringContent(lang) {
        var dfd = new $.Deferred();
        setCourseLang(lang);
        if (parameters.whereIspringContent == "window") {
            ispringWindowContent.location.replace("../" + courseLang + "/index.html");
        } else {
            iframe.attr("src", "content/" + parameters.courseName + "/" + lang + "/index.html");
            iframe.on("load", function() {
                dfd.resolve("loaded");
            });
        }
        return dfd.promise();
    }
    function setCourseLang(lang) {
        courseLang = lang;
        scorm.setStudentPreference("language", lang);
    }
    function onInitIspring() {
        localStorageKey = ispring.getLocalStorageKey();
        if (scormActive == "true") {
            //Inicializamos el SCORM
            startSlide = initScorm(ispring.slidesCount());
            if (jsonIspringString != "") {
                localStorageIspring = JSON.parse(jsonIspringString);
                if (startSlide == 1) {
                    localStorageIspring.lastViewedSlide = 0;
                } else {
                    localStorageIspring.lastViewedSlide = startSlide - 1;
                }
                jsonIspringString = JSON.stringify(localStorageIspring);
                localStorage.setItem(localStorageKey, jsonIspringString);
            }
            /*if (!launchCourse) {
                //Modal para comenzar por donde se dejó
                var funcionContinuar = function() {
                    if (!$(this).data("continue")) {
                        player.view().playbackController().gotoSlide(0);
                    }
                    modal.css("display", "none");
                };
                var modal = $('<div class="modal" id="myModal">').append($('<div class="modal-content"></div>').append($('<p id="textoModal"></p>').text(textoModal.texto[courseLang])).append($('<div class="button-modal-container">').append($('<button data-continue="true">').text(textoModal.boton_si[courseLang]).click(funcionContinuar))).append($('<div class="button-modal-container button-modal-container-no">').append($('<button data-continue="false">').text(textoModal.boton_no[courseLang]).click(funcionContinuar))));
                Decorator.content.parent().prepend(modal);
                modal.css("display", "block");
            }*/
            launchCourse = true;
        }
        ispring.onSlideChange(onSlideChange);
        ispring.onClockTick(onClockTick);
    }
    function initScorm(numberOfSlides) {
        var continuePresentation;
        //Limpiamos el localStorage
        clearLocalStorage();
        if (scormActive == "true") {
            //Status
            lessonStatus = scorm.getCompletionStatus();
            if (lessonStatus == "not attempted" || lessonStatus == "unknown") {
                launchCourse = true;
                scorm.setCompletionStatus("incomplete");
                //Inicialize suspend_data
                initializeSuspendData(numberOfSlides);
                var arrayTemp = new Array();
                for (i = 0; i < numberOfSlides; i++) {
                    arrayTemp.push(0);
                }
                suspendData.v = arrayTemp.toString();
                suspendData.s = "";
                suspendData.p = [];
                suspendData.q = [];
                locationPage = 1;
                scorm.setLocation(locationPage);
                scorm.setSuspendData(suspendData);
            } else {
                suspendData = scorm.getSuspendData();
                locationPage = scorm.getLocation();
                //Obtenemos el localStorage de Ispring
                getIspringData();
            }
            pagesStored = suspendData.v;
            pagesVisited = pagesStored.split(",");
        }
        return locationPage;
    }
    function initializeSuspendData(numberOfSlides) {
        var arrayTemp = new Array();
        for (i = 0; i < numberOfSlides; i++) {
            arrayTemp.push(0);
        }
        suspendData.v = arrayTemp.toString();
        suspendData.s = "";
        suspendData.p = [];
        suspendData.q = [];
        locationPage = 1;
        scorm.setLocation(locationPage);
        scorm.setSuspendData(suspendData);
    }
    function clearLocalStorage() {
       localStorage.removeItem(ispring.getLocalStorageKey());
    }

    function getIspringData(){
     if (suspendData.s!=""){
        jsonIspringString = LZString.decompressFromBase64(suspendData.s);  
        jsonIspringString = jsonIspringString.replace(/'/g, "\"");
        localStorageIspring = JSON.parse(jsonIspringString);
      }
    }

    function onSlideChange(slideIndex) {
        currentSlide = slideIndex+1;
        setSlideLocation(currentSlide);
        nextSlide = (ispring.getPlaybackController().nextSlideIndex());
        currentSlideDuration = ispring.getPresentation().slides().getSlide(slideIndex).duration();
        if(ispring.getPresentation().slides().getSlide(slideIndex).type().toLowerCase() =="quiz"){
          quizSlideNumber = slideIndex;
        }
        decorator.setCompletionStatus(suspendData.v.split(','));
    }

    function onClockTick(clock) {
        var timeOffset = clock.timestamp().timeOffset();
        if (currentSlideDuration-timeOffset<0.1 || Math.ceil(currentSlideDuration)==Math.ceil(timeOffset)){            
            localStorageIspring = JSON.parse(localStorage.getItem(localStorageKey));
            pagesVisited[(currentSlide-1)] = "1";
            checkSetData();
        }
    }


    function setSlideLocation(slide){
        scorm.setLocation(slide);
    }

    function checkSetData(){
        if (pagesStored != pagesVisited.join(",")) {
            pagesStored = pagesVisited.join(",");
            setScormPageVisited();
            //checkIntervalCompleted();
        }
    }

    function setScormPageVisited(){
        setIspringData();
        suspendData.v = pagesVisited.toString();
        scorm.setSuspendData(suspendData);
        if(suspendData.v.lastIndexOf("0") < 0){
            lessonStatus = scorm.getCompletionStatus();
            if (lessonStatus != "completed" && lessonStatus != "failed" && lessonStatus != "passed"){
                scorm.setCompletionStatus("completed");
            }
        }
    }

    function setIspringData(){
        var jsonIspringString = JSON.stringify(localStorageIspring);
        jsonIspringString = jsonIspringString.replace(/\"/g, "'");
        suspendData.s =LZString.compressToBase64(jsonIspringString);
    }

    return {
        initialize: initialize
    };
});