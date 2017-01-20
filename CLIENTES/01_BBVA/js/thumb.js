define(['jquery', 'parameters'], function($, parameters) {
	var prefix = 'thmb';
	function createAsync(index, courseLang) {
		var dfd = new $.Deferred();

		var path = 'content/'+parameters.courseName+'/'+courseLang+'/data/'+prefix+index;
		var filenamePNG = path+'.png';
		var imgPNG = new Image();
		imgPNG.src = filenamePNG;
		$(imgPNG).error(function(){
			var filenameJPG = path+'.jpg';
			var imgJPG = new Image();
			imgJPG.src = filenameJPG;
			$(imgJPG).load(function(){
                dfd.resolve({
                    img: imgJPG,
                    src: filenameJPG,
                    $img: $(imgJPG)
                });    
            });
		});
		$(imgPNG).load(function(){
            dfd.resolve({
                img: imgPNG,
				src: filenamePNG,
				$img: $(imgPNG)
			});
		});

		return dfd;
	};

	return {
		'createAsync': createAsync
	}
});