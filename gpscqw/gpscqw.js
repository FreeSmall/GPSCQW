function InitMap(){
	var defaultLatLng, map, baseTileServer


	defaultLatLng = L.latLng([31.20333, 121.59722]);
	baseTileServer = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	
	
	map = L.map('mapctl', {center: defaultLatLng, zoom: 8, zoomControl:false,attributionControl:false});	
	this.map = map;

	this.map.addLayer(L.tileLayer(baseTileServer));
	
	L.control.attribution({prefix:'&copy; <a href="https://github.com/FreeSmall/GPSCQW">GPS Coordinates Query Website.</a> | \
	@<a href="help.html">help</a>'}).addTo(this.map);
	L.control.zoom({position:'bottomright'}).addTo(this.map);
	
	L.control.LatLngInfo().addTo(this.map);
	L.control.scale({imperial:false, updsateWhenIdle:true, maxWidth: 100}).addTo(this.map);
	this.map.addControl(new L.Control.OSMGeocoder());
	
	//setMarker(L.GeoIP.getPosition(), 15);
	L.CQW.setMarker(this.map, L.GeoIP.getPosition(), {zoom:15,tips:"aa"});
}
