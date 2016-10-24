function InitMap(){
	var defaultLatLng, map, baseTileServer


	defaultLatLng = L.latLng([31.20333, 121.59722]);
	baseTileServer = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	
	
	map = L.map('mapctl', {center: defaultLatLng, zoom: 8});	
	this.map = map;
	
	
	this.map.addLayer(L.tileLayer(baseTileServer));
	
	L.control.LatLngInfo().addTo(this.map);
	L.control.scale({imperial:false, updsateWhenIdle:true, maxWidth: 100}).addTo(this.map);
	this.map.addControl(new L.Control.OSMGeocoder());
	var pos = L.GeoIP.getPosition();
	this.map.setView(L.GeoIP.getPosition(),15);
	setMarker(pos);
}

function setMarker(latlng){
	var marker,tips;

	tips = latlng.lat + '<br />' + latlng.lng;
	marker = L.marker(latlng).addTo(this.map).bindPopup(tips).openPopup();
}