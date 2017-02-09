var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.map = (function(){

	var api_key = "mapzen-xxxxxxx";
	var ready = false;
	
	var map;
	
	var self = {
			
		'init': function(){

			var lat = 37.7749
			var lon = -122.4194;
			var zoom = 12;

			var hash = location.hash;
			
			var uri_match = hash.match(/^\#\d+\/(-?\d+(?:\.\d+))?\/(-?\d+(?:\.\d+))?/);
			var query_match = hash.match(/^\#lat=(-?\d+(?:\.\d+))?\&lng=(-?\d+(?:\.\d+))?\&z=(\d+)/);	// ggrrnnngnngnggghhh

			if (uri_match){
				lat = uri_match[1];
				lon = uri_match[2];
			}

			else if (query_match){
				lat = query_match[1];
				lon = query_match[2];
				zoom = query_match[3];
			}

			else {}
			
			// https://mapzen.com/documentation/mapzen-js/api-reference/#map
			// https://mapzen.com/documentation/mapzen-js/api-reference/#tangramoptions
			
			var opts = {
				tangramOptions: { 
					scene: L.Mapzen.BasemapStyles.Refill,
					apiKey: api_key
				}
			};

			map = L.Mapzen.map('map', opts);
			
			var geocoder_opts = {
				'markers': false,
				'params': {
					'sources': ['wof']
				},
				'place': true,
			};
			
			var geocoder = L.Mapzen.geocoder(api_key, geocoder_opts);
			geocoder.addTo(map);

			// PLEASE MAKE ME CONFIGURABLE... (20170209/thisisaaronland)
			
			geocoder.on('results', function(e) {

				// requestType may be 'autocomplete', 'search', or 'place'
				
				if (e.requestType === 'place'){

					if (! len(e.results.features)){
						return;
					}
					
					var first = e.results.features[0];
					
					var bbox = first['bbox'];
					var props = first['properties'];
					var wofid = props['wofid'];
					
					// derive center of bbox (which will be wrong for SF, for example)
					// actually fetch the WOF record over the wire or call wof.places.getInfo
					// or ... ? (20170209/thisisaaronland)
				}

			});
			
			// why doesn't this work... (20170131/thisisaaronland)
			
			var locator_options = {
				'locateOptions': {
					'maxZoom': 16
				}
			};
			
			var locator = L.Mapzen.locator(locator_options);
			locator.setPosition('bottomright');
			locator.addTo(map);

			map.on('load', function(e){
				ready = true;
			});
			
			map.on('tangramloaded', function(e){			

				var els = document.getElementsByClassName("leaflet-tile-pane");
				var tiles = els[0];
				tiles.style.display = "inline";
				
				var els = document.getElementsByClassName("leaflet-control-container");
				var controls = els[0];
				controls.style.display = "inline";
				
				mapzen.whosonfirst.map.crosshairs.init(map);
				
			});

			var hash_coords = ((uri_match) || (query_match)) ? true : false;
			
			if ((mapzen.whosonfirst.iplookup) && (mapzen.whosonfirst.iplookup.enabled()) && (! hash_coords)){

				var ip = undefined;
				
				var on_success = function(){
					L.Mapzen.hash({
						map: map
					});
				};
				
				mapzen.whosonfirst.map.iplookup.init(map);
				mapzen.whosonfirst.map.iplookup.lookup(ip, on_success);
				
			} else {

				L.Mapzen.hash({
					map: map
				});
				
				map.setView([lat, lon], zoom);
			}
			
			return map;
		},

		'map_object': function() {
			return map;
		},

		'set_key': function(key) {
			api_key = key;
		},

		'ready': function(){
			return ready;
		}
	};		

	return self;
		
})();
