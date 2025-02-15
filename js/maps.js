// Crear un objeto mapa centrado en Colombia con zoom adecuado
var map = L.map("map").setView([4.5709, -74.2973], 6); 

// Agregar capa de OpenStreetMap evitando la repetición del mosaico
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    bounds: [[-90, -180], [90, 180]], // Limita la vista del mapa
    attribution: '&copy; OpenStreetMap | Granada Garzón, S., Pérez Montejo, A. A.'
}).addTo(map);

// Restringir la navegación del usuario dentro del mundo
map.setMaxBounds([
    [-90, -180], 
    [90, 180]   
]);


// Agregar tooltips a los controles de zoom
document.querySelector(".leaflet-control-zoom-in").setAttribute("title", "Acercar");
document.querySelector(".leaflet-control-zoom-out").setAttribute("title", "Alejar");

// Botón de Home (Extensión predeterminada)
var homeButton = L.control({ position: "topleft" });

homeButton.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
    div.innerHTML = "🏠︎"; // Ícono simple de casa negra
    div.style.backgroundColor = "white";
    div.style.width = "30px";
    div.style.height = "30px";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.cursor = "pointer";
    div.style.borderRadius = "4px";
    div.style.fontSize = "20px";
    div.title = "Extensión predeterminada"; // Tooltip

    div.onclick = function () {
        map.setView([4.5709, -74.2973], 6); // Regresar a la vista inicial
    };

    return div;
};
homeButton.addTo(map);

// Botón de ubicación
var locateControl = L.control.locate({
    position: "topleft", 
    flyTo: true,         
    setView: 'once',     
    showCompass: true,   
    locateOptions: {
        enableHighAccuracy: true 
    }
}).addTo(map);

// Agregar tooltip al botón de ubicación después de crearlo
setTimeout(() => {
    document.querySelector(".leaflet-control-locate a").setAttribute("title", "Buscar mi ubicación");
}, 500);

// Agregar proyección EPSG:3116 usando proj4leaflet
var crs3116 = new L.Proj.CRS(
    'EPSG:3116',
    '+proj=tmerc +lat_0=4 +lon_0=-73 +k=0.9992 +x_0=500000 +y_0=2000000 +datum=WGS84 +units=m +no_defs',
    {
        resolutions: [4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1]
    }
);

// Estado inicial de las coordenadas
var currentCRS = "EPSG:4326"; // Inicia en lat/lon

// Crear el control de coordenadas compacto
var coordControl = L.control({ position: "bottomleft" });

coordControl.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-control-coordinates");
    div.innerHTML = `
        <span id="coordLabel">(EPSG:4326): </span>
        <span id="coordValue">Lat: 0, Lon: 0</span>
        <button id="toggleCRS">🔄</button>
    `;
    return div;
};

coordControl.addTo(map);

// Función para transformar coordenadas a EPSG:3116
function transformToEPSG3116(lat, lon) {
    var point = proj4('EPSG:4326', 'EPSG:3116', [lon, lat]); 
    return { x: point[0].toFixed(2), y: point[1].toFixed(2) };
}

// Evento para actualizar coordenadas según el sistema actual
map.on("mousemove", function (e) {
    var coordValue = document.getElementById("coordValue");

    if (currentCRS === "EPSG:4326") {
        coordValue.innerHTML = `Lat: ${e.latlng.lat.toFixed(6)}, Lon: ${e.latlng.lng.toFixed(6)}`;
    } else {
        var epsg3116 = transformToEPSG3116(e.latlng.lat, e.latlng.lng);
        coordValue.innerHTML = `X: ${epsg3116.x}, Y: ${epsg3116.y}`;
    }
});

// Evento para cambiar el sistema de coordenadas al hacer clic en el botón
document.addEventListener("click", function (event) {
    if (event.target.id === "toggleCRS") {
        currentCRS = currentCRS === "EPSG:4326" ? "EPSG:3116" : "EPSG:4326";
        document.getElementById("coordLabel").innerText = `Coordenada (${currentCRS}): `;
    }
});