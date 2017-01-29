var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.config = (function(){

	var self = {
			
		'init': function(){
			// mapzen.whosonfirst.api.set_endpoint("https://whosonfirst-api.dev.mapzen.com/");
			// mapzen.whosonfirst.api.set_key("mapzen-SLjAoy3");

			mapzen.whosonfirst.api.set_endpoint("https://whosonfirst.dev.mapzen.com/api/rest/");
			mapzen.whosonfirst.api.set_token("14e08a516817569d7226e97cc29b9b64");
		},
	};		

	return self;
		
})();
