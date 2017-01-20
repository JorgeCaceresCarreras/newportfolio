var openURL = "./init.html",
popup = null;

function isMoodleAPP() {
    // Entendemos que si es moodle, tiene el enlace de salir de la actividad 
    return $("#page-mod-scorm-player", parent.document).length > 0;
}

function backToCoursePage() {
    try {
        popup.focus(),
        popup.close()
        } catch(e) {}
    urlBack = getUrlCourse(),
    "" != urlBack && (window.top.location.href = urlBack)
    }
function getUrlCourse() {
    var e = "";
    return $(".breadcrumb li a", parent.document).each(function() {
        var o = $(this).parent().html(); - 1 != o.indexOf("http://") && (urlString = o.substring(o.indexOf("http://"), o.indexOf('"', o.indexOf("http://"))), -1 != urlString.indexOf("course/view.php") && (e = o.substring(o.indexOf("http://"), o.indexOf('"', o.indexOf("http://")))))
        }),
    e
}

function parseSearchData(search, data){
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

function MostrarMensaje(e) {
    var o = "_popup_block",
    n = "_course",
    r = "#message";
    "" != getUrlCourse() && (o += "_link_course", n = "_link_course"),
    e ? $(r + o).show() : ($(r + o).hide(), $(r + n).show())
    }
function redimensionaPopup() {
    var e = 1014;
    var o = 680;
    var n = (screen.availWidth - e );
    var m = (screen.availHeight - o );
    
    //popup.moveTo(2*n, 2*m),
    //popup.resizeTo(e, o)
    }
function Comprobar() {
    popup && 0 !== popup.outerHeight ? (MostrarMensaje(!1), redimensionaPopup()) : (MostrarMensaje(!0), setTimeout(Comprobar, 500))
    };
$(document).ready(function() {
    var doc_search = document.location.search;
    if (parseSearchData(doc_search, 'baseURL') != null)
        openURL = parseSearchData(doc_search, 'baseURL');
    //if(top.window.opener == null || isMoodleAPP()) {
        $(window).on("unload", function() {
            backToCoursePage()
        });
        $(".back_to_course").click(function() {
            return backToCoursePage(),
            !1
        });
    
    var e = 1014;
    var o = 680;
    var n = (screen.availWidth - e )/ 2;
    var m = (screen.availHeight - o )/ 2;
        popup = window.open(openURL + doc_search, "wContentUE", "height=680," + 
                                                                "width=1014," + 
                                                                "left=" + n +", top=" + m  + "," + 
                                                                "channelmode=no," + 
                                                                "directories=no," + 
                                                                "fullscreen=yes," + 
                                                                "location=no," + 
                                                                "menubar=no," + 
                                                                "resizable=no," + 
                                                                "status=no," + 
                                                                "titlebar=no," + 
                                                                "toolbar=no", !0);
//        popup = window.open(openURL + doc_search, "_blank", "height=768,width=1024", !0);
        setTimeout(Comprobar, 25)
    /*}
    else {
        var urlHref = document.location.protocol + "//" + document.location.host + document.location.pathname;
        var baseURLarr = urlHref.split('/');//split href at / to make array
            baseURLarr.pop();//remove file path from baseURL array
        var baseURL = baseURLarr.join('/')+ "/";//create base url for the images in this sheet (css file's dir)
        document.location.replace(baseURL + openURL + doc_search, false)
    }*/
    });