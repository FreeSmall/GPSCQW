function MarkerPoint(){
	alert("Hello World!");
}

	/*
		
	var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> | GPS Coordinates Querry Website. contributors',
		osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});

	var mapctl = L.map('mapctl').setView([31.20333, 121.59722], 8).addLayer(osm);*/
	
function InitMap(){
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> | GPS Coordinates Querry Website. contributors',
		osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});

	var mapctl = L.map('mapctl').setView([31.20333, 121.59722], 8).addLayer(osm);
	/*L.marker([31.20333, 121.59722])
		.addTo(mapctl)
		.bindPopup('31.20333<br />121.59722')
		.openPopup();*/
//		L.Projection.LonLat;
	L.Control.addTo(mapctl);
}

function setMarker(){
	alert("2323");
	L.marker([31.20333, 121.59722])
		.addTo(mapctl)
		.bindPopup('31.20333<br />121.59722')
		.openPopup();
}