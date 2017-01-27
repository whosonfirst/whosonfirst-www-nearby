mapzen:	tangram refill

refill:
	curl -s -o www/tangram/refill.yaml https://raw.githubusercontent.com/tangrams/refill-style/gh-pages/refill-style.yaml
	curl -s -o www/tangram/images/refill@2x.png https://raw.githubusercontent.com/tangrams/refill-style/gh-pages/images/refill%402x.png
	curl -s -o www/tangram/images/building-grid.gif https://raw.githubusercontent.com/tangrams/refill-style/gh-pages/images/building-grid.gif
	cp www/tangram/images/building-grid.gif www/tangram/building-grid

tangram:
	echo "we are pinned to 0.11.6 pending fixes to 0.11.7+"; exit 1
	curl -s -o www/javascript/tangram.js https://mapzen.com/tangram/tangram.debug.js
	curl -s -o www/javascript/tangram.min.js https://mapzen.com/tangram/tangram.min.js
