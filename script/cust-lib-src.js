(function (factory) {
    if(typeof define === 'function' && define.amd) {
    //AMD
        define(['leaflet'], factory);
    } else if(typeof module !== 'undefined') {
    // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
    // Browser globals
        if(typeof window.L === 'undefined')
            throw 'Leaflet must be loaded first';
        factory(window.L);
    }
})(function (L) {

L.CQW = {
	
	FormatString: function (number, form) {
		var forms = form.split('.');
		var number = '' + number;
		var numbers = number.split('.');
		var leftnumber = numbers[0].split('');
		var exec = function (lastMatch) {
				if (lastMatch == '0' || lastMatch == '#') {
					if (leftnumber.length) {
						return leftnumber.pop();
					} else if (lastMatch == '0') {
						return lastMatch;
					} else {
						return '';
					}
				} else {
					return lastMatch;
				}
		};

		string = forms[0].split('').reverse().join('').replace(/./g, exec).split('').reverse().join('');
		string = leftnumber.join('') + string;

		if (forms[1] && forms[1].length) {
			leftnumber = (numbers[1] && numbers[1].length) ? numbers[1].split('').reverse() : [];
			string += '.' + forms[1].replace(/./g, exec);
		}
		return string.replace('//.$/', '');
	},

	setMarker: function (map, latlng, options){
		var _options = {
			zoom:15,
			tips:undefined
		};
		
		for (var i in options) {
			_options[i] = options[i];
		}
		if(_options.tips == undefined){
			_options.tips = latlng.lat + '<br />' + latlng.lng;
		}

		L.marker(latlng).addTo(map).bindPopup(_options.tips).openPopup();
		map.setView(latlng, _options.zoom);
	},
	
	HttpReq: function(url, options){
		var _options = {
			method:'get',
			async:false,
			callback: undefined
		};
		
		for (var i in options) {
			_options[i] = options[i];
		}
		xhr = new XMLHttpRequest();
        xhr.open(_options.method, url, _options.async);
        xhr.onload = _options.callback;
        xhr.send();
	}
};

/*
 **********************************************
 * This is for Showing GeoCoordinates on map. *
 **********************************************
 */
L.Control.LatLngInfo = L.Control.extend({
	options: {
		position: 'topright',
	},
	
	onAdd: function (map) {
		var className = 'custom-control-LatLngInfo',
		    container = L.DomUtil.create('div', className),
		    options = this.options;

		this._addLatLngInfo(options, className + '-line', container);

		this._layer = this.options.layer || new L.LayerGroup();
		this._layer.addTo(map);
		
		map.on('mousemove', this._update, this);
		map.on('mouseout', this._close, this);
		return container;
	},


	_addLatLngInfo: function (options, className, container) {
		this._mLatLngInfo = L.DomUtil.create('div', className, container);
	},

	_update: function (e) {
		var cText;
		cText = 'Lat:' 
			+ L.CQW.FormatString(e.latlng.lat, '000.00000')
			+ ' Lng:' 
			+ L.CQW.FormatString(e.latlng.lng, '000.00000');
		this._mLatLngInfo.innerHTML = cText;
	},
	_close: function(){
		this._mLatLngInfo.innerHTML = "";
	},
	
	latLonToEN:function(lonlat){
		var  nED,nEF,nEM,nND,nNF,nNM,nE,nN;
		nED=parseInt(lonlat[0]);
		nEF=parseInt((lonlat[0]-nED)*60);
		nEM=parseInt(((lonlat[0]-nED)*60-nEF)*60);
		nND=parseInt(lonlat[1]);
		nNF=parseInt((lonlat[1]-nND)*60);
		nNM=parseInt(((lonlat[1]-nND)*60-nNF)*60);
		nE="N"+nED.toString()+"°"+nEF.toString()+"'"+nEM.toString()+"″";
		nN="E"+nND.toString()+"°"+nNF.toString()+"'"+nNM.toString()+"″";
		return nE+" | "+nN;
	}
});
L.control.LatLngInfo = function (options) {
	return new L.Control.LatLngInfo(options);
};

/*
 **********************************************
 *  This is for getting Coordinates via ip.   *
 **********************************************
 */
L.GeoIP = L.extend({
	
    getPosition: function (ip) {
        var url = "https://freegeoip.app/json/";
        var result = L.latLng(0, 0);

        if (ip !== undefined) {
            url = url + ip;
        } else {
            //lookup our own ip address
        }

		L.CQW.HttpReq(url, {callback:function(){
           if (this.status == 200) {
                var resp = JSON.parse(this.responseText);
                result.lat = resp.latitude;
                result.lng = resp.longitude;
            } else {
                console.log("Leaflet.GeoIP.getPosition failed because its XMLHttpRequest got this response: " + this.status);
            }
		}});
        return result;
    },

    centerMapOnPosition: function (map, zoom, ip) {
        var position = L.GeoIP.getPosition(ip);
        map.setView(position, zoom, ip);
    }
});


L.Control.OSMGeocoder = L.Control.extend({
	options: {
		collapsed: false,
		position: 'topleft',
		text: 'Search',
		bounds: null, // L.LatLngBounds
		email: null, // String
		callback: function (results) {
			this._dealResult(results);
		}
	},

	_dealResult: function(results){
		if (results.length == 0) {
			console.log("ERROR: didn't find a result");
			return;
		}
		
		for(var i=0; i< results.length; i++){
			if(results[i].class == "boundary" &&
			   results[i].polygonpoints != undefined){
				var pl = this._PolygonsLayer(results[i].polygonpoints);
				var bds = this._map.addLayer(pl).getBounds();
				this._map.fitBounds(bds);
			}else {
				var bbox = results[0].boundingbox,
				first = new L.LatLng(bbox[0], bbox[2]),
				second = new L.LatLng(bbox[1], bbox[3]),
				bounds = new L.LatLngBounds([first, second]);
				//this._map.fitBounds(bounds);
			}
			L.CQW.setMarker(this._map, L.latLng(results[0].lat, results[0].lon), {tips: results[0].display_name});
		}
	},
	
	_PolygonsLayer: function(polygonpoints){
		var oPoints=[];
	   var dashStyle={
			fillColor: "blue",
			fillOpacity:0.1,
			color: "red",
			opacity:0.9,
			weight:3,
			
			dashArray:"10, 0"
		};

		for(var j=0; j<polygonpoints.length; j++){
			//console.log("polygonpoints[" + j + "]=" + polygonpoints[j]);
			var coords = L.latLng(polygonpoints[j]);
			console.log("polygonpoints[" + j + "]=" + coords);
			oPoints.push(L.latLng([coords.lng,coords.lat]));
		}
		console.log("oPoints=" + oPoints);
		return new L.polygon(oPoints, dashStyle);
		
	},
	_callbackId: 0,

	onAdd: function (map) {
		this._map = map;

		var className = 'leaflet-control-geocoder';
		this._container = L.DomUtil.create('div', className);

		L.DomEvent.disableClickPropagation(this._container);

		this._form = L.DomUtil.create('form', className + '-form');
		this._span_ipt = L.DomUtil.create('span', className + '-span_iptwr');
		this._input = L.DomUtil.create('input', className + '-input');
		this._input.type = "text";
		this._input.placeholder = "IP | Coordinates | Place";
		
		
		this._span_div = L.DomUtil.create('span', className + '-span_div');
		this._div_img = L.DomUtil.create('a', className + '-a');
		this._input_img = L.DomUtil.create('input', className + '-img');
		this._input_img.accept = "image/jpeg,image/tiff";
		this._input_img.multiple = "multiple";
		this._input_img.type = "file";
		//this._input_img.alt = "Search Photo On Map";
		//this._input_img.addEventListener("mouseover", function(){this.style.backgroundPosition = '0 -20px';}, false);
		//this._input_img.addEventListener("mouseout", function(){this.style.backgroundPosition = '0 0';}, false);
		this._input_img.addEventListener("change", this._browsePhoto, false);

		this._span_bt = L.DomUtil.create('span', className + '-span_btwr');
		this._submit = L.DomUtil.create('input', className + '-submit');
		//this._submit.alt = "Search Photo On Map";
		this._submit.type = "submit";
		this._submit.value = this.options.text;

		this._form.appendChild(this._span_ipt);
		this._span_ipt.appendChild(this._input);
		
		this._form.appendChild(this._span_div);
		this._span_div.appendChild(this._div_img);
		this._div_img.appendChild(this._input_img);
		
		
		this._form.appendChild(this._span_bt);
		this._span_bt.appendChild(this._submit);

		L.DomEvent.addListener(this._form, 'submit', this._geocode, this);
		L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-search');
		this._container.appendChild(this._form);

		return this._container;
	},
    
	_browsePhoto: function(){
		var file;
		var destination = L.DomUtil.create('p', 'p-img');
		destination.innerHTML = '';

		// 循环用户多选的文件
		for(var x = 0, xlen = this.files.length; x < xlen; x++) {
			file = this.files[x];
			if(file.type.indexOf('image') != -1) { // 非常简单的交验

				var reader = new FileReader();

				reader.onload = function(e) {
					var img = new Image();
					img.src = e.target.result; // 显示图片的地方

					destination.appendChild(img);
				};
				
				reader.readAsDataURL(file);
			}
		}
		popup(destination);
	},
	
    /* helper functions for cordinate extraction */
    _createSearchResult : function(lat, lon) {
		console.log("LatLon__createSearchResult: "+lat+" "+lon);
        //creates an position description similar to the result of a Nominatim search
        var diff = 0.005;
        var result = [];
        result[0] = {};
        result[0]["boundingbox"] = [parseFloat(lat)-diff,parseFloat(lat)+diff,parseFloat(lon)-diff,parseFloat(lon)+diff];
        result[0]["class"]="boundary";
        result[0]["display_name"]="Position: "+lat+" "+lon;
        result[0]["lat"] = lat;
        result[0]["lon"] = lon;
        return result;
    },
    _isLatLon : function (q) {
        //"lon lat" => xx.xxx x.xxxxx
		console.log("is LatLon_LatLon: "+q);
        var re = /(-?\d+\.\d+)\s(-?\d+\.\d+)/;
        var m = re.exec(q);
        if (m != undefined) return m;

        //lat...xx.xxx...lon...x.xxxxx
        re = /lat\D*(-?\d+\.\d+)\D*lon\D*(-?\d+\.\d+)/;
        m = re.exec(q);
        //showRegExpResult(m);
        if ((m != undefined)){
			console.log("pzhaoyang _isLatLon m="+m);
			return m;
		}else{
			console.log("pzhaoyang _isLatLon m="+m);
			return null;
		}
    },
    _isLatLon_decMin : function (q) {
        console.log("is LatLon_decMin: "+q);
        //N 53° 13.785' E 010° 23.887'
        //re = /[NS]\s*(\d+)\D*(\d+\.\d+).?\s*[EW]\s*(\d+)\D*(\d+\.\d+)\D*/;
        re = /([ns])\s*(\d+)\D*(\d+\.\d+).?\s*([ew])\s*(\d+)\D*(\d+\.\d+)/i;
        m = re.exec(q.toLowerCase());
        //showRegExpResult(m);
        if ((m != undefined)){
			console.log("pzhaoyang _isLatLon_decMin m="+m);
			return m;
		}else{
			console.log("pzhaoyang _isLatLon_decMin m="+m);
			return null;
		}
        // +- dec min +- dec min
    },
    _isIpCoordinates : function (q) {
        //"ip" => xxx.xxx.xxx.xxx
		var ip_reg, rs, m, ip = undefined;
		console.log("is _isIpCoordinates: "+q);
        ip_reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
        rs = ip_reg.exec(q);
		
		if(rs == null && q != ''){
			return null;
		}
		
		ip = (q == '' ? undefined : rs[0]);
		m = L.GeoIP.getPosition(ip);
		console.log("is _isIpCoordinates m: "+m);
		return m;
		
    },
	_geocode : function (event) {
		L.DomEvent.preventDefault(event);
        var q = this._input.value;
        //try to find corrdinates
		if (q === '' || this._isIpCoordinates(q) != null){
			var m = this._isIpCoordinates(q);
			console.log("pzhaoyang0");
			console.log("_isIpCoordinates: m="+ m);
			this.options.callback.call(this, this._createSearchResult(m.lat, m.lng));
			return;
		}else if (this._isLatLon(q) != null){
			var m = this._isLatLon(q);
			console.log("pzhaoyang1");
			console.log("LatLon_geocode: "+m[1]+" "+m[2]);
			//m = {lon, lat}
            this.options.callback.call(this, this._createSearchResult(m[1],m[2]));
            return;
		}else if (this._isLatLon_decMin(q) != null){
			var m = this._isLatLon_decMin(q);
			console.log("pzhaoyang2");
			//m: [ns, lat dec, lat min, ew, lon dec, lon min]
			var temp  = new Array();
			temp['n'] = 1;
			temp['s'] = -1;
			temp['e'] = 1;
			temp['w'] = -1;
            this.options.callback.call(this,this._createSearchResult(
                temp[m[1]]*(Number(m[2]) + m[3]/60),
			    temp[m[4]]*(Number(m[5]) + m[6]/60)
            ));
            return;
		}

        //and now Nominatim
		//http://wiki.openstreetmap.org/wiki/Nominatim
        console.log(this._callbackId);
		window[("_l_osmgeocoder_"+this._callbackId)] = L.Util.bind(this.options.callback, this);


		/* Set up params to send to Nominatim */
		var params = {
			// Defaults
			q: this._input.value,
			json_callback : ("_l_osmgeocoder_"+this._callbackId++),
			polygon:1,
			addressdetails:1,
			format: 'json'
		};

		if (this.options.bounds && this.options.bounds != null) {
			if( this.options.bounds instanceof L.LatLngBounds ) {
				params.viewbox = this.options.bounds.toBBoxString();
				params.bounded = 1;
			}
			else {
				console.log('bounds must be of type L.LatLngBounds');
				return;
			}
		}

		if (this.options.email && this.options.email != null) {
			if (typeof this.options.email == 'string') {
				params.email = this.options.email;
			}
			else{
				console.log('email must be a string');
			}
		}

		var url = " http://nominatim.openstreetmap.org/search" + L.Util.getParamString(params),
		script = document.createElement("script");
		
		script.type = "text/javascript";
		script.src = url;
		script.id = this._callbackId;
		document.getElementsByTagName("head")[0].appendChild(script);
	},

});

/*
 **********************************************
 *  This is for showing photo on map.         *
 **********************************************
 */
 L.Photo = L.FeatureGroup.extend({
	options: {
		icon: {						
			iconSize: [40, 40]
		}
	},

	initialize: function (photos, options) {
		L.setOptions(this, options);
		L.FeatureGroup.prototype.initialize.call(this, photos);
	},

	addLayers: function (photos) {
		if (photos) {
			for (var i = 0, len = photos.length; i < len; i++) {
				this.addLayer(photos[i]);
			}
		}
		return this;
	},

	addLayer: function (photo) {	
		L.FeatureGroup.prototype.addLayer.call(this, this.createMarker(photo));
	},

	createMarker: function (photo) {
		var marker = L.marker(photo, {
			icon: L.divIcon(L.extend({
				html: '<div style="background-image: url(' + photo.thumbnail + ');"></div>​',
				className: 'leaflet-marker-photo'
			}, photo, this.options.icon)),
			title: photo.caption || ''
		});		
		marker.photo = photo;
		return marker;
	}
});

L.photo = function (photos, options) {
	return new L.Photo(photos, options);
};

L.Photo.Cluster = L.MarkerClusterGroup.extend({
		options: {
			featureGroup: L.photo,		
			maxClusterRadius: 100,		
			showCoverageOnHover: false,
			iconCreateFunction: function(cluster) {
				return new L.DivIcon(L.extend({
					className: 'leaflet-marker-photo', 
					html: '<div style="background-image: url(' + cluster.getAllChildMarkers()[0].photo.thumbnail + ');"></div>​<b>' + cluster.getChildCount() + '</b>'
				}, this.icon));
		   	},	
			icon: {						
				iconSize: [40, 40]
			}		   		
		},

		initialize: function (options) {	
			options = L.Util.setOptions(this, options);
			L.MarkerClusterGroup.prototype.initialize.call(this);
			this._photos = options.featureGroup(null, options);
		},

		add: function (photos) {
			this.addLayer(this._photos.addLayers(photos));
			return this;
		},

		clear: function () {
			this._photos.clearLayers();
			this.clearLayers();
		}

	});

	L.photo.cluster = function (options) {
		return new L.Photo.Cluster(options);	
	};

});
