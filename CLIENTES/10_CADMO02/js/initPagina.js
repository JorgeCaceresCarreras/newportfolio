var _DEBUG = !1,
alertFallback = !0; ("undefined" == typeof console || "undefined" == typeof console.log) && (console = {}, console.log = alertFallback ? function(i) {
    _DEBUG && alert(i)
    }: function() {});

var initPagina = (function() {

	config_mapa_sensible = {
        fillOpacity:    .2,
        stroke:         !0,
        strokeColor:    "f59c12",
        strokeOpacity:  1,
        strokeWidth:    2,
        singleSelect:   !1,
        scaleMap:       true,
        isDeselectable: !1
    };

	function existeElemento(clase, section) {
		var salida = false;
		var elementos = section.find($('.' + clase));
		if(elementos.length > 0) salida = true;
		var elementos = section.find($('#' + clase));
		if(elementos.length > 0) salida = true;
		return salida;
	}

	function init(section) {
		if(existeElemento('prettyprint', section)){
	        prettyPrint(null, section[0]);
	    }

	    if(existeElemento('tabla-dinamica', section)) {
	    	section.find('.tabla-dinamica th').click(function() {
	    		var table = $(this).closest('table');
	    		var thactives = $(table).find('th.active');
	    		for (var i =0; i<thactives.length; i++) {
	    			$(thactives[i]).removeClass('active');
	    		}
	    		$(this).addClass('active');
	    		var id = $(this).data('id');
	    		var divactives = $(table).find('td>div.active');
	    		for (var i =0; i<divactives.length; i++) {
	    			$(divactives[i]).removeClass('active');
	    		}
	    		$(table).find('td>div[data-id=' + id + ']').addClass('active');
	    	});
	    }

	    if(existeElemento('carousel-auto', section)) {
	    	section.find('.carousel-auto').carousel({
				interval: 5000
			});
	    }

	    if(existeElemento('open-popup-link', section)) {
		    section.find(".open-popup-link").magnificPopup({
		        type: "inline"
		    });
		}

		if (existeElemento('cp-jplayer', section)) {
			var players = section.find('.cp-jplayer');
			for (var i=0; i<players.length; i++) {
				var mp3 = $(players[i]).data('audio');
				var date = new Date();
				var idContainer = 'cp-cont-'+date.getTime();
				$(players[i]).parent().find('.cp-container').attr('id', idContainer);
				var player = new CirclePlayer(
					players[i],
					{
						'mp3': mp3
					},
					{
						swfPath: "vendor/circleplayer/js",
						supplied: "mp3",
						cssSelectorAncestor: '#'+idContainer
					}
				);
			}
		}

		if (existeElemento('video', section)) {
			var ancho = $('.video').innerWidth();
        	var alto = ancho*9/16;
        	var calcularAncho = function() {
	            ancho = $('.video').innerWidth();
    	        alto = ancho*9/16;
    	        $( "div[id^='video_']" ).jPlayer({'size': {'width': ancho+'px', 'height': alto+'px'}});
    	        colocarPlay();
        	}
        	function colocarPlay () {
        		var capaPlay = section.find('.jp-video-play');
        		var capa360p = section.find('.div.jp-video-360p');
        		var mitadAlto = alto+'px';
        		capaPlay.css({ 'margin-top': '-'+mitadAlto, 'height': mitadAlto });
        	}
			$(window).on('resize', calcularAncho);

			var players = section.find('.jp-jplayer');
			for (var i=0; i<players.length; i++) {
				var video_base = $(players[i]).attr('data-file');
				var date = new Date();
				var idContainer = date.getTime();
				$(players[i]).parent().parent().attr('id', 'jp-cont-'+idContainer);
				$(players[i]).attr('id', 'video_'+idContainer);
				var videoPlayer =  $('#video_'+idContainer).jPlayer({
					ready: function() {
	                	$(this).jPlayer('setMedia', {
							mp4: video_base+'.mp4',
	                    	m4v: video_base+'.m4v'
						});
					},
					cssSelectorAncestor: "#jp-cont-"+idContainer,  
		            swfPath: "vendor/jQuery.jPlayer.2.6.0/",
		            solution: "html, flash",
		            supplied: "m4v,mp4",
		            size: {
		              width: ancho+"px",
		              height: alto+"px",
		              cssClass: "jp-video-360p"
		            },
		            smoothPlayBar: true,
		            keyEnabled: true,
		            remainingDuration: true,
		            toggleDuration: true,
		            play: function(event) {
		                $('.video').css('visibility', '');
		                calcularAncho();
		            }
				});
				colocarPlay();
			}
		}
		if (existeElemento('centerBtnInteractivo', section)) {
			section.find(".centerBtnInteractivo").each(function() {
				var className = $(this).parent().attr('class').split(" ")[0];
				if (className=="col-md-6"){
					classCol = $(this).attr('class').split(" ")[0];
					numCol = 2*parseInt(classCol.substr(classCol.lastIndexOf("-")+1));
					$(this).removeClass(classCol).addClass("col-md-"+numCol);
				}
			});
		}

		if (existeElemento('tabs-imagenes', section)) {
			section.find(".tabs-imagenes").each(function() {
		        var i = $(this).find("div.tabs-imagenes-mobile"),
		        a = this;
		        $(a).find("ul.nav-pills li a").each(function() {
		            var n = $(this).find("img").attr("src"),
		            imgClass = $(this).find("img").attr('class'),
		            t = $(a).find($(this).attr("href")),
		            e = $(this).find(".cajaTextoPills");
		            $(i).append($("<div>").addClass("contenedor-pill-mobile").addClass("clearfix").append($("<div>").addClass("imagen").append($("<img>").attr("src", n).attr("class", imgClass))).append($("<div>").addClass("texto").append($("<p>").addClass("negrita").addClass("titulo-pill-mobile").html(e.html())).append(t.html())))
	            })
	        });
		}
		
	    if (existeElemento('cajaImagenRoll', section)) {
	    	(function(){
	    		var t = [], e = 0;
	    
			    $(".cajaImagenRoll").each(function() {
			        var i = "i_" + e;
			        $(this).attr("id", i),
			        t[i] = $(this).html(),
			        e++
			    });	
			    $(".cajaImagenRoll").each(function() {
		            var i = $(this).attr("id");
		                $(this).find(".flippyOff").css({'width' : '100%'});
		                $(this).html(t[i]),
		                $(".flippyOff").bind('click', function() {
		                    a(this);
		                });
		        })
		        function a(i) {
			        $(i).flippy({
			            verso: $(i).parent().find(".flippyContent").html(),
			            duration: 500,
			            direction: "LEFT",
			            onReverseFinish: function(){
			                $(this.jO).css({'width' : '100%'});
			            },
			            onFinish: function() {
			                $(this.jO).css({'width' : '100%'});
			                $(i).unbind('click');
			                $(i).bind('click', function() {
			                    $(i).flippyReverse();
			                });
			            }
			        })
			    }	
	    	})();
	    }
	    
	    if(existeElemento('mapa-sensible', section)) {
	    	section.find(".mapa-sensible img[usemap]:visible").one('load', function(){
	    		$(this).mapster(config_mapa_sensible).mapster("set", !1, "all");
	    	});

	  		if($("div[id*='mapster']>img[usemap]").length > 0) {
	            $(".mapa-sensible img[usemap]").css({'height':'auto', 'width':'auto'});
	            var width;
	            for (i=0; i<$("div[id*='mapster']>img[usemap]").length; i++){
	                if ($(".mapa-sensible img[usemap]")[i].naturalHeight != undefined) {
	                    width   = $(".mapa-sensible img[usemap]")[i].naturalWidth;
	                } else {
	                    var image = new Image(); // or document.createElement('img')
	                        image.onload = function() {
	                            width = this.width;
	                            height = this.height;
	                        };
	                        image.src = $(".mapa-sensible img[usemap]")[i].attr("src");
	                }
	                var mapSensibleBorder = $(".mapa-sensible.bordeDinamicas")[i];
	                var _width = $(mapSensibleBorder).width();
	                var mapSensibleImg = $(".mapa-sensible img[usemap]")[i];
	                $(mapSensibleImg).mapster('resize', (_width > width) ? width : _width, 0, 0);
	            }
	        }
	    }
	    
	    if(existeElemento('dialogo', section)) {
	    	section.find(".dialogo").popover({
		        trigger: "click",
		        placement: 'auto right'
		    });
		    
		    section.find(".dialogo").bind('click', function() {
		        //_orientationHandler(true);
		        return $(".dialogo").not($(this)).popover("hide"),
		        !1
		    });
		    
		    //$("a,select").not(".dialogo, [class^=\"translator-language\"], [class=\"cp-play\"], [class=\"cp-pause\"], [class=\"descargar\"], [class=\"disminuir\"], [class=\"aumentar\"], [class=\"siguiente\"], [class=\"anterior\"]").unbind('click focus');
		    section.find("a,select").not(".dialogo").bind("click focus", function() {
		        $(".dialogo").popover("hide");
		        //_orientationHandler(true);
		    });

		    section.find(".dialogo").on('shown.bs.popover', function(){
		        section.find('.math-formula').each(function(index){
		            MathJax.Hub.Queue(["Typeset",MathJax.Hub,this]);
		            var that = this;
		            MathJax.Hub.Queue(["Typeset",MathJax.Hub,this], function(){
		                $(that).css('visibility', 'visible');
		            });
		        })
		    });
	    }

	    if(existeElemento('timeline_landscape', section)) {
	        $timelineactivo=!1;
	        section.find(".timeline-item-title").on("click", function() {
	            $timelineactivo && (elementActivo = $timelineactivo.attr("data-target"), elementActivo == $(this).attr("data-target") ? $(elementActivo) : $(elementActivo).collapse("hide")), $timelineactivo = $(this)
	        });
	        var selectedItem = 1;
	        $(window).resize(function(){
	        selectedItem = section.find('#dates a.selected').attr('data-item');
	        
	            $().timelinr({
	                startAt: selectedItem,
	                arrowKeys: 'true',
	                autoplay: true
	            })
	        });
	        
	        setTimeout(function(){   
	            $().timelinr({
	                arrowKeys: true,
	                autoplay: true
	            });
	            section.find('.timeline_landscape').css('visibility', 'visible');
	        }, 500);
	        
	        setTimeout(function(){selectedItem = section.find('#dates a.selected').attr('data-item');},600);
	    }

	    if (existeElemento("hotspot", section)) {
        
	        var imagen = section.find('.hotspot .caja-imagen-hotspot img');

	        

	        imagen.load(function(){
	        	var imagenNatural = new Image();
	        	imagenNatural.src = imagen.attr('src');
	        	var relacion = imagen.width()/imagenNatural.width;

		        section.find('.caja-opcion-hotspot').each(function(){
		            $(this).attr('data-original-left', $(this).css('left'));
		            $(this).css('left', $(this).css('left').replace('px','')*relacion);
		            $(this).attr('data-original-top', $(this).css('top'));
		            $(this).css('top', $(this).css('top').replace('px','')*relacion);
		            $(this).attr('data-original-width', $(this).css('width'));
		            $(this).css('width', $(this).css('width').replace('px','')*relacion);
		        });

		        section.find('.icono-mas-hotspot').each(function(){
		            $(this).attr('data-original-left', $(this).css('left'));
		            $(this).css('left', $(this).css('left').replace('px','')*relacion);
		            $(this).attr('data-original-top', $(this).css('top'));
		            $(this).css('top', $(this).css('top').replace('px','')*relacion);
		        });

		        section.find('.caja-resultado-hotspot').each(function(){
		            $(this).attr('data-original-left', $(this).css('left'));
		            $(this).css('left', $(this).css('left').replace('px','')*relacion);
		            $(this).attr('data-original-top', $(this).css('top'));
		            $(this).css('top', $(this).css('top').replace('px','')*relacion);
		            $(this).attr('data-original-width', $(this).css('width'));
		            $(this).css('width', $(this).css('width').replace('px','')*relacion);
		        });

	        });

	        section.find('div[data-boton]').click(function(){
	            if($(this).hasClass('activo')) {
	                ocultar($(this));
	                $(this).removeClass('activo');
	                $(this).css('padding-left','4px');
	            } else {
	                var id = $(this).attr('data-boton');
	                var modelo = $(this).parent().parent();
	                var capa = modelo.find("div[data-resultado='"+id+"']");

	                //Ocultar todos los que estén desplegados
	                modelo.find('div[data-boton]').each(function(){
	                    ocultar($(this));
	                });
	                
	                $(this).css({'z-index': '2001'});
	                rotate($(this).find('div'), 45);
	                $(this).css('padding-left','3px');
	                
	                capa.css({'z-index': '2000'});
	                capa.show('slow');
	                $(this).addClass('activo');
	            }
	        });

	        function ocultar($elemento) {
	            rotate($elemento.find('div'), 0);
	            var id = $elemento.attr('data-boton');
	            var modelo = $elemento.parent().parent();
	            var capa = modelo.find("div[data-resultado='"+id+"']");
	            capa.hide();
	            $elemento.css({'z-index': ''});
	            capa.css({'z-index': ''});
	        }

	        function rotate($elemento, grados) {
	            
	            $($elemento).css(
	                    {
	                        '-webkit-transform' : 'rotate('+ grados +'deg)',
	                        '-moz-transform' : 'rotate('+ grados +'deg)',
	                         '-ms-transform' : 'rotate('+ grados +'deg)',
	                         'transform' : 'rotate('+ grados +'deg)'
	                    }
	                );
	        }
	    }
	    //Modelo pestañas galería
		if (existeElemento("tabs2", section)) {
	        section.find('.tabs2 .contenedor-tabs2').carousel({
	            interval: false,
	        });

	        //Versión móvil del modelo de pestañas 2
	        function tabs2_2_expanded(element)
	        {
	            var listado = $('<ul>', {'class': 'nav nav-pills cajas-pill'});
	            var target = $('<div>', {'class' : 'visible-xs'}).append(
	                $('<div>', {'class': 'pill-carousel clearfix'}).append(
	                    listado
	                )
	            );

	            

	            element.find('li a').each(function(index, value){
	                //var textos_slides = element.find('.contenedor-tabs2 .carousel-caption p');
	                var textos_slides = element.find('.contenedor-tabs2 .carousel-caption');
	                $(textos_slides[index]).find('li').each(function(){
	                    if ($(this).children().children().length>0){
	                        $(this).children().children().unwrap();   
	                    }else{
	                        var paragraphText = $(this).children().html()
	                        $(this).children().remove();
	                        $(this).append(paragraphText);
	                    }
	                });
	                listado.append(
	                    $('<li>', {'class': 'cajas-pill-mobile2'}).append(
	                        $('<div>', {'class': 'row'}).append(
	                            $('<div>', {'class': 'col-xs-12'}).append(
	                                $('<img>', {'style': 'width:100%', 'src': $(value).find('img').attr('src')})
	                            )
	                        ).append(
	                            $('<div>', {'class': 'txt-caja-pill', 'text': $(value).find('.txt-caja-pill').html()})
	                        ).append(
	                            //$('<p>', {'html': $(textos_slides[index]).html()})
	                            $('<div>', {'html': $(textos_slides[index]).html()})
	                        )
	                    )
	                )
	            });

	            target.appendTo(element);
	        }


	        section.find(".tabs2").each(function(){
	            tabs2_2_expanded($(this));
	        });
	    }
	}

	function resizeHotspot(hotspot, imagen) {
		var imagenNatural = new Image();
    	imagenNatural.src = imagen.attr('src');
    	var relacion = imagen.width()/imagenNatural.width;


        hotspot.find('.caja-opcion-hotspot').each(function(){
            $(this).css('left', $(this).attr('data-original-left').replace('px','')*relacion);
            $(this).css('top', $(this).attr('data-original-top').replace('px','')*relacion);
            $(this).css('width', $(this).attr('data-original-width').replace('px','')*relacion);
        });

        hotspot.find('.icono-mas-hotspot').each(function(){
            $(this).css('left', $(this).attr('data-original-left').replace('px','')*relacion);
            $(this).css('top', $(this).attr('data-original-top').replace('px','')*relacion);
        });

        hotspot.find('.caja-resultado-hotspot').each(function(){
            $(this).css('left', $(this).attr('data-original-left').replace('px','')*relacion);
            $(this).css('top', $(this).attr('data-original-top').replace('px','')*relacion);
            $(this).css('width', $(this).attr('data-original-width').replace('px','')*relacion);
        });
	}

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
		if (existeElemento('hotspot', $(document))) {
			var hotspots = $('.hotspot');
			for (var i=0; i<hotspots.length; i++) {
				var hotspot = $(hotspots[i]);
				var imagen = hotspot.find('.caja-imagen-hotspot img');
				resizeHotspot(hotspot, imagen);
			}
		}
	}

	$(window).resize(onResize);
	//Fin de redimensión de pantalla

	return {
		'init': init
	}
})();