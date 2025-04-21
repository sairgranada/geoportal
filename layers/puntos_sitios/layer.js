var coloresPorCiudad = {};

var puntocorordenadas = {
    "type": "FeatureCollection",
    "name": "punto",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        { "type": "Feature", "properties": { "id": 1, "nombre": "Piedecuesta" }, "geometry": { "type": "Point", "coordinates": [ -73.05218, 6.99205 ] } },
        { "type": "Feature", "properties": { "id": 2, "nombre": "Los Santos" }, "geometry": { "type": "Point", "coordinates": [ -73.08005, 6.83960 ] } },
        { "type": "Feature", "properties": { "id": 3, "nombre": "Aratoca" }, "geometry": { "type": "Point", "coordinates": [ -73.01871, 6.69298 ] } },
        { "type": "Feature", "properties": { "id": 4, "nombre": "San Gil" }, "geometry": { "type": "Point", "coordinates": [ -73.13204, 6.55392 ] } },
        { "type": "Feature", "properties": { "id": 5, "nombre": "Zapatoca" }, "geometry": { "type": "Point", "coordinates": [ -73.26892, 6.81563 ] } },
        { "type": "Feature", "properties": { "id": 6, "nombre": "Floridablanca" }, "geometry": { "type": "Point", "coordinates": [ -73.08574, 7.06032 ] } },
        { "type": "Feature", "properties": { "id": 7, "nombre": "Bucaramanga" }, "geometry": { "type": "Point", "coordinates": [ -73.12137, 7.11885 ] } },
        { "type": "Feature", "properties": { "id": 8, "nombre": "Lebrija" }, "geometry": { "type": "Point", "coordinates": [ -73.21830, 7.11412 ] } },
        { "type": "Feature", "properties": { "id": 9, "nombre": "San Joaquín" }, "geometry": { "type": "Point", "coordinates": [ -72.86688, 6.42800 ] } },
        { "type": "Feature", "properties": { "id": 10, "nombre": "Tona" }, "geometry": { "type": "Point", "coordinates": [ -72.96623, 7.20242 ] } }
    ]
};

var colores = [
    "red", "blue", "green", "orange", "purple",
    "cyan", "magenta", "yellow", "brown", "pink"
];

var puntosCapa = L.geoJSON(puntocorordenadas, {
    onEachFeature: function (feature, layer) {
        if (feature.properties?.nombre) {
            layer.bindPopup(feature.properties.nombre);
        }
    },
    pointToLayer: function (feature, latlng) {
        var color = colores[(feature.properties.id - 1) % colores.length];
        coloresPorCiudad[feature.properties.nombre] = color;
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

var layerGeojson = puntosCapa;