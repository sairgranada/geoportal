var KR27 = {
    "type": "FeatureCollection",
    "name": "linea",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        {
            "type": "Feature",
            "properties": { "id": 27 },
            "geometry": {
                "type": "MultiLineString",
                "coordinates": [
                    [ [ -73.1202987802, 7.1364700570 ], [ -73.1203090500, 7.1348576873 ], [ -73.1201960814, 7.1339539388 ], [ -73.1198674456, 7.1320334730 ], [ -73.1196106988, 7.1307189296 ] ]
                ]
            }
        }
    ]
};

// Crear capa de línea con simbología
var lineasCapa = L.geoJSON(KR27, {
    style: function (feature) {
        return { color: "blue", weight: 2 };
    }
});
