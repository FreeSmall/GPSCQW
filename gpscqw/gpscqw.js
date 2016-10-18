function MarkerPoint(){
	alert("Hello World!");
}

	/*
		
	var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> | GPS Coordinates Querry Website. contributors',
		osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});

	var mapctl = L.map('mapctl').setView([31.20333, 121.59722], 8).addLayer(osm);*/
	
function InitMap(){
/*
 * var mapctl = L.map('mapctl').setView([31.20333, 121.59722], 8);
 *	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
 *		maxZoom: 18,
 *		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
 *			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
 *			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
 *		id: 'mapbox.light'
 *	}).addTo(mapctl);
 */


var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> | GPS Coordinates Querry Website. contributors';
var	osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});
var maphandle = L.map('mapctl').setView([31.20333, 121.59722], 8).addLayer(osm);

/*	L.marker([31.20333, 121.59722])
		.addTo(mapctl)
		.bindPopup('31.20333<br />121.59722')
		.openPopup();*/
setMarker(maphandle);
}

function setMarker(maphandle, latlng){
var marker = L.marker([31.20333, 121.59722])
var popupContent = "31.20333<br />121.59722" + "==" + getLatLng;
layer.bindPopup(popupContent);
	L.marker([31.20333, 121.59722])
		.addTo(maphandle)
		.bindPopup('31.20333<br />121.59722')
		.openPopup();
}