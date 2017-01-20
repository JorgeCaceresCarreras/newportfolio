$(document).ready(function() {
	

	$('#myAffix').affix({
	  offset: {
	    top: 100,
	    bottom: function () {
	      return (this.bottom = $('.footer').outerHeight(true))
	    }
	  }
	});

	$("#menu").hide();
    $("#btn-contenidos").unbind('click');
    $("#btn-contenidos").bind('click', function() {
        $("#menu").slideToggle("slow");
    });

	$(window).bind('orientationchange resize', function(){
	    $("#menu").hide();
	});

	$(window).scroll(function(){
	    //$("#menu").hide();
	});

	$(window).scroll(function(event){
	   var st = $(this).scrollTop();
	   if (st!=0){
	       $('#backtotop').fadeIn();
	   } else {
	       $('#backtotop').fadeOut();
	   }
	});
});

//Funcionamiento para IOS
var Scroll = function(){
    var ua = navigator.userAgent,
    isMobileWebkit = /WebKit/.test(ua) && /Mobile/.test(ua);

    if (isMobileWebkit) {
        $('html').addClass('mobile');
    }
    var iScrollInstance;
    $(function(){
        if (isMobileWebkit) {
            $('.img-background').css('background-attachment', 'scroll');
            $('.bg').css('background-attachment', 'scroll');
            iScrollInstance = new iScroll('wrapper');

            $('#scroller').stellar({
                scrollProperty: 'transform',
                positionProperty: 'transform',
                horizontalScrolling: false,
            });

        } else {
            $.stellar({
                horizontalScrolling: false,
            });
        }
    });

    return { 'iScrollInstance' : iScrollInstance };

}(); 