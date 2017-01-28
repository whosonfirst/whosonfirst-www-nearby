var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.map = (function(){

	var map;
	
	var self = {
			
		'init': function(){

			var opts = {
				tangramOptions: { 
					scene: L.Mapzen.BasemapStyles.Refill
				}
			};
			
			var map = L.Mapzen.map('map', opts);
			map.setView([37.7749, -122.4194], 12);

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
			
		},
	};		

	return self;
		
})();
