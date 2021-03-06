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

/** inicio plugin */
init: function(target) {

WPSDemo.superclass.init.apply(this, arguments);
var map = this.target.mapPanel.map;
// Añade botones de acción cuando el VISOR (wiever) está listo
target.on('ready', function() {
// Obtiene una referencia a la capa de vector de app.js
this.layer = target.getLayerRecordFromMap({
name: "sketch",
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
new GeoExt.Action({     // Agrega accion INTERSECCION
text: 'Interseccion',
handler:function(evt) {
this.wpsClient = new OpenLayers.WPSClient({
servers: {
local: '/geoserver/wps'
//opengeo: 'http://demo.opengeo.org/geoserver/wps'
}
});
var me = this;
var capa1, capa2;
capa1 = document.capauno;
capa2 = document.capados;
var numNucleos = map.getLayersByName(capa2)[0].features.length;
var numPais = map.getLayersByName(capa1)[0].features.length ;
if ((numNucleos > 0) && (numPais > 0)){
var resultado = new OpenLayers.Layer.Vector("Interseccion");
var features1 = map.getLayersByName(capa2)[0].features;//OpenLayer.Feature.Vector
var features2 = map.getLayersByName(capa1)[0].features;//OpenLayer.Feature.Vector
var intersection = wpsClient.getProcess('local',
'JTS:intersection');
var intersects = wpsClient.getProcess('local', 'JTS:intersects');
var s,f1,f2,outputs;
var maxpais = features2.length;
var maxciudad = features1.length;
for (i = 0 ; i < maxpais; ++i){
for (j = 0; j < maxciudad; ++j){
f1 = features1[j];
f2 = features2[i];
var salida,salida2,outputs;
me = this;
intersection.execute({
inputs:{
a:f1,
b:f2
},
success: function(salida2) {
if(salida2 != null && salida2.result != null ){
resultado.addFeatures(salida2.result[0]);
}
}
});
}
}
map.addLayer(resultado);
}
else{ alert("no hay ninguna feature seleccionada!");}
}
},actionDefaults)
]); // Fin de agregacion de ACCIONES
}, this); // Fin del target.on
} // Fin del Plugin
}); //Fin de TODO

Ext.preg(WPSDemo.prototype.ptype, WPSDemo);