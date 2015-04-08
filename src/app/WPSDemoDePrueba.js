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
 * @requires OpenLayers/Format/WPSExecute.js
 * @requires OpenLayers/Format/WKT.js
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
                // Acción para la elaboración de nuevas geometrías
                new GeoExt.Action(Ext.apply({
                    text: 'Dibujar',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Path
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
				
					//Acción para calculo de union
				 new GeoExt.Action(Ext.apply({
                    text: 'Area',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Path, {
                        eventListeners: {
                            featureadded: this.area,
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
                }, actionDefaults))
				
            ]); // Fin de agregacion de ACCIONES
        }, this);
    },
	
	/** Controlador de funcion para la interseccion de geometrias */
    wfs: function(evt) {
		
		  var filter = '<Filter xmlns:ogc="http://www.opengis.net/ogc">';
            filter += '<PropertyIsEqualTo>';
            filter += '<PropertyName>nombre</PropertyName>';
            
            filter += '</PropertyIsEqualTo></Filter>';
		
		 OpenLayers.Request.GET({
                    url: "geoserver/wfs",
                    params: {
                            typeName: "Idesf:calles",
                            service: "WFS",
                            version: "1.1.0",
                            outputFormat: "JSON", // Usamos JSON para que la respuesta sea mas rapida
                            readFormat: new OpenLayers.Format.GeoJSON(),
                            srsName: "EPSG:27700",
                            request: "GetFeature"
                    },
                    success: function(reply) {
						alert(reply.responseText);
                        //var format = new OpenLayers.Format.GeoJSON();
                        //var feature = format.read(reply.responseText)[0];
                     /*   that.centerOnFeature(feature.geometry);
                        var address = feature.attributes.b_address;
                        showAddress(address, feature.attributes.a_uprn);*/
                    },
                    failure: function(reply) {
                            alert("failed");
                    }
            });
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
    intersects: function(evt) {
        var line = evt.feature;
		//alert(line.geometry);
        var poly;
       
            poly = this.layer.features[0];
			//alert(poly.geometry);
            if (poly !== line) {
              
		 
			 this.wpsClient.execute({
                    server: 'local',
                    process: 'JTS:intersects',
                    inputs: { a: poly, b: line },
					success: this.addResult2,
					scope: this
                });
         
            }
			this.layer.removeFeatures([poly]);
			this.layer.removeFeatures([line]);
  
  
    },
	
	 /** Controlador de funcion para la division de geometrias */
    area: function(evt) {
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
	     
                alert(respuesta.responseText);
						
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