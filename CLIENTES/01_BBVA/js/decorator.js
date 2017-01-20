define(['thumb', 'parameters', 'ispring', 'jquery', 'screenfull'], function(thumb, parameters, ispring, $, sf){
    var $controlPanel = $('.controlPanel');
    var controlPanelHeight = $controlPanel.height();
    var player;
    var playbackController;
    var presentationDimensions = {};
    var maxNestingLevel = parameters.maxNestingLevel;
    var progress = 0;
    var totalSlides = 0;
    var courseLang;
    var $display;

    var slides = [];
    var authorizedNestingSlides = [];

    function init(courseLng) {
        courseLang = courseLng;
        player = ispring.getPlayer();
        playbackController = player.view().restrictedPlaybackController();
        $display = $(player.view().displayObject());
        presentationDimensions = {
            'width': player.presentation().slideWidth(),
            'height': player.presentation().slideHeight()
        }
        resizeLayers();
        resizeIframe();
        $(window).smartresize(resizeLayers);
        setButtons();
        ispring.onSlideChange(slideChange);
    }

    function loadThumbnails()
    {
        //Precarga de thumbnails
        var promises = [];
        for (var i=0; i<authorizedNestingSlides.length; i++) {
            (function(index) {
                var promise = thumb.createAsync(authorizedNestingSlides[index].index()+1, courseLang);
                promise.done(function(data){
                    authorizedNestingSlides[index].thumbnail = data;
                });
                promises.push(promise);
            })(i);
        }
        return $.when.apply(undefined, promises);
    }

    function setButtons()
    {
        for (var i=0; i < player.presentation().slides().count(); i++) {
            var ISlide = player.presentation().slides().getSlide(i);
            //Obtenemos los slides de primer nivel y se añaden los hijos.
            if (ISlide.nestingLevel()==0) {
                setSlideChildren(ISlide);
                slides.push(ISlide);
            }
        }

        for (var i=0; i < player.presentation().slides().count(); i++) {
            var ISlide = player.presentation().slides().getSlide(i);
            //Obtenemos los slides de primer nivel y se añaden los hijos.
            if (ISlide.nestingLevel()<=maxNestingLevel) {
                totalSlides++;
                authorizedNestingSlides.push(ISlide);
            }
        }
        
        

        //Activación de la funcionalidad de fullscreen cuando está disponible
        if (screenfull.enabled) {
            var button = $('.buttons .fullscreen');
            button.on('click', function() {
                screenfull.toggle(); 
            });
            button.show();
        }

        $('.button.forward').on('click', function() {
            var index = getNextSlideIndex();
            playbackController.gotoSlide(index);
        });

        $('.button.backward').on('click', function() {
            var index = getPrevSlideIndex();
            playbackController.gotoSlide(index);
        });

        loadThumbnails().then(function(data) {
            if (!is_touch_device()) {
                $('.progressBar').hover(progressBarOnHoverIn, progressBarOnHoverOut);
                $('.progressBar').mousemove(progressBarOnMousemove);
            } else {
                populateMenu();
                $('.menu-toogle').show();
            }
        });
    }

    function slideChange(slideIndex) {
        $('.pagination').show();
        $('.pagination .total').text(totalSlides);
        
        var ISlide = player.presentation().slides().getSlide(slideIndex);
        var page = getSlidePage(ISlide);
        
        $('.pagination .current').text(page);

        progress = (page)*100/totalSlides;
        $('.progressBar .progress').css({width: progress+"%"});
    }

    function resizeLayers() {
        var height = $(window).height();
        if ($controlPanel.css('display') != 'none') {
            height = height - controlPanelHeight;
        }
        $('#container').height(height);
        resizeIframe()
    }

    function resizeIframe() {
        var $container = $('#container');
        var windowRatio = $container.height()/$container.width();
        var presentationRatio = presentationDimensions.height/presentationDimensions.width;
        var $ispringContent = $('#ispring_content');
        $('.ispring-responsive').height($container.height());
        
        if (windowRatio <= presentationRatio) {
            $ispringContent.height($container.height());
            $ispringContent.width($container.height()/presentationRatio);
        } else {
            $ispringContent.width($container.width());
            $ispringContent.height($container.width()*presentationRatio);
        }
        $ispringContent.css('margin-left', (($container.width()-$ispringContent.width())/2)+'px');
        $ispringContent.css('margin-top', (($container.height()-$ispringContent.height())/2)+'px');
    }

    function progressBarOnHoverIn (event) {
        $('.slideProgressTooltip').show();
        $('.progressBar').click(progressBarClick);
    }

    function progressBarOnHoverOut (event) {
        $('.slideProgressTooltip').hide();
        $('.progressBar').unbind('click');   
    }

    function progressBarOnMousemove (event) {
        var width = $('.progressBar').width();
        var slideNum = Math.ceil((event.clientX/width)*totalSlides);
        var iSlide = authorizedNestingSlides[slideNum-1];

        $('.slideProgressTooltip .titleSlide').text(iSlide.title()!=''?iSlide.title():('Pantalla '+(slideNum)));
        $('.slideProgressTooltip .thumbSlide').html('');
        $('.slideProgressTooltip .thumbSlide').append(iSlide.thumbnail.$img);
        var tooltipWidth = $('.slideProgressTooltip').width();
        var left = event.clientX+(tooltipWidth/2)>width?(width-tooltipWidth):(event.clientX-(tooltipWidth/2)<0?0:event.clientX-(tooltipWidth/2));
        $('.slideProgressTooltip').css('left', left);

    }

    function progressBarClick (event) {
        var width = $('.progressBar').width();
        var slideNum = Math.ceil((event.clientX/width)*totalSlides);
        
        playbackController.gotoSlide(authorizedNestingSlides[slideNum-1].index());
    }

    function is_touch_device() {
      return 'ontouchstart' in window        // works on most browsers 
          || navigator.maxTouchPoints;       // works on IE10/11 and Surface
    };

    function populateMenu() {
        for (var i=0; i<slides.length; i++) {
            var parentContainer = $('<div class="linkContainer">');
            var link = $('<a>').addClass('nav__item');
            link.append($('<div>').text(slides[i].title()!=''?slides[i].title():('Pantalla '+(i+1))));
            link.append($('<div>').addClass('thumbSlide').append(slides[i].thumbnail.$img));

            (function(index) {
                link.click(function(){
                    playbackController.gotoSlide(slides[index].index());
                    $('#menu-toogle').prop('checked', false);
                });
            })(i);
            parentContainer.append(link);

            populateMenuChildren(slides[i], parentContainer);
            
            $('.nav-content').append(parentContainer);
        }   
    }

    function populateMenuChildren(parentSlide, $parentContainer) {
        var children = parentSlide.children;
        if (children.length>0 && children[0].nestingLevel()<=maxNestingLevel) {
            var container = $('<div class="childrenContainer">');
            for (var i=0; i<children.length; i++) {
                var linkContainer = $('<div class="linkContainer">');
                var link = $('<a>').addClass('nav__item');
                link.append($('<div>').text(children[i].title()!=''?children[i].title():('Pantalla '+(i+1))));
                link.append($('<div>').addClass('thumbSlide').append(children[i].thumbnail.$img));

                (function(index) {
                    link.click(function(){
                        playbackController.gotoSlide(children[index].index());
                        $('#menu-toogle').prop('checked', false);
                    });
                })(i);
                linkContainer.append(link);
                container.append(linkContainer);
            }
            
            $parentContainer.append(container);
            var downButton = $('<div class="down"><i class="fa fa-toggle-right" aria-hidden="true"></i></div>');
            downButton.click(function() {
                container.slideToggle(function() {
                    if ($(this).css('display')=='block') {
                        downButton.html('<i class="fa fa-toggle-down" aria-hidden="true"></i>');
                    } else {
                        downButton.html('<i class="fa fa-toggle-right" aria-hidden="true"></i>');
                    }
                });
            });
            $parentContainer.append(downButton);
        }
    }

    function setSlideChildren(slide) {
        var islides = player.presentation().slides();
        var nesting = slide.nestingLevel();
        var children = [];
        var index = slide.index()+1;
        while ((index<islides.count()) && (islides.getSlide(index).nestingLevel()>nesting)) {
            if (islides.getSlide(index).nestingLevel()==nesting+1) {
                children.push(islides.getSlide(index));
            }
            index++;
        }
        

        for (var i=0; i<children.length; i++) {
            setSlideChildren(children[i]);
        }

        slide.children = children;
    }

    function getSlideParent(slide) {
        var nesting = slide.nestingLevel();
        if(nesting == 0) {
            return null;
        }
        var islides = player.presentation().slides();
        var index = slide.index()-1;
        while ((index>=0) && (islides.getSlide(index).nestingLevel()>=nesting)) {
            index--;
        }
        return islides.getSlide(index);
    }

    function getSlideRoot(slide) {
        if (slide.nestingLevel()==0) {
            return slide;
        }

        return getSlideRoot(getSlideParent(slide));
    }

    function getSlidePage(slide) {
        var found = false;
        for (var i=0; i<authorizedNestingSlides.length && found===false; i++) {
            if (slide==authorizedNestingSlides[i]) {
                found = i+1;
            }
        }
        if(!found) {
            return getSlidePage(getSlideParent(slide));
        }
        return found;
    }

    function getNextSlideIndex() {
        var iSlide = playbackController.currentSlide();
        var iSlides = player.presentation().slides();

        var index = iSlide.index()+1;
        if(index>=iSlides.count()) {
            return index - 1;
        }
        while (index < iSlides.count() && iSlides.getSlide(index).nestingLevel()>maxNestingLevel) {
            index++;
        }
        return index;
    }

    function getPrevSlideIndex() {
        var iSlide = playbackController.currentSlide();
        var iSlides = player.presentation().slides();

        var index = iSlide.index()-1;
        if(index<0) {
            return index + 1;
        }
        while (index >= 0 && iSlides.getSlide(index).nestingLevel()>maxNestingLevel) {
            index--;
        }
        return index;
    }

    function setCompletionStatus(visited) {
        $('.statusBar').remove();
        for(var i=0; i<authorizedNestingSlides.length; i++) {
            setCompletionStatusSlide(authorizedNestingSlides[i], visited);
            
            var status = authorizedNestingSlides[i].status;
            if(status!='not-attempted') {
                
                var statusBar = $('<div>').addClass('statusBar').addClass(status);
                var totalWidth = $('.progressBar').width();
                console.log(totalWidth);
                var left = i*totalWidth/authorizedNestingSlides.length;
                var width = 1+(totalWidth/authorizedNestingSlides.length);

                statusBar.width(width).css('left', left+'px');

                statusBar.appendTo($('.progressBar'));
            }
            
        }
    }

    function setCompletionStatusSlide(slide, visited) {
        if (visited[slide.index()] == "0") {
            slide.status = 'not-attempted';
        } else if (slide.children.length==0 && visited[slide.index()] == "1") {
            slide.status = 'completed';
        } else if (slide.children.length>0 && visited[slide.index()] == "1") {
            for (var i=0; i<slide.children.length; i++) {
                setCompletionStatusSlide(slide.children[i], visited);
            }
            slide.status = areChildrenCompleted(slide, visited)?'completed':'incompleted';
        }
    }

    function areChildrenCompleted(slide, visited) {
        var completed = visited[slide.index()] == "1";
        if(completed && slide.children.length>0) {
            for (var i=0; i<slide.children.length; i++) {
                completed = completed && areChildrenCompleted(slide.children[i], visited);
            }
        }
        
        return completed;
    }
    
    return {
        'init': init,
        'authorizedNestingSlides': authorizedNestingSlides,
        'setCompletionStatus': setCompletionStatus
    }
});