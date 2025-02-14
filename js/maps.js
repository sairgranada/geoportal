//Crear un objeto mapa
var map = L.map("map").setView([0, 0], 1);

// Agregar capa de OpenStreetMap
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Añadir la capa al mapa
osm.addTo(map);