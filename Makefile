nearby: whosonfirstjs mapzenjs crosshairs

whosonfirstjs:
	curl -s -o www/javascript/mapzen.whosonfirst.api.js https://raw.githubusercontent.com/whosonfirst/js-mapzen-whosonfirst/master/src/mapzen.whosonfirst.api.js
	curl -s -o www/javascript/mapzen.whosonfirst.cookies.js https://raw.githubusercontent.com/whosonfirst/js-mapzen-whosonfirst/master/src/mapzen.whosonfirst.cookies.js
	curl -s -o www/javascript/mapzen.whosonfirst.geojson.js https://raw.githubusercontent.com/whosonfirst/js-mapzen-whosonfirst/master/src/mapzen.whosonfirst.geojson.js
	curl -s -o www/javascript/mapzen.whosonfirst.log.js https://raw.githubusercontent.com/whosonfirst/js-mapzen-whosonfirst/master/src/mapzen.whosonfirst.log.js
	curl -s -o www/javascript/mapzen.whosonfirst.net.js https://raw.githubusercontent.com/whosonfirst/js-mapzen-whosonfirst/master/src/mapzen.whosonfirst.net.js
	curl -s -o www/javascript/mapzen.whosonfirst.php.js https://raw.githubusercontent.com/whosonfirst/js-mapzen-whosonfirst/master/src/mapzen.whosonfirst.php.js
	curl -s -o www/javascript/mapzen.whosonfirst.uri.js https://raw.githubusercontent.com/whosonfirst/js-mapzen-whosonfirst/master/src/mapzen.whosonfirst.uri.js

mapzenjs:
	curl -s -o www/javascript/mapzen.min.js https://mapzen.com/js/mapzen.min.js
	curl -s -o www/css/mapzen.js.css	https://mapzen.com/js/mapzen.css

refill:
	curl -s -o www/tangram/refill.yaml https://raw.githubusercontent.com/tangrams/refill-style/gh-pages/refill-style.yaml
	curl -s -o www/tangram/images/refill@2x.png https://raw.githubusercontent.com/tangrams/refill-style/gh-pages/images/refill%402x.png
	curl -s -o www/tangram/images/building-grid.gif https://raw.githubusercontent.com/tangrams/refill-style/gh-pages/images/building-grid.gif
	cp www/tangram/images/building-grid.gif www/tangram/building-grid

tangram:
	echo "we are pinned to 0.11.6 pending fixes to 0.11.7+"; exit 1
	curl -s -o www/javascript/tangram.js https://mapzen.com/tangram/tangram.debug.js
	curl -s -o www/javascript/tangram.min.js https://mapzen.com/tangram/tangram.min.js

crosshairs:
	curl -s -o www/javascript/slippymap.crosshairs.js https://raw.githubusercontent.com/whosonfirst/js-slippymap-crosshairs/master/src/slippymap.crosshairs.js
