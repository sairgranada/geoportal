// Crear un objeto mapa centrado en Colombia con zoom adecuado
var map = L.map("map", {
    minZoom: 2.5 // Evita que el mapa se aleje demasiado y queden bandas blancas
}).setView([4.5709, -74.2973], 6);


// Agregar capa de OpenStreetMap evitando la repetición del mosaico
var capaOSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    bounds: [[-90, -180], [90, 180]], 
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Restringir la navegación del usuario dentro del mundo
map.setMaxBounds([[-90, -180], [90, 180]]);

// Agregar tooltips a los controles de zoom
document.querySelector(".leaflet-control-zoom-in").setAttribute("title", "Acercar");
document.querySelector(".leaflet-control-zoom-out").setAttribute("title", "Alejar");

// **Botón de Home (Extensión predeterminada)**
var homeButton = L.control({ position: "topleft" });

homeButton.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
    div.innerHTML = "🏠︎"; 
    div.style.backgroundColor = "white";
    div.style.width = "30px";
    div.style.height = "30px";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.cursor = "pointer";
    div.style.borderRadius = "4px";
    div.style.fontSize = "20px";
    div.title = "Extensión predeterminada";

    div.onclick = function () {
        map.setView([4.5709, -74.2973], 6);
    };

    return div;
};
homeButton.addTo(map);

// **Botón de ubicación**
var locateControl = L.control.locate({
    position: "topleft",
    flyTo: true,
    setView: 'once',
    showCompass: true,
    locateOptions: { enableHighAccuracy: true }
}).addTo(map);

setTimeout(() => {
    document.querySelector(".leaflet-control-locate a").setAttribute("title", "Buscar mi ubicación");
}, 500);

// **Definir EPSG:3116**
proj4.defs("EPSG:3116", "+proj=tmerc +lat_0=4.59620041666667 +lon_0=-74.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");

// **Definir EPSG:9377**
proj4.defs("EPSG:9377", "+proj=tmerc +lat_0=4.0 +lon_0=-73.0 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// **Estado inicial: EPSG:3116**
var currentCRS = "EPSG:3116";

// **Control de coordenadas**
var coordControl = L.control({ position: "bottomleft" });

coordControl.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-control-coordinates");
    div.style.display = "none"; 
    div.innerHTML = `
        <button id="toggleCRS" title="Cambiar proyección">
            <i class="fas fa-sync-alt"></i>
        </button>
        <span id="coordLabel">(EPSG:3116): </span>
        <span id="coordValue">N: 0.000000, E: 0.000000</span>
    `;
    return div;
};
coordControl.addTo(map);

// **Escala**
var scaleControl = L.control.scale({
    position: 'bottomleft', 
    metric: true,
    imperial: false
}).addTo(map);

// **Referencia a coordenadas**
var coordContainer = document.querySelector(".leaflet-control-coordinates");

// **Transformar coordenadas**
function transformCoords(lat, lon, targetCRS) {
    return proj4("EPSG:4326", targetCRS, [lon, lat]);
}

// **Mostrar coordenadas al mover el mouse**
map.on("mousemove", function (e) {
    if (coordContainer.style.display === "none") {
        coordContainer.style.display = "flex"; 
    }

    map._lastMouseEvent = e.latlng; 
    var coordValue = document.getElementById("coordValue");
    var point = transformCoords(e.latlng.lat, e.latlng.lng, currentCRS);
    coordValue.innerHTML = `N: ${point[1].toFixed(6)}, E: ${point[0].toFixed(6)}`;
});

// **Ocultar coordenadas al salir del mapa**
map.on("mouseout", function () {
    coordContainer.style.display = "none";
});

// **Cambiar entre EPSG:3116 y EPSG:9377 al hacer clic**
document.addEventListener("click", function (event) {
    if (event.target.id === "toggleCRS" || event.target.closest("#toggleCRS")) {
        currentCRS = currentCRS === "EPSG:3116" ? "EPSG:9377" : "EPSG:3116";
        document.getElementById("coordLabel").innerText = `(${currentCRS}): `;

        var mouseEvent = map._lastMouseEvent || map.getCenter();
        var point = transformCoords(mouseEvent.lat, mouseEvent.lng, currentCRS);

        document.getElementById("coordValue").innerHTML = `N: ${point[1].toFixed(6)}, E: ${point[0].toFixed(6)}`;
    }
});

// **Definir mapas base**
var mapasBase = {
    "Predeterminado": capaOSM,
    "Relieve": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", { attribution: '&copy; Esri' }),
    "Satélite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: '&copy; Esri' }),
    "Calles": L.tileLayer("https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", { attribution: '&copy; Esri' }),
};

// **Botón de capas con el mismo estilo que Home**
var capasButton = L.control({ position: "topright" });

capasButton.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
    div.innerHTML = "🗺"; // Icono de capas
    div.style.backgroundColor = "white";
    div.style.width = "30px";
    div.style.height = "30px";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.cursor = "pointer";
    div.style.borderRadius = "4px";
    div.style.fontSize = "20px";
    div.title = "Seleccionar mapa base";

    var layersControl = L.control.layers(mapasBase, null, { collapsed: false });
    layersControl.addTo(map);

    div.onclick = function () {
        var layersContainer = document.querySelector(".leaflet-control-layers");
        layersContainer.style.display = layersContainer.style.display === "none" ? "block" : "none";
    };

    return div;
};
capasButton.addTo(map);