/**
 * @require plugins/Tool.js
 * @require GeoExt/widgets/Action.js
 * @require OpenLayers/Control/DrawFeature.js
 * @require OpenLayers/Control/DragFeature.js
 * @require OpenLayers/Handler/Polygon.js
 * @require OpenLayers/Handler/Path.js
 * @require OpenLayers/WPSClient.js
 * @require OpenLayers/Geometry.js
 */

 
var WPSDemo = Ext.extend(gxp.plugins.Tool, {

    ptype: 'app_wpsdemo',
    
    /** Inicio del plugin */
    init: function(target) {
        WPSDemo.superclass.init.apply(this, arguments);

        // Crea una instancia del servidos local WPS
        this.wpsClient = new OpenLayers.WPSClient({
            servers: {
                local: '/geoserver/wps'
            }
        });
    
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
                        this.layer, OpenLayers.Handler.Polygon
                    )
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
                    text: 'Interseccion',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Polygon, {
                        eventListeners: {
                            featureadded: this.interseccion,
                            scope: this
                        }
                    })
                }, actionDefaults)),
				
					//Acción para calculo de union
				 new GeoExt.Action(Ext.apply({
                    text: 'Union',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Polygon, {
                        eventListeners: {
                            featureadded: this.union,
                            scope: this
                        }
                    })
                }, actionDefaults)),
				
					//Acción para calculo de union
				 new GeoExt.Action(Ext.apply({
                    text: 'Centroide',
                    control: new OpenLayers.Control.DrawFeature(
                        this.layer, OpenLayers.Handler.Polygon, {
                        eventListeners: {
                            featureadded: this.centroide,
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

				new GeoExt.Action({
					text: 'Convertir Capas',
					handler:function(evt) {
					var me = this;
					var capa1,capa2,layer1, layer2, nombre1, nombre2, fin;
					fin = 0;
					nombre1 = prompt("Por favor ntroduce el nombre de la PRIMERA capa para convertirla en seleccionable","");
					if (nombre1 != null){
					nombre2 = prompt("Por favor ntroduce el nombre de la SEGUNDA capa para convertirla en seleccionable","");
					if(nombre2 != null){
					capa1= map.getLayersByName(nombre1);
					capa2 = map.getLayersByName(nombre2);
					alert(capa1);
					}
					else { fin =2}
					}
					else{fin = 1 }
					if (fin == 0){
					if (capa1.length != 0 && capa2.length != 0){
					document.capauno="Selection "+nombre1;
					document.capados="Selection "+nombre2;
					layer1= new OpenLayers.Layer.WMS(
					nombre1,
					"http://localhost:9080/geoserver/wms",
					{layers: 'europe:'+nombre1, transparent: true,
					isBaseLayer:false }
					);
					select = new OpenLayers.Layer.Vector("Selection "+nombre1,
					{styleMap:
					new
					OpenLayers.Style(OpenLayers.Feature.Vector.style["select"])
					});
					map.addLayers([layer1, select]);
					control = new OpenLayers.Control.GetFeature({
					protocol: OpenLayers.Protocol.WFS.fromWMSLayer(layer1),
					box: true,
					hover: false,
					//toggle:false,
					//multiple: false,
					clickout: true,
					multipleKey: "shiftKey",
					toggleKey: "ctrlKey"
					});
					control.events.register("featureselected", this, function(e) {
					if(!map.getLayersByName('Selection '+nombre2)[0].features.length) {
					//alert(map.getLayersByName("Selection Nucleos Urbanos")[0].features.length);
					select.addFeatures([e.feature]);
					//alert(map.getLayersByName("Selection")[0].features[0].id);
					}
					});
					control.events.register("featureunselected", this, function(e) {
					//alert("pais") ;
					select.removeFeatures([e.feature]);
					});
					map.addControl(control);
					control.activate();
					///////////////////////////////////////////////////////////////////////////////////////////
					layer2= new OpenLayers.Layer.WMS(
					nombre2,
					"http://localhost:9080/geoserver/wms",
					{layers: 'europe:'+nombre2, transparent: true,
					isBaseLayer:false }
					);
					select2 = new OpenLayers.Layer.Vector("Selection "+nombre2,
					{styleMap:
					new
					OpenLayers.Style(OpenLayers.Feature.Vector.style["select"])
					});
					map.addLayers([layer2, select2]);
					control2 = new OpenLayers.Control.GetFeature({
					protocol: OpenLayers.Protocol.WFS.fromWMSLayer(layer2),
					box: true,
					hover: false,
					//toggle:false,
					//multiple: false,
					clickout: true,
					multipleKey: "shiftKey",
					toggleKey: "ctrlKey"
					});
					control2.events.register("featureselected", this, function(e) {
					//alert(map.getLayersByName("Selection Nucleos Urbanos")[0].features.length);
					select2.addFeatures([e.feature]);
					//alert(map.getLayersByName("Selection")[0].features[0].id);
					});
					control2.events.register("featureunselected", this, function(e) {
					//alert("pais") ;
					select2.removeFeatures([e.feature]);
					});
					map.addControl(control2);
					control2.activate();
					map.removeLayer(capa1[0]);
					map.removeLayer(capa2[0]);
					}
					else {alert('ERROR: nombre de la capa incorrecto');}
					}
					}
					},actionDefaults)
				
            ]); // Fin de agregacion de ACCIONES
        }, this);
    },

	 /** Controlador de funcion para la interseccion de geometrias */
    interseccion: function(evt) {
        var line = evt.feature;
        var poly;
		for (var i=this.layer.features.length-1; i>=0; --i) {
            poly = this.layer.features[i];
            if (poly !== line && poly.geometry.intersects(line.geometry)) {
                this.wpsClient.execute({
                    server: 'local',
                    process: 'JTS:intersection',
                    inputs: {a: line, b: poly },
                    success: this.addResult,
                    scope: this
                });
            }
        }
        this.layer.removeFeatures([line]);
		this.layer.removeFeatures([poly]);
    },
	
	 /** Controlador de funcion para la interseccion de geometrias */
    centroide: function(evt) {
		var poligono = evt.feature;
       OpenLayers.Request.POST({
        url: "http://localhost:8080/geoserver/wps",
        params: {
            "SERVICE": "WPS",
            "REQUEST": "Execute",
            "VERSION": '1.0.0',
            "IDENTIFIER": 'JTS:union',
            "RawDataOutput": 'result',
            "datainputs": 'poligono'
        },
        success: function(outputs) {
        for (var i=0, ii=outputs.result.length; i<ii; ++i) {
            alert(outputs.result[i].geometry.toString());
        }
    },
        failure: function(res){     
                     alert('failure');
        }

    });},
	
		 /** Controlador de funcion para la union de geometrias */
    union: function(evt) {
        
    
		var line = evt.feature;
		
        for (var i=this.layer.features.length-1; i>=0; --i) {
            poly = this.layer.features[i];
			
           
		 //   this.addResult(this.wpsClient.getProcess('local', 'JTS:intersection').configure({inputs: { a: line, b: poly }}).output());
            
        }
     //   this.layer.removeFeatures([line]);
	//	this.layer.removeFeatures([poly]);
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
        this.layer.addFeatures(outputs.result);
    },
	
	/** Funcion axiliar que ni idea lo que hace jeje*/
	  raiseLayer: function() {
    var map = this.boxLayer && this.boxLayer.map;
    if (map) {
      map.setLayerIndex(this.boxLayer, map.layers.length);
    }
  }
});

Ext.preg(WPSDemo.prototype.ptype, WPSDemo);