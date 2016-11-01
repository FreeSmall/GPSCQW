function InitMap(){
	var defaultLatLng, map, baseTileServer


	defaultLatLng = L.latLng([31.20333, 121.59722]);
	baseTileServer = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	
	
	map = L.map('mapctl', {/*center: defaultLatLng, */zoom: 17, zoomControl:false,attributionControl:false});	
	this.map = map;

	this.map.addLayer(L.tileLayer(baseTileServer));
	
	L.control.attribution({prefix:'&copy; <a href="https://github.com/FreeSmall/GPSCQW">GPS Coordinates Query Website.</a> | \
	@<a href="help.html">help</a>'}).addTo(this.map);
	L.control.zoom({position:'bottomright'}).addTo(this.map);
	
	L.control.LatLngInfo().addTo(this.map);
	L.control.scale({imperial:false, updsateWhenIdle:true, maxWidth: 100}).addTo(this.map);
	this.map.addControl(new L.Control.OSMGeocoder());
	
	var photoLayer = L.photo.cluster({ spiderfyDistanceMultiplier: 1.2 }).on('click', function (evt) {
		evt.layer.bindPopup(L.Util.template('<img src="{url}"/></a><p>{caption}</p>', evt.layer.photo), {
			className: 'leaflet-popup-photo',
			minWidth: 400
		}).openPopup();
	});

	reqwest({
		url: 'http://kulturnett2.delving.org/api/search?query=*%3A*&format=jsonp&rows=100&pt=59.936%2C10.76&d=1&qf=abm_contentProvider_text%3ADigitaltMuseum',
		type: 'jsonp',
		success: function (data) {
			var photos = [];
			data = data.result.items;

			for (var i = 0; i < data.length; i++) {
				var photo = data[i].item.fields;
				if (photo.abm_latLong) {
					var pos = photo.abm_latLong[0].split(',');
					photos.push({
						lat: pos[0],
						lng: pos[1],
						url: photo.delving_thumbnail[0],
						caption: (photo.delving_description ? photo.delving_description[0] : '') + ' - Kilde: <a href="' + photo.delving_landingPage + '">' + photo.delving_collection + '</a>',
						thumbnail: photo.delving_thumbnail[0]
					});
				}	
			}

			photoLayer.add(photos).addTo(map);
			map.fitBounds(photoLayer.getBounds());
		}
	});
	
	//setMarker(L.GeoIP.getPosition(), 15);
	//L.CQW.setMarker(this.map, L.GeoIP.getPosition(),{zoom:15});
}
