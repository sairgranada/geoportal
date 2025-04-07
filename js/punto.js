var puntocorordenadas = {
    "type": "FeatureCollection",
    "name": "punto",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        { "type": "Feature", "properties": { "id": 1, "nombre": "Piedecuesta" }, "geometry": { "type": "Point", "coordinates": [ -73.052185880428212, 6.99205518215547 ] } },
        { "type": "Feature", "properties": { "id": 2, "nombre": "La Mesa de Los Santos" }, "geometry": { "type": "Point", "coordinates": [ -73.080051981379185, 6.839600849495699 ] } },
        { "type": "Feature", "properties": { "id": 3, "nombre": "Socorro" }, "geometry": { "type": "Point", "coordinates": [ -73.018712284530125, 6.692989939758862 ] } },
        { "type": "Feature", "properties": { "id": 4, "nombre": "San Gil" }, "geometry": { "type": "Point", "coordinates": [ -73.132048658698295, 6.553927663867341 ] } },
        { "type": "Feature", "properties": { "id": 5, "nombre": "Zapatoca" }, "geometry": { "type": "Point", "coordinates": [ -73.268927458905992, 6.815635165229367 ] } },
        { "type": "Feature", "properties": { "id": 6, "nombre": "Floridablanca" }, "geometry": { "type": "Point", "coordinates": [ -73.085745726140559, 7.060325353628969 ] } },
        { "type": "Feature", "properties": { "id": 7, "nombre": "Bucaramanga" }, "geometry": { "type": "Point", "coordinates": [ -73.121372948447785, 7.118855790276556 ] } },
        { "type": "Feature", "properties": { "id": 8, "nombre": "Lebrija" }, "geometry": { "type": "Point", "coordinates": [ -73.218308923097993, 7.114123950061815 ] } },
        { "type": "Feature", "properties": { "id": 9, "nombre": "San Joaquín" }, "geometry": { "type": "Point", "coordinates": [ -72.866882722402792, 6.428003232155389 ] } },
        { "type": "Feature", "properties": { "id": 10, "nombre": "Tona" }, "geometry": { "type": "Point", "coordinates": [ -72.966237566770488, 7.202427978739064 ] } }
    ]
};


// Definir una paleta de colores basada en los IDs
var colores = [
    "red", "blue", "green", "orange", "purple",
    "cyan", "magenta", "yellow", "brown", "pink"
];

// Crear un objeto para mapear los colores a los nombres de ciudades
var coloresPorCiudad = {};

// Crear capa de puntos con simbología
var puntosCapa = L.geoJSON(puntocorordenadas, {
    onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.id) {
            layer.bindPopup("ID: " + feature.properties.id + "<br>Nombre: " + feature.properties.nombre);
        }
    },
    pointToLayer: function (feature, latlng) {
        var color = colores[(feature.properties.id - 1) % colores.length]; // Asignar color basado en ID
        coloresPorCiudad[feature.properties.nombre] = color; // Guardar color en el objeto

        return L.circleMarker(latlng, {
            radius: 6,
            fillColor: color,
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
        });
    }
});

// Agregar la leyenda asegurando los mismos colores
var leyenda = L.control({ position: "bottomright" });

leyenda.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML = "<strong>Ciudades</strong><br>";

    // Recorrer las ciudades en el mismo orden y agregar sus colores
    Object.keys(coloresPorCiudad).forEach(function (ciudad) {
        div.innerHTML +=
            '<i style="background:' + coloresPorCiudad[ciudad] + '; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></i>' +
            ciudad + "<br>";
    });

    return div;
};

leyenda.addTo(map);
