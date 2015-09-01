/**
 * @require plugins/Tool.js
 * @require GeoExt/widgets/Action.js
 * @require OpenLayers/Control/DrawFeature.js
 * @require OpenLayers/Control/DragFeature.js
 * @require OpenLayers/Handler/Polygon.js
 * @require OpenLayers/Handler/Path.js
 * @require OpenLayers/WPSClient.js
 * @require OpenLayers/Geometry.js
 * @require OpenLayers/Format/WFS.js
 * @require OpenLayers/Format/WPSExecute.js
 * @require OpenLayers/Format/WKT.js
 * @require OpenLayers/Control/GetFeature.js
 * @require OpenLayers/Proj4js.js
 */

 
var WPSDemo = Ext.extend(gxp.plugins.Tool, {

    ptype: 'app_wpsdemo',
    
    /** Inicio del plugin */
    init: function(target) {
        WPSDemo.superclass.init.apply(this, arguments);

        // Crea una instancia del servidos local WPS
        this.wpsClient = new OpenLayers.WPSClient({
            servers: {
                local: 'geoserver/wps'
            }
        });
		
		    this.map = target.mapPanel.map;
		/*	map.events.on({
				addlayer: this.raiseLayer,
				scope: this
				});*/
		
		  
        // Añade botones de acción cuando el VISOR (wiever) está listo
        target.on('ready', function() {
            // Obtiene una referencia a la capa de vector de app.js
            this.layer = target.getLayerRecordFromMap({
                name: 'sketch',
                source: 'ol'
            }).getLayer();
            // Algunos valores predeterminados
            var actionDefaults = {
                map: target.mapPanel.map,
                enableToggle: true,
                toggleGroup: this.ptype,
                allowDepress: true
            };
			// Inicio de agregacion de ACCIONES
            this.addActions([
			
			//Acción para calculo de union
				 new GeoExt.Action(Ext.apply({
                    text: 'Area Raster',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Polygon, {
                        eventListeners: {
                            featureadded: this.area,
                            scope: this
                        }
                    })
                }, actionDefaults)),
                // Acción para la elaboración de nuevas geometrías
                new GeoExt.Action(Ext.apply({
                    text: 'Dibujar',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Polygon
                    )
                }, actionDefaults)),
					//Acción para calculo interseccion
				 new GeoExt.Action(Ext.apply({
                    text: 'Buscar Intersecciones',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Path, {
                        eventListeners: {
                            featureadded: this.intersects,
                            scope: this
                        }
                    })
                }, actionDefaults)),
                // Acción para arrastrar geometrías existentes
                new GeoExt.Action(Ext.apply({
                    text: 'Arrastrar',
                    control: new OpenLayers.Control.DragFeature(this.layer)
                }, actionDefaults)),
				
                // Acción para la división dibujando una línea
                new GeoExt.Action(Ext.apply({
                    text: 'Split',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Path, {
                        eventListeners: {
                            featureadded: this.split,
                            scope: this
                        }
                    })
                }, actionDefaults)),
				
				//Acción para calculo de interseccion
				 new GeoExt.Action(Ext.apply({
                    text: 'Borrar',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Point, {
                        eventListeners: {
                            featureadded: this.borrar,
                            scope: this
                        }
                    })
                }, actionDefaults)),
				
					
				
				//Acción para la intersection+buffer dibujando una línea
                    new GeoExt.Action(Ext.apply({
                    text: 'Union',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer,OpenLayers.Handler.Path, {
                        eventListeners: {
                            featureadded: this.union,
                            scope: this
                        }
                    })
                }, actionDefaults)),
				
				//Acción para la intersection+buffer dibujando una línea
                    new GeoExt.Action(Ext.apply({
                    text: 'Intersect+Buffer',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer,OpenLayers.Handler.Path, {
                        eventListeners: {
                            featureadded: this.intersectBuffer,
                            scope: this
                        }
                    })
                }, actionDefaults)),
				
				//Acción para la probar WFS
                    new GeoExt.Action(Ext.apply({
                    text: 'WFS',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer,OpenLayers.Handler.Path, {
                        eventListeners: {
                            featureadded: this.wfs,
                            scope: this
                        }
                    })
                }, actionDefaults)),
				
				//Acción para la probar WFS
                    new GeoExt.Action(Ext.apply({
                    text: 'Buffer',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer,OpenLayers.Handler.Point, {
                        eventListeners: {
                            featureadded: this.buffer,
                            scope: this
                        }
                    })
                }, actionDefaults))
				
            ]); // Fin de agregacion de ACCIONES
        }, this);
    },
	
	// Proceso que ejecuta un BUFFER
    buffer: function(evt) {
		
	
		var wpsFormat= new OpenLayers.Format.WPSExecute(); 
		var posicion= new OpenLayers.Format.WKT();
		
		
      //  var p=posicion.extractGeometry(evt.feature.geometry);
		
		var aux="POINT(5500000 6537729.791671)";
		//alert(evt.feature.geometry.x);
		//alert(evt.feature.geometry.y);
		
		var p = new Proj4js.Point(evt.feature.geometry.x,evt.feature.geometry.y);
	//	alert(p);
		//var puntoSeleccionado="POINT" ()
        
		Proj4js.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
		var fuente = new Proj4js.Proj('EPSG:900913');
		Proj4js.defs["EPSG:22185"] = "+proj=tmerc +lat_0=-90 +lon_0=-60 +k=1 +x_0=5500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
	    var dest = new Proj4js.Proj('EPSG:22185');
		
		//alert(p);
		
		// Convierte 900913 a 22185 para realizar las intersecciones
		Proj4js.transform(fuente, dest, p);
		//alert(p.x); 
		
		var puntoBuffer="POINT("+p.x+" "+""+p.x+")";
		//alert(puntoBuffer);
		
		
		
		// Aca se realiza la consulta WPS Buffer
	    var doc= wpsFormat.write({ 
        identifier: "JTS:buffer", 
        dataInputs:[{ 
            identifier:'geom', 
            data:{ 
                complexData:{
					mimeType:"application/wkt", 
					//value: posicion.extractGeometry(evt.feature.geometry)
					value: puntoBuffer
							}},
		   complexData:{
			   default: {
				   format: "text/xml; subtype=gml/3.1.1"
		     }}},
			{ 
            identifier:'distance', 
            data: { 
			literalData:{
					value: 1000 // este valor debera ser reemplazadado por uno que ingrese el usuario
				}
			}
		}], 
            responseForm:{ 
                    rawDataOutput:{ 
                        mimeType:"application/wkt", 
                        identifier:"result" 
                }} 
		}); 
 
			var posicionBuffer = OpenLayers.Request.POST({
                    url: "geoserver/wps",
                    data: doc,
					headers: { "Content-Type": "text/xml;charset=utf-8" }, 
					async: false
            });

			alert("el buffer es"+posicionBuffer.responseText);
		var i=0;
		var cantidadCapasVisibles = this.map.layers.length; 

		for(var i=0;i<cantidadCapasVisibles;i++){
			if(this.map.layers[i].CLASS_NAME=="OpenLayers.Layer.WMS" && this.map.layers[i].visibility){
			
			var arregloWfs = this.wfs(this.map.layers[i].name);
			
				for (var i=0; i<arregloWfs.length; i++) {
				var inter = this.verIntersecciones(arregloWfs[i][1],posicionBuffer.responseText);	
															}
				}	
		}
			
	
    },
	
	verIntersecciones: function(punto,buffer) {
		
		
		var mipunto = OpenLayers.Geometry.fromWKT(punto);
	    var mibuffer=OpenLayers.Geometry.fromWKT(buffer);
		
		
		var respuesta = mibuffer.intersects(mipunto);
		
		if(respuesta){
		alert(respuesta);	
		}	
		
},


	/** Controlador de funcion para la interseccion de geometrias */
    wfs: function(evt) {
		var feature = new Array();
		
		var calleAux = new OpenLayers.Format.WKT();
		    var respuesta = OpenLayers.Request.GET({
                    url: "geoserver/wfs",
                    params: {
                            typeName: "Idesf:"+evt,
                            service: "WFS",
                            version: "1.1.0",
                            outputFormat: "JSON", // Usamos JSON para que la respuesta sea mas rapida
                            readFormat: new OpenLayers.Format.GeoJSON(),
                            request: "GetFeature"
                    },
					async: false
            });
		  var format = new OpenLayers.Format.GeoJSON();
          var featureAux = format.read(respuesta.responseText);
		  var i=0;
		    while(i<featureAux.length){
		
			var calleCoordenada = new Array(2);
			  calleCoordenada[0]=featureAux[i].data.nombre;
			  calleCoordenada[1]=calleAux.extractGeometry(featureAux[i].geometry);
			  feature.push(calleCoordenada);
			                                 
			  i++;
		  }
		  return feature;
	    },

	 /** Controlador de funcion para la interseccion de geometrias */
    borrar: function(evt) {
       
	     var line = evt.feature;
		//alert(line.geometry);
        var poly;
			for (var i=this.layer.features.length-1; i>=0; --i) {
            poly = this.layer.features[i];
            if (poly !== line && poly.geometry.intersects(line.geometry)){
			this.layer.removeFeatures([poly]);
			this.layer.removeFeatures([line]);
			}	}
    },
	
	 /** Controlador de funcion para la division de geometrias */
    area: function(evt) {
		
        var wpsFormat= new OpenLayers.Format.WPSExecute(); 
		var posicion= new OpenLayers.Format.WKT();
		
		//var que=evt.feature.geometry.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));

   
	    var doc= wpsFormat.write({ 
        identifier: "JTS:area", 
        dataInputs:[{ 
            identifier:'geom', 
            data:{ 
                complexData:{
					mimeType:"application/wkt", 
					value: posicion.extractGeometry(evt.feature.geometry)
							}},
		   complexData:{
			   default: {
				   format: "text/xml; subtype=gml/3.1.1"
		     }}}], 
            responseForm:{ 
                    rawDataOutput:{ 
                        mimeType:"application/wkt", 
                        identifier:"result" 
                }} 
		}); 
 
			var posicionBuffer = OpenLayers.Request.POST({
                    url: "geoserver/wps",
                    data: doc,
					headers: { "Content-Type": "text/xml;charset=utf-8" }, 
					async: false
            });
           
		   alert("El area seleccionada es de: "+posicionBuffer.responseText+"Mts2");
  
    },
	
	 /** Controlador de funcion para la division de geometrias */
    area2: function(evt) {
     //  var line = evt.feature;
	 //  var poly = this.layer.features[0];
	   var wpsFormat= new OpenLayers.Format.WPSExecute(); 

	   
	   var calle1 = new OpenLayers.Format.WKT().extractGeometry(evt.feature.geometry);
	   var calle2 = new OpenLayers.Format.WKT().extractGeometry(this.layer.features[0].geometry);
	   
	    var doc= wpsFormat.write({ 
        identifier: "JTS:intersects", 
        dataInputs:[{ 
            identifier:'a', 
            data:{ 
                complexData:{
					mimeType:"application/wkt", 
					value: calle1
							}},
		   complexData:{
			   default: {
				   format: "text/xml; subtype=gml/3.1.1"
			   }}},
			{ 
            identifier:'b', 
            data:{ 
                complexData:{
					mimeType:"application/wkt", 
					value: calle2
				}},
		   complexData:{
			   default: {
				   format: "text/xml; subtype=gml/3.1.1"
			   }}}], 

            responseForm:{ 
                    rawDataOutput:{ 
                        mimeType:"application/wkt", 
                        identifier:"result" 
                }} 

            }); 
       
   
          
              
		
			  	  var respuesta = OpenLayers.Request.POST({
                    url: "geoserver/wps",
                    data: doc,
					headers: { "Content-Type": "text/xml;charset=utf-8" }, 
					async: false
            });
	     
              //  alert(respuesta.responseText);
						
    },
	
		
    /** Controlador de funcion para la division de geometrias */
    split: function(evt) {
        var line = evt.feature;
		//alert(line.geometry);
        var poly;
        for (var i=this.layer.features.length-1; i>=0; --i) {
            poly = this.layer.features[i];
			//alert(poly.geometry);
            if (poly !== line && poly.geometry.intersects(line.geometry)) {
                this.wpsClient.execute({
                    server: 'local',
                    process: 'JTS:splitPolygon',
                    inputs: { polygon: poly, line: line },
                    success: this.addResult,
                    scope: this
                });
                this.layer.removeFeatures([poly]);
            }
        }
        this.layer.removeFeatures([line]);
    },
	
	 union: function(evt) {
     
	   //  var line = evt.feature;
	 //  var poly = this.layer.features[0];
	   var wpsFormat= new OpenLayers.Format.WPSExecute(); 

	   
	   var calle1 = new OpenLayers.Format.WKT().extractGeometry(evt.feature.geometry);
	   var calle2 = new OpenLayers.Format.WKT().extractGeometry(this.layer.features[0].geometry);
	   
	    var doc= wpsFormat.write({ 
        identifier: "JTS:union", 
        dataInputs:[{ 
            identifier:'geom', 
            data:{ 
                complexData:{
					mimeType:"application/wkt", 
					value: "MULTILINESTRING ((50 60, 70 80), (70 80, 90 100))"
							}},
		   complexData:{
			   default: {
				   format: "text/xml; subtype=gml/3.1.1"
			   }}},
			{ 
            identifier:'geom', 
            data:{ 
                complexData:{
					mimeType:"application/wkt", 
					value: "MULTILINESTRING((10 20,50 60))"
				}},
		   complexData:{
			   default: {
				   format: "text/xml; subtype=gml/3.1.1"
			   }}}], 

            responseForm:{ 
                    rawDataOutput:{ 
                        mimeType:"application/wkt", 
                        identifier:"result" 
                }} 

            }); 
			  	  var respuesta = OpenLayers.Request.POST({
                    url: "geoserver/wps",
                    data: doc,
					headers: { "Content-Type": "text/xml;charset=utf-8" }, 
					async: false
            });
	     
             //   alert(respuesta.responseText);
	 	 	   	 
	 
    },
	


    /** Controlador de funcion para la accion intersection+buffer */
	
	// Proceso en cascada (BUFFER+INTERSECTION)
    intersectBuffer: function(evt) {
        var line = evt.feature;
        var poly;
        for (var i=this.layer.features.length-1; i>=0; --i) {
            poly = this.layer.features[i];
            if (poly !== line && poly.geometry.intersects(line.geometry)) {
                this.wpsClient.execute({
                    server: 'local',
                    process: 'JTS:buffer',
                    inputs: {
                        distance:
                            // buffer distance is 10 pixels
                            9 * this.target.mapPanel.map.getResolution(),
                        geom:
                            this.wpsClient.getProcess(
                                'local', 'JTS:intersection'
                            ).configure({
                                inputs: { a: line, b: poly }
                            }).output()
                    },
                    success: this.addResult,
                    scope: this
                });
            }
			
        }
        this.layer.removeFeatures([line]);
    },
	
	
	
	

   	/** Función auxiliar para la adición de los resultados del proceso de la capa de vector */
    addResult: function(outputs) {
		//alert(outputs.result);
        this.layer.addFeatures(outputs.result);
    }
	
	,

   	/** Función auxiliar para la adición de los resultados del proceso de la capa de vector */
    addResult2: function(outputs) {
        alert(outputs.result);
    },
	  raiseLayer: function() {
    var map = this.boxLayer && this.boxLayer.map;
    if (map) {
      map.setLayerIndex(this.boxLayer, map.layers.length);
    }
  }

});

Ext.preg(WPSDemo.prototype.ptype, WPSDemo);