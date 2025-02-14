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
