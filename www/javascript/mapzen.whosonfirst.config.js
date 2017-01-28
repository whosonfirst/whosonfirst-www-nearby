var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.config = (function(){

	var self = {
			
		'init': function(){
			mapzen.whosonfirst.api.set_endpoint("https://whosonfirst-api.dev.mapzen.com/");
			mapzen.whosonfirst.api.set_key("mapzen-SLjAoy3");
		},
	};		

	return self;
		
})();
