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

// Definir EPSG:3116
proj4.defs("EPSG:3116", "+proj=tmerc +lat_0=4.59620041666667 +lon_0=-74.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");

// Definir EPSG:9377
proj4.defs("EPSG:9377", "+proj=tmerc +lat_0=4.0 +lon_0=-73.0 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// Estado inicial: EPSG:3116
var currentCRS = "EPSG:3116"; 

// Crear el control de coordenadas
var coordControl = L.control({ position: "bottomleft" });

coordControl.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-control-coordinates");
    div.innerHTML = `
        <span id="coordLabel">(EPSG:3116): </span>
        <span id="coordValue">N: 0.000000, E: 0.000000</span>
        <button id="toggleCRS" title="Cambiar proyección">
            <i class="fas fa-sync-alt"></i>
        </button>
    `;
    return div;
};

coordControl.addTo(map);

// Función para transformar coordenadas entre EPSG:3116 y EPSG:9377
function transformCoords(lat, lon, targetCRS) {
    return proj4("EPSG:4326", targetCRS, [lon, lat]);
}

// Evento para actualizar coordenadas con formato "N: XXXX.XXXXXX, E: XXXX.XXXXXX"
map.on("mousemove", function (e) {
    var coordValue = document.getElementById("coordValue");
    var point = transformCoords(e.latlng.lat, e.latlng.lng, currentCRS);
    coordValue.innerHTML = `N: ${point[1].toFixed(6)}, E: ${point[0].toFixed(6)}`;
});

// Evento para cambiar entre EPSG:3116 y EPSG:9377 al hacer clic en el botón
document.addEventListener("click", function (event) {
    if (event.target.id === "toggleCRS") {
        currentCRS = currentCRS === "EPSG:3116" ? "EPSG:9377" : "EPSG:3116";
        document.getElementById("coordLabel").innerText = `(${currentCRS}): `;
    }
});
