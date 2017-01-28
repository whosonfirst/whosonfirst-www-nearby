var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.map = (function(){

	var map;
	
	var self = {
			
		'init': function(){

			var lat = 37.7749
			var lon = -122.4194;
			var zoom = 12;

			var hash = location.hash;
			var match = hash.match(/^\#\d+\/(-?\d+(?:\.\d+))?\/(-?\d+(?:\.\d+))?/)
						
			if (match){
				lat = match[1];
				lon = match[2];
			}

			var opts = {
				tangramOptions: { 
					scene: L.Mapzen.BasemapStyles.Refill
				}
			};

			var map = L.Mapzen.map('map', opts);
			map.setView([lat, lon], zoom);

			var geocoder = L.Mapzen.geocoder('mapzen-xxxxxxx');
			geocoder.addTo(map);

			var locator = L.Mapzen.locator();
			locator.setPosition('bottomright');
			locator.addTo(map);

			L.Mapzen.hash({
				map: map
			});

			map.on('tangramloaded', function(e){			

				var els = document.getElementsByClassName("leaflet-tile-pane");
				var tiles = els[0];
				tiles.style.display = "inline";
				
				var els = document.getElementsByClassName("leaflet-control-container");
				var controls = els[0];
				controls.style.display = "inline";
				
				slippymap.crosshairs.init(map);
				
			});

			if ((mapzen.whosonfirst.iplookup) && (mapzen.whosonfirst.iplookup.enabled())){

				mapzen.whosonfirst.map.iplookup.init(map);
				mapzen.whosonfirst.map.iplookup.lookup();
			}		
		},

	};		

	return self;
		
})();
