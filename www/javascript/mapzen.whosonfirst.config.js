var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.config = (function(){

	var self = {
			
		'init': function(){
			mapzen.whosonfirst.api.set_endpoint("https://whosonfirst-api.dev.mapzen.com/");
		},
	};		

	return self;
		
})();
