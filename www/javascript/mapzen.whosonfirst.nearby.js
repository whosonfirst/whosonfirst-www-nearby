var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.nearby = (function(){

	var nofetch = false;
	var layer;
	
	var self = {
			
		'init': function(){

			var map = mapzen.whosonfirst.map.init();

			map.on("dragend", function(){
				console.log("fetch on drag end");
				self.fetch();
			});
			
			map.on("zoomend", function(){
				console.log("fetch on zoom end");
				self.fetch();
			});

			var s = document.getElementById("nearby-list-show");
			var e = document.getElementById("nearby-list-expand");
			var c = document.getElementById("nearby-list-collapse");

			s.onclick = self.show_all;
			e.onclick = self.expand_tags;
			c.onclick = self.collapse_tags;
			
			// self.fetch();
		},

		'fetch': function(){

			if (nofetch){
				return true;
			}

			var map = mapzen.whosonfirst.map.map_object();

			var pt = map.getCenter();
			
			var method = "whosonfirst.places.getNearby";
			
			var args = {
				"latitude": pt.lat,
				"longitude": pt.lng,
				"radius": 75,
				"placetype": "venue",
				"extras": "geom:latitude,geom:longitude,wof:tags,addr:housenumber,addr:street,addr:phone,mz:is_current",
				"per_page": 500,
			};

			var results = [];
			
			var iters = 0;
			var max_iters = 10;

			var query = function(){
				
				var on_error = function(rsp){

					var list = document.getElementById("nearby-list");
					list.innerHTML = "There was a problem calling the Who's On First API. Errors have been sent to console.log because it's early days still and we can't have nice things...";
				};
			
				var on_success = function(rsp){
					
					if ((rsp["meta"]) && (rsp["meta"]["status_code"] == 429)){
						on_error(rsp);
						return;
					}
					
					var count_results = rsp['results'].length;

					if (count_results == 0){
						var list = document.getElementById("nearby-list");
						list.innerHTML = "Huh, there's nothing around here. Try panning the map around or looking in a differnt place?";
						return;
					}
					
					for (var i = 0; i < count_results; i++){
						results.push(rsp['results'][i]);
					}

					if ((rsp['cursor']) && (rsp['cursor'] != 0)){
						
						var list = document.getElementById("nearby-list");
						list.innerHTML = "fetching more results (" + results.length + " so far)...";

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

			var e = document.getElementById("nearby-list-expand");
			var c = document.getElementById("nearby-list-collapse");

			e.style.display = "none";
			c.style.display = "none";			
			
			if (layer){
				layer.remove(map);
			}

			var list = document.getElementById("nearby-list");
			list.innerHTML = "fetching results...";
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
					tags = [ "uncategorized" ];
					count_tags = tags.length;					
				}
				
				for (var j=0; j < count_tags; j++){

					var tag = tags[j].toString();
					
					// because the test for the tag "watch" will evaluate to  true
					// since by_tag has a built-in "watch" function associated with
					// it... (20170129/thisisaaronland)
					
					if ((! by_tag[tag]) || (typeof(by_tag[tag]) != "object")){
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
				tag_list.setAttribute("id", "nearby-list-" + tag);				
				tag_list.setAttribute("class", "nearby-list-venues");
				
				for (var p = 0; p < places_count; p++){

					var props = places[p];
					
					var wofid = props["wof:id"];					
					var name = props["wof:name"];
					var lat = props["geom:latitude"];
					var lon = props["geom:longitude"]
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
					
					div.setAttribute("class", "nearby-venue nearby-venue-" + wofid);					
					
					var a = document.createElement("a");
					a.setAttribute("href", "https://whosonfirst.mapzen.com/spelunker/id/" + wofid);	// please make me a config/uri template
					a.setAttribute("data-latitude", lat);
					a.setAttribute("data-longitude", lon);					
					a.appendChild(document.createTextNode(name));

					a.onmouseover = function(e){
						
						var el = e.target;
						var lat = el.getAttribute("data-latitude");
						var lon = el.getAttribute("data-longitude");

						var map = mapzen.whosonfirst.map.map_object();
						var pt = L.latLng(lat, lon);
						var zoom = 17;

						nofetch = true;
						map.setView(pt, zoom);
						nofetch = false;		
					};
					
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

					var buttons = document.createElement("ul");
					buttons.setAttribute("class", "nearby-buttons");

					var button_open = document.createElement("button");
					button_open.setAttribute("class", "button-open");					
					button_open.setAttribute("id", "button-open-" + wofid);
					button_open.appendChild(document.createTextNode("open"));

					var button_closed = document.createElement("button");
					button_closed.setAttribute("class", "button-closed");					
					button_closed.setAttribute("id", "button-closed-" + wofid);
					button_closed.appendChild(document.createTextNode("closed"));

					var button_now = document.createElement("button");
					button_now.setAttribute("class", "button-now");					
					button_now.setAttribute("id", "button-now-" + wofid);
					button_now.appendChild(document.createTextNode("open right now"));

					button_open.onclick = self.button_onclick;
					button_closed.onclick = self.button_onclick;
					button_now.onclick = self.button_onclick;
							   
					var li_open = document.createElement("li");
					var li_closed = document.createElement("li");					
					var li_now = document.createElement("li");
					
					li_open.appendChild(button_open);					
					li_closed.appendChild(button_closed);
					li_now.appendChild(button_now);

					buttons.appendChild(li_open);
					buttons.appendChild(li_closed);
					buttons.appendChild(li_now);					

					div.appendChild(buttons);
					
					var li = document.createElement("li");
					li.appendChild(div);
					
					tag_list.appendChild(li);
				}

				var places = by_tag[tag];
				var places_count = places.length;
				
				var tag_count = document.createElement("small");
				tag_count.setAttribute("class", "nearby-tag-count");

				if (places_count == 1){
					tag_count.appendChild(document.createTextNode("one venue"));
				} else {
					tag_count.appendChild(document.createTextNode(places_count + " venues"));
				}
				
				var tag_name = document.createElement("h2");
				tag_name.setAttribute("class", "nearby-tag");
				tag_name.setAttribute("id", "nearby-tag-" + tag);				
				tag_name.appendChild(document.createTextNode(tag));
				tag_name.appendChild(tag_count);

				tag_name.onclick = self.tag_onclick;
				
				var l = document.createElement("li");
				l.appendChild(tag_name);
				l.appendChild(tag_list);

				ul.appendChild(l);
			}
			
			var list = document.getElementById("nearby-list");

			while (list.hasChildNodes()) {
				list.removeChild(list.lastChild);
			}
			
			list.appendChild(ul);

			var e = document.getElementById("nearby-list-expand");
			e.style.display = "inline";
			
		},
		
		'draw': function(rsp) {

			var features = [];
			
			var results = rsp.results;
			var count = results.length;

			for (var i=0; i < count; i++){

				var props = results[i];
				var wofid = props["wof:id"];

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

				var tags = props["wof:tags"];
				var tags_count = tags.length;

				if (tags_count == 0){
					props["wof:tags"] = [ "uncategorized" ];
				}
			
				var feature = {
					"type": "Feature",
					"geometry": geom,
					"properties": props,
				};
				
				features.push(feature);
			}

			var collection = {
				"type": "FeatureCollection",
				"features": features,
			};

			var map = mapzen.whosonfirst.map.map_object();

			var default_style = mapzen.whosonfirst.leaflet.styles.nearby_centroid();
			var hover_style = mapzen.whosonfirst.leaflet.styles.nearby_hover_centroid();
			
			var handler = mapzen.whosonfirst.leaflet.handlers.point(default_style);

			if (layer){
				layer.remove(map);
			}
			
			var args = {
				'style': default_style,
				'pointToLayer': handler,

				// 'riseOnHover': true,
				// 'riseOffset': 1000,
				
				onEachFeature: function(feature, layer){
					
					layer.on("mouseover", function(e){

						var props = feature["properties"];
						var wofid = props["wof:id"];
						
						var tag_els = document.getElementsByClassName("nearby-tag");
						var tag_els_count = tag_els.length;

						for (var i=0; i < tag_els_count; i++){
							var tag_el = tag_els[i];
							tag_el.style.display = "none";
						}
						
						var tags = props["wof:tags"];
						var count_tags = tags.length;

						self.collapse_tags();

						for (var i=0; i < count_tags; i++){

							var tag = tags[i];

							var tag_id = "nearby-tag-" + tag;							
							var list_id = "nearby-list-" + tag;

							var list = document.getElementById(list_id);

							if (list){	// why do I need to do this?
								list.style.display = "block";
							}
							
							var tag_el = document.getElementById(tag_id);
							tag_el.style.display = "block";
						}

						var s = document.getElementById("nearby-list-show");						
						s.style.display = "inline";

						var marker = e.target;
						marker.setStyle(hover_style);

						var possible = document.getElementsByClassName("nearby-venue-" + wofid);
						var count_possible = possible.length;

						for (var i=0; i < count_possible; i++){
							var el = possible[i];
							
							var classes = el.getAttribute("class");
							classes += " hey-look";

							el.setAttribute("class", classes);
						}
					});
					
					layer.on("mouseout",function(e){

						var marker = e.target;
						marker.setStyle(default_style);

						var props = feature["properties"];
						var wofid = props["wof:id"];
						
						var possible = document.getElementsByClassName("nearby-venue-" + wofid);
						var count_possible = possible.length;

						for (var i=0; i < count_possible; i++){
							var el = possible[i];
							
							var classes = el.getAttribute("class");
							classes = classes.replace("hey-look", "");
							el.setAttribute("class", classes);
						}
					});
				}
			};

			layer = L.geoJson(collection, args);
			layer.addTo(map);
		},

		'tag_onclick': function(e){

			var el = e.target;
			var id = el.getAttribute("id");

			var tag = id.replace("nearby-tag-", "");
			var list_id = "nearby-list-" + tag;

			var list = document.getElementById(list_id);

			if (list.style.display == "block"){
				list.style.display = "none";				
			} else {
				list.style.display = "block";
			}				
		},
		
		'button_onclick': function(e){
			var b = e.target;
			console.log(b.getAttribute("id"));
		},

		'show_all': function(){

			var tag_els = document.getElementsByClassName("nearby-tag");
			var tag_els_count = tag_els.length;
			
			for (var i=0; i < tag_els_count; i++){
				var tag_el = tag_els[i];
				tag_el.style.display = "block";
			}

			var s = document.getElementById("nearby-list-show");						
			s.style.display = "none";
		},
		
		'expand_tags' : function(){
			
			self.toggle_tags("block");

			var e = document.getElementById("nearby-list-expand");
			var c = document.getElementById("nearby-list-collapse");

			e.style.display = "none";
			c.style.display = "inline";			
		},

		'collapse_tags' : function(){

			self.toggle_tags("");

			var e = document.getElementById("nearby-list-expand");
			var c = document.getElementById("nearby-list-collapse");
			
			e.style.display = "inline";
			c.style.display = "none";			
			
		},

		'toggle_tags': function(display){

			var tags = document.getElementsByClassName("nearby-list-venues");
			var count = tags.length;
			
			for (var i=0; i < count; i++){
				var list = tags[ i ];
				list.style.display = display;
			}
		}
	};		

	return self;
		
})();
