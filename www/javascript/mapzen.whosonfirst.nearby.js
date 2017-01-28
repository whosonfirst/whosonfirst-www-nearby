var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.nearby = (function(){

	var drawn = {};
	
	var self = {
			
		'init': function(){

			var map = mapzen.whosonfirst.map.init();
			map.on("dragend", self.fetch);

			self.fetch();
		},

		'fetch': function(){

			var map = mapzen.whosonfirst.map.map_object();
			var pt = map.getCenter();

			var method = "whosonfirst.places.getNearby";
			
			var args = {
				"latitude": pt.lat,
				"longitude": pt.lng,
				"placetype": "venue",
				"extras": "geom:latitude,geom:longitude",
			};

			var on_success = function(rsp){

				try {
					self.draw(rsp);
				}

				catch (e) {
					console.log(e);
				}
			};
			
			mapzen.whosonfirst.api.call(method, args, on_success);
		},

		'draw': function(rsp) {

			var features = [];
			
			var results = rsp.results;
			var count = results.length;

			for (var i=0; i < count; i++){

				var props = results[i];
				var wofid = props["wof:id"];

				if (drawn[wofid]){
					continue;
				}

				var lat = props["geom:latitude"];
				var lon = props["geom:longitude"];				
				
				var geom = {
					"type": "Point",
					"coordinates": [ lon, lat ],
				};

				// this (or rather the leaflet.label that it triggers)
				// causes mapzen.js to issue a "callback is undefined"
				// error (20170217/thisisaaronland)				
				// props["lflt:label_text"] = props["wof:name"];
				
				var feature = {
					"type": "Feature",
					"geometry": geom,
					"properties": props,
				};
				
				features.push(feature);
				drawn[wofid] = wofid;
			}

			var collection = {
				"type": "FeatureCollection",
				"features": features,
			};

			var map = mapzen.whosonfirst.map.map_object();

			var style = mapzen.whosonfirst.leaflet.styles.geom_centroid();
			var handler = mapzen.whosonfirst.leaflet.handlers.point(style);

			var args = {
				'style': style,
				'pointToLayer': handler,
			};
			
			var layer = L.geoJson(collection, args);
			layer.addTo(map);
		}
		
	};		

	return self;
		
})();
