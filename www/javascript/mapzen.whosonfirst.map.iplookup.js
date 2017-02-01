var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};
mapzen.whosonfirst.map = mapzen.whosonfirst.map || {};

mapzen.whosonfirst.map.iplookup = (function(){

	var cookie_iplookup_disable = "iplookup_disable";
	var cookie_iplookup_skip = "iplookup_skip";

	var map;
	
	var self = {
		
		'init': function(omg){

			map = omg;
			
			var enabled = document.getElementById("ip-lookups-enabled");
			var disabled = document.getElementById("ip-lookups-disabled");		
			
			var do_enable = function(){
				
				self.set_cookie( cookie_iplookup_disable, 0);
				enabled.style = "display:block";
				disabled.style = "display:none";						
			};
			
			var do_disable = function(){
				
				self.set_cookie( cookie_iplookup_disable, 1);
				enabled.style = "display:none";
				disabled.style = "display:block";						
			};
			
			var on = document.getElementById("ip-lookups-on");					
			var off = document.getElementById("ip-lookups-off");
			
			on.onclick = do_enable;
			off.onclick = do_disable;
			
			var jar = mapzen.whosonfirst.cookies.cookiejar();
			
			if (parseInt(jar[ cookie_iplookup_disable ])){
				disabled.style = "display:block";
			}
			
			else {
				enabled.style = "display:block";
			}
			
		},
		
		'lookup': function(ip, on_success){
			
			var jar = mapzen.whosonfirst.cookies.cookiejar();
			
			if (parseInt(jar[ cookie_iplookup_disable ])){
				mapzen.whosonfirst.log.info("skipping IP lookup because cookies say so");
				return;
			}
			
			var on_lookup = function(rsp){
				
				mapzen.whosonfirst.log.info("IP lookup for " + rsp['ip'] + " is: " + rsp['wofid']);
				
				if (rsp['geom_bbox']){
					
					var bbox = rsp['geom_bbox'];
					bbox = bbox.split(',');
					
					var sw = [ bbox[1], bbox[0] ];
					var ne = [ bbox[3], bbox[2] ];

					map.fitBounds([sw, ne]);
				}
				
				else {
					
					wofid = rsp['whosonfirst_id'];
					var url = mapzen.whosonfirst.uri.id2abspath(wofid);
					
					mapzen.whosonfirst.net.fetch(url, on_fetch, on_notfetch);
				}
				
				var jar = mapzen.whosonfirst.cookies.cookiejar();
				
				if (! parseInt(jar[ cookie_iplookup_skip ])){
					self.notice(rsp);
				}

				if (on_success){
					on_success();
				}
			};
			
			var on_notlookup = function(rsp){
				mapzen.whosonfirst.log.error("failed to lookup IP address");
			};
			
			var on_fetch = function(feature){
				
				/* This works but we need to be smarter about what kind of place
				   type we're returning and how things are zoomed out etc
				   (20160105/thisisaaronland)
				*/
				
				var bbox = mapzen.whosonfirst.geojson.derive_bbox(feature);
				
				var sw = [ bbox[1], bbox[0] ];
				var ne = [ bbox[3], bbox[2] ];

				map.fitBounds([sw, ne]);
			};
			
			var on_notfetch = function(rsp){
				mapzen.whosonfirst.log.error("failed to fetch record for IP address");					
			};
			
			mapzen.whosonfirst.iplookup.lookup(ip, on_lookup, on_notlookup);
		},
		
		'enable': function(){
			mapzen.whosonfirst.cookies.set_cookie(cookie_iplookup_disable, 0);
		},
		
		'disable': function(){
			mapzen.whosonfirst.cookies.set_cookie(cookie_iplookup_disable, 1);
		},
		
		'notice': function(rsp){
			
			var close_modal = function(){
				
				var skip = document.getElementById("iplookup-modal-skip");
				var disable = document.getElementById("iplookup-modal-disable");					
			
				if ((skip) && (skip.checked)){
					mapzen.whosonfirst.cookies.set_cookie(cookie_iplookup_skip, 1);
				}
				
				if ((disable) && (disable.checked)){
					self.disable();
				}
				
				var modal = document.getElementById("iplookup-modal");
				var parent = modal.parentElement;
				parent.removeChild(modal);
				
			};
			
			var on_close = function(){
				close_modal();
			};
			
			var modal = document.createElement("div");
			modal.setAttribute("id", "iplookup-modal");
			
			var text = document.createElement("div");
			text.setAttribute("id", "iplookup-modal-text");
			
			var head = document.createElement("h4");
			head.appendChild(document.createTextNode("We have been \"helpful\" and auto-positioned the map for you..."));
			
			var intro = document.createElement("div");
			
			var where = "";
			
			if ((rsp) && (rsp['name'])){
				
				var enc_name = mapzen.whosonfirst.php.htmlspecialchars(rsp['name']);
				where = "They seem to think you are somewhere near or around " + enc_name + ".";
			}
			
			var p1_sentences = [
				"Using your computer's IP address we've asked the computer-robots-in-the-sky where in the world they think you might be right now.",
				where, 
				"We've used this information to auto-position the map accordingly.",
				"Sometimes the mappings from IP address to location are weird. Sometimes they are just wrong.",
				"Sometimes computers being \"helpful\" like this is weird and creepy so we've added a setting to allow you to disable this feature in the future.",
				"IP lookups are a complicated business and we have written a blog post about them if you'd like to know more."
			];
			
			var p1_text = p1_sentences.join(" ");
			
			var p1 = document.createElement("p");
			p1.appendChild(document.createTextNode(p1_text));
			
			var href = "https://mapzen.com/blog/missing-the-point/";
			
			var link = document.createElement("a");
			link.setAttribute("href", href);
			link.setAttribute("target", "blog");
			link.appendChild(document.createTextNode(href));
			
			var p2 = document.createElement("p");
			p2.setAttribute("class", "iplookup-modal-blog");
			p2.appendChild(link);
			
			var skip = document.createElement("input");
			skip.setAttribute("type", "checkbox");
			skip.setAttribute("id", "iplookup-modal-skip");
			skip.setAttribute("name", "iplookup-modal-skip");
			
			var skip_label = document.createElement("label");
			skip_label.setAttribute("for", "iplookup-modal-skip");
			skip_label.appendChild(document.createTextNode("Do not show this notice again."));
			
			var p3 = document.createElement("p");
			p3.appendChild(skip);
			p3.appendChild(skip_label);				
			
			var disable = document.createElement("input");
			disable.setAttribute("type", "checkbox");
			disable.setAttribute("id", "iplookup-modal-disable");
			disable.setAttribute("name", "iplookup-modal-disable");
			
			var disable_label = document.createElement("label");
			disable_label.setAttribute("for", "iplookup-modal-disable");
			disable_label.appendChild(document.createTextNode("Please disable IP lookups altogether"));
			
			var p4 = document.createElement("p");
			p4.appendChild(disable);
			p4.appendChild(disable_label);				
			
			intro.appendChild(p1);
			intro.appendChild(p2);
			intro.appendChild(p4);
			intro.appendChild(p3);
			
			text.appendChild(head);
			text.appendChild(intro);
			
			var controls = document.createElement("div");
			controls.setAttribute("id", "iplookup-modal-controls");
			
			var close_button = document.createElement("button");
			close_button.setAttribute("id", "iplookup-modal-close-button");
			close_button.appendChild(document.createTextNode("close"));
			
			close_button.onclick = on_close;
			
			controls.appendChild(close_button);				
			
			modal.appendChild(text);
			modal.appendChild(controls);
			
			var body = document.body;
			body.insertBefore(modal, body.firstChild);
			
			return false;
			
		},
		
	};
	
	return self;
	
})();
