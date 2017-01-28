var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.nearby = (function(){

	var drawn = {};

	var layer;
	
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
				"extras": "geom:latitude,geom:longitude,wof:tags,addr:housenumber,addr:street,addr:phone,mz:is_current",
			};

			var results = [];
			
			var iters = 0;
			var max_iters = 10;

			var query = function(){
				
				var on_error = function(rsp){
					console.log(rs);
				};
			
				var on_success = function(rsp){
					
					if ((rsp["meta"]) && (rsp["meta"]["status_code"] == 429)){
						on_error(rsp);
						return;
					}
					
					var count_results = rsp['results'].length;
				
					for (var i = 0; i < count_results; i++){
						results.push(rsp['results'][i]);
					}
				
					if (rsp['cursor'] != 0){
					
						args['cursor'] = rsp['cursor'];

						if (iters <= max_iters){
							query();
							return;
						}
					}

					rsp['results'] = results;
					self.list(rsp);
					self.draw(rsp);
					
				};
				
				mapzen.whosonfirst.api.call(method, args, on_success, on_error);
				iters += 1;
			};

			query();
		},

		'list': function(rsp) {

			var ul = document.createElement("ul");
			ul.setAttribute("class", "nearby-list-tags");
			
			var results = rsp.results;
			var count = results.length;

			var by_tag = {};
			
			for (var i=0; i < count; i++){

				var props = results[i];
				var tags = props["wof:tags"];

				var count_tags = tags.length;

				if (count_tags == 0){
					tags = [ "misc" ];
				}
				
				for (var j=0; j < count_tags; j++){

					var tag = tags[j];
					
					if (! by_tag[tag]){
						by_tag[tag] = [];
					}

					by_tag[tag].push(props);
				}		
			}

			var tags = [];
			
			for (tag in by_tag){
				tags.push(tag);
			}
			
			tags = tags.sort();
			var count_tags = tags.length;

			for (var t = 0; t < count_tags; t++){

				var tag = tags[t];

				var places = by_tag[tag];
				var places_count = places.length;

				var tag_list = document.createElement("ul");
				tag_list.setAttribute("class", "nearby-list-venues");
				
				for (var p = 0; p < places_count; p++){

					var props = places[p];
					
					var wofid = props["wof:id"];					
					var name = props["wof:name"];
					var house = props["addr:housenumber"];
					var street = props["addr:street"];
					var phone = props["addr:phone"];
					var current = props["mz:is_current"];					

					var addr = [];

					if ((house) && (street)){
						addr.push(house);
					}

					if (street){
						addr.push(street);
					}

					var div = document.createElement("div");

					if (current.toString() == "1"){
						div.setAttribute("class", "nearby-venue nearby-venue-current");
					} else {
						div.setAttribute("class", "nearby-venue");
					}
					
					div.setAttribute("class", "nearby-venue");
					
					var a = document.createElement("a");
					a.setAttribute("href", "https://whosonfirst.mapzen.com/spelunker/id/ " + wofid);
					a.appendChild(document.createTextNode(name));
				
					div.appendChild(a);

					if ((addr.length > 0) || (phone != "")){

						var meta = document.createElement("ul");
						meta.setAttribute("class", "nearby-meta");
						
						if (addr.length > 0){
							var item = document.createElement("li");
							item.appendChild(document.createTextNode(addr.join(" ")));
							meta.appendChild(item);
						}

						if (phone){
							var item = document.createElement("li");
							item.appendChild(document.createTextNode(phone));
							meta.appendChild(item);
						}

						div.appendChild(meta);						
					}				

					var li = document.createElement("li");
					li.appendChild(div);
					
					tag_list.appendChild(li);
				}

				var span = document.createElement("span");
				span.setAttribute("class", "nearby-tag");
				span.appendChild(document.createTextNode(tag));
				
				var l = document.createElement("li");
				l.appendChild(span);
				l.appendChild(tag_list);

				ul.appendChild(l);
			}
			
			var list = document.getElementById("nearby-list");

			while (list.hasChildNodes()) {
				list.removeChild(list.lastChild);
			}
			
			list.appendChild(ul);
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

			if (layer){
				layer.remove(map);
			}
			
			var args = {
				'style': style,
				'pointToLayer': handler,
			};
			
			layer = L.geoJson(collection, args);
			layer.addTo(map);
		}
		
	};		

	return self;
		
})();
