// jQuery QuickView

(function($){
    $.fn.quickview = function(options) {
        var defaults = {
            embedded: true,
            growTo: 'left',
            transitionTime: 400,
            navigation: 'persistent',
            caption: 'showMax' /*hidden, persistent, showMax, showMin */
        }
        $.extend(defaults, options);
		
        return this.each( function() {
            var $self = $(this);
            var current_index = 0;
			var fileType ='img';
			var player_height = 345;
			var player_width = 530;
            var multimedia_arr = new Array();
            var total_items;
            var enlarged = false;
            var container;
            var quickview;
            var holder;
            var nav;
            var zoom = 1;

            var imageObj = {
            	small: $(this).find('img').attr('src'),
            	large: $(this).find('a').attr('href')
            };
            console.log(imageObj);
            //Setting variables
            total_items = $self.children("li").size();
            //Zoom in
            var zoomIn = function(index) {
                if(zoom > 0) {
					//Hacemos crecer el holder
					holder.slideDown(defaults.transitionTime / 1.5);
					
					//Comprobamos que el índice se mantenga dentro de los límites del array
                    checkBoundaries(index);
					
					//Force display of icons
					if (zoom == 1){
						$('.nav .disminuir, .nav .aumentar', quickview).show();
					}
					else if(zoom == 2)
					{
						$('.nav .aumentar', quickview).hide();
						$('.nav .disminuir', quickview).show();
					}
					
                    //Hide current image
                    hideMultimedia();

                    //Load Caption
                    loadCaption();
                }
            }
            //Zoom out
            var zoomOut = function(index) {
                if(zoom > 0) {
                    checkBoundaries(index);
					//Force display of icons
					$('.nav .disminuir, .nav .aumentar', quickview).show();
					
                    //Hide current image
                    hideMultimedia();

                    //Load Caption
                    loadCaption();
                }
				else if(zoom == 0) {
					//Force display of icons
					$('.nav .aumentar', quickview).show();
					$('.nav .disminuir', quickview).hide();
					
					holder.slideUp(defaults.transitionTime/1.5);
                }
            };
            // Actualizar
            var updateData = function(index) {
                checkBoundaries(index);
				
				//Load Caption
                loadCaption();
				
				//Definimos nuevo estado de zoom dependiendo de si hay un thumb o no
				if(zoom == 1 && !multimedia_arr[current_index].thumb) { 
					zoom = 2;
					enlarged = true;
					zoomIn(current_index);
				}
				
				//Estado min
				if (zoom == 0) {
					$('.nav .aumentar', quickview).show();
					$('.nav .disminuir', quickview).hide();
				}
				//Estado thumb
				else if (zoom == 1) {
					$('.nav .disminuir, .nav .aumentar', quickview).show();
				}
				//Estado max
				else {
					$('.nav .disminuir', quickview).show();
					$('.nav .aumentar', quickview).hide();
				}
				
				//Modificación barra de navegación acorde al formato de archivo
				$('.nav .descargar', quickview).hide();
                $('.nav .disminuir', quickview).hide();
                $('.nav .aumentar', quickview).hide();
				$('.nav .flotar', quickview).hide();
				
				switch (getFileExtension(multimedia_arr[current_index].max)) {
					//Si es un formato permitido, mostramos la navegación clásica
					case 'jpg': case 'png': case 'gif': 
                        $('.nav .descargar', quickview).show();
    					if (!/(iPhone|iPod|BlackBerry|Android)/.test(navigator.userAgent)){	
                            $('.nav .aumentar', quickview).show();
                            $('.nav .disminuir', quickview).show();
                        }
					break;
					//Sino, quitamos max, min, ventana flotante y agregamos descargar
					default:
						$('.nav .flotar, .nav .disminuir, .nav .aumentar', quickview).hide();
						$('.nav .descargar', quickview).show();
					break;
				}
				
				//Ocultamos elemento multimedia actualmente visible
				hideMultimedia();
            };
            //load Captions
            var loadCaption = function() {
                $('.desc', nav).html(multimedia_arr[current_index].caption);
            };
            //Check Boundaries
            var checkBoundaries = function(index) {
                if (index >= total_items) {
                    current_index = 0;
                }
                else if (index < 0) {
                    current_index = total_items - 1;
                }
                else {
                    current_index = index;
                }
            };

            //Carga de las imágenes
            var loadImage = function() {
                //Determinamos que imagenes cargar
                 var url;
				
				if(enlarged) {
					var ext = getFileExtension(multimedia_arr[current_index].max);
					
					switch (ext) {
						//Formatos permitidos
						case 'jpg': case 'png': case 'gif': 
							url = multimedia_arr[current_index].max;

						var img = new Image();


	                    //var preloadIMG = multimedia_arr[current_index].thumb.replace(/_small/, '');
	                    var preloadIMG = imageObj.large;

						$(img).error(function(){
                            this.onerror = "";
                            this.src = multimedia_arr[current_index].max;
                            return true;
						}).load(function () {
                            $(this).hide();
                            container.html(this);
                            container.animate({
                                opacity: 0.7,
                                height: this.height,
                                width: this.width
                            }, defaults.transitionTime, function(){
                                showImage();
                            });
                        }).attr('src', preloadIMG);

						break;
								 
						//Si es un formato no soportado
						default:
							url = multimedia_arr[current_index].thumb;
						break;
					}
				}
				else {
					//url = multimedia_arr[current_index].thumb;
					url = imageObj.small;
					
                    var img = new Image();
                
                    container.parent().addClass('loading');
                                
                    $(img).load(function () {
                        $(this).hide();
                        container.html(this);
                        container.animate({
                            opacity: 0.7,
                            height: this.height,
                            width: this.width
                        }, defaults.transitionTime, function(){
                            showImage();
                      });
                    }).attr('src', url);
				}
            };
			
			
			//Carga de flash player
			var loadPlayer = function($target) {
				//Determinamos que elemento cargar
                var url = multimedia_arr[current_index].max;
				
				//Agregamos loader
				$target.parent().addClass('loading');
				
				//Creamos div vacío, será reemplazado por SWFObject para embeber el objeto Flash. Generamos un id específico
				var id = new Date().getTime();
				$target.html('<div id="'+id+'" />');
				
				var flashvars = {
					screencolor: '#f7f7f7',
					file: multimedia_arr[current_index].max,
					logo: null,
					autostart: false,
					image: multimedia_arr[current_index].thumb
				};
					
				var params = {
					allowfullscreen: 'true',
					wmode: 'transparent'
				};
					
				var attributes = {};
							
				swfobject.embedSWF("../core/swf/player.swf", id, multimedia_arr[current_index].width, multimedia_arr[current_index].height, "10.0.0","expressinstall.swf", flashvars, params, attributes);
				
				//Agrandamos container para que se vea el Player
				if ($target.hasClass('quickview-image')) showPlayer($target);
			}
			
			var showPlayer = function($target)
            {
                $target.animate({
                    opacity: 1,
					width: multimedia_arr[current_index].width,
					height: multimedia_arr[current_index].height
                }, defaults.transitionTime).removeClass('loading').fadeIn(defaults.transitionTime);
            }
			
			
            var showImage = function() {
                container.css({
                    height: container.height(),
                    width:  '100%'
                });
                container.animate({
                    opacity: 1
                }, defaults.transitionTime, function(){
                    $(this).removeClass('loading');
                    $(this).children().fadeIn(defaults.transitionTime, function(){
                    container.attr({
                        height: '100%',
                        width:  '100%'
                    });
                    container.css({
                        height: '',
                        width:  ''
                    });
                })
                });
            };
			var getFileExtension = function(filename) {
				return filename.split('.').pop();
			};
            var hideMultimedia = function() {
				if(enlarged) {	
					//Determinamos la acción a seguir según el formato de archivo
					var ext = getFileExtension(multimedia_arr[current_index].max);
					
					container.children().hide();
					
					switch (ext) {
						//Si es imagen
						case 'jpg': case 'png': case 'gif': 	
							fileType = 'img';
							loadImage();
						break;
							 
						//Si es un formato no soportado
						default:
							fileType = 'img';
							loadImage();
						break;
					}
				}
				else
				{
					loadImage();
				}
            };
			var resizeImg = function ($target, origWidth, origHeight) {
				var ratioW = $target.width()/origWidth;
				var ratioH = $target.height()/origHeight;
				
//				if(ratioW < ratioH)
//					$target.find('img')/*.width(origWidth*ratioW).height(origHeight*ratioW)*/;
//				else
//					$target.find('img')/*.width(origWidth*ratioH).height(origHeight*ratioH)*/;
				if(ratioW < ratioH)
					$target.find('img').width(origWidth*ratioW).height(origHeight*ratioW);
				else
					$target.find('img').width(origWidth*ratioH).height(origHeight*ratioH);
			};
			var resizeObject = function ($target, origWidth, origHeight) {
				var ratioW = $target.width()/origWidth;
				var ratioH = $target.height()/origHeight;
				
				if(ratioW < ratioH)
					$target.find('img')/*.width(origWidth*ratioW)*/.height(origHeight*ratioW);
				else
					$target.find('img')/*.width(origWidth*ratioH)*/.height(origHeight*ratioH);
			};
			var loadWindow = function(e) {
				var dialog_id = multimedia_arr[current_index].max;
				
				if (!$('.ui-dialog-content[id="'+dialog_id+'"]').closest('.ui-dialog').is(':visible')) {
					var ext = multimedia_arr[current_index].max;
					ext = multimedia_arr[current_index].max.substr(ext.lastIndexOf(".") + 1, ext.length);
						
					//Si se trata de una IMG
					if (ext == 'jpg' || ext == 'png' || ext == 'gif') {
						var img = new Image();

                        //var preloadIMG = dialog_id.replace(/_small/, '');
                        var preloadIMG = imageObj.large;

						$(img).error(function(){
                            this.onerror = "";
                            this.src = multimedia_arr[current_index].max;
                            return true;
						}).load(function () {
							var $target = $('<div id="'+dialog_id+'"></div>');
							var $temp = $('<div class="image-wrapper"></div>').wrapInner($(this));
							var origWidth = this.width;
							var origHeight = this.height;

							
							var popup = $target.append($temp)
							
							popup.dialog({
								title: multimedia_arr[current_index].title,
								width: this.width + 10 ,
								height: origHeight + 50,
								zIndex: 9999,
								open: function(e, ui) {
								    if(typeof(multimedia_arr[current_index].caption) != "undefined")
    									$(this).closest('.ui-dialog').append('<div class="ui-desc">'+multimedia_arr[current_index].caption+'</div>');
								},
								resize: function(event, ui) {
									var $target = $(this);
									resizeImg ($target, origWidth, origHeight);
								}
								
							});
							try {
    							popup.dialogExtend({
								"maximize" : true,
								"minimize" : true,
								"dblclick" : "",
								"icons" : {
								  "maximize" : "ui-maximizar",
								  "minimize" : "ui-minimizar",
								  "restore" : "ui-restaurar"
								},
								"events" : {

									"minimize" : function(){
										$target.next().hide();
									},
									"maximize" : function(){
										var $target = $(this);
										resizeImg ($target, origWidth, origHeight);
										$(this).dialog("option",{
											"position": [0, 0]		   
										});
										$target.next().show();
									},
									"restore" : function(){
										var $target = $(this);
										resizeImg ($target, origWidth, origHeight);
										$(this).dialog("option",{
											"position": ['center', 'center']		   
										});
										$target.next().show();
									}
								}
							  });
							} catch (ex) {}
						}).attr('src', preloadIMG);
						
					}
				}
			};

            $self.find('li').each(function(i) {
                multimedia_arr[i] = new Array();
                multimedia_arr[i].max       = $(this).find('a').attr('href');
                multimedia_arr[i].title     = $(this).find('img').attr('title');
                multimedia_arr[i].caption   = $(this).find('img').attr('desc');
                multimedia_arr[i].thumb     = ($(this).find('img').attr('src')!="") ? ($(this).find('img').attr('src')) : null;
				multimedia_arr[i].width     = ($(this).find('a').attr('width')) ? $(this).find('a').attr('width') : null;
				multimedia_arr[i].height    = ($(this).find('a').attr('height')) ? $(this).find('a').attr('height') : null;
            });
			
            //Creamos el holder principal
            container = $('<div class="quickview-image"></div>');
            quickview = $('<div class="quickview" />');
            holder = $('<div class="quickview-holder"></div>');
            nav = $('<div class="nav"><div class="desc"></div><a href="#nogo" class="flotar" title="Abrir ventana flotante"><span>Flotar</span></a><a href="#nogo" class="descargar" title="Descargar"><span>Descargar</span></a><a href="#nogo" class="disminuir" title="Disminuir"><span>Disminuir</span></a><a href="#nogo" class="aumentar" title="Aumentar"><span>Aumentar</span></a><a href="#nogo" class="siguiente next-prev" title="Siguiente"><span>Siguiente</span></a><a href="#nogo" class="anterior next-prev" title="Anterior"><span>Anterior</span></a><div class="clear-fix"></div></div>');
            
            holder.append(container);
            quickview.append(holder).append(nav);
            $self.after(quickview);

            if(multimedia_arr.length < 2) {
                $self.next().find('.next-prev').remove();
            }
			
            //Eventos de navegacion
            $('.anterior', nav ).bind('click', function(e) {
                e.preventDefault();
                updateData(current_index - 1);
            });
            $('.siguiente', nav).bind('click', function(e) {
                e.preventDefault();
                updateData(current_index + 1);
            });
            $('.disminuir', nav).bind('click', function(e) {
                e.preventDefault();
                if(zoom == 1 || !multimedia_arr[current_index].thumb) {
					zoom = 0;
				}
				else if(zoom == 2) {
                    zoom = 1;
                }

				enlarged = false;
				zoomOut(current_index);
            });
            $('.aumentar', nav).bind('click', function(e) {
                logConsole("BIND:", 'click aumentar');
                e.preventDefault();
                if(zoom == 1 || !multimedia_arr[current_index].thumb) {
                    zoom = 2;
                    enlarged = true;
                    zoomIn(current_index);
                }else if(zoom == 0){
                   	zoom = 1;
                   	enlarged = false;
                    zoomIn(current_index);
                }
            });
			$('.descargar', nav).bind('click', function(e) {
                e.preventDefault();
                window.open(multimedia_arr[current_index].max,'_blank');
            });
			//Ventana flotante
			$('.flotar', nav).bind('click', function(e) {
               //Impedimos burbuja
			   e.preventDefault();

               //Abrimos ventana
			   loadWindow(e); 

            });
			
            /* Initialize*/
            updateData(0);
			
        });
    };
})(jQuery);

jQuery('head').append('<style type="text/css"> .quickview-thumbs { position: absolute; top: -1000em; left: -1000em; } </style>');
