// Crear un objeto mapa centrado en Colombia con zoom adecuado
var map = L.map("map", {
    minZoom: 2.5 // Evita que el mapa se aleje demasiado y queden bandas blancas
}).setView([4.5709, -74.2973], 6);


// Agregar capa de OpenStreetMap evitando la repetición del mosaico
var capaOSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    bounds: [[-90, -180], [90, 180]], 
    attribution: '&copy; OpenStreetMap'
}).addTo(map);


// Restringir la navegación
map.setMaxBounds([[-90, -180], [90, 180]]);


//  Controles de zoom
document.querySelector(".leaflet-control-zoom-in").setAttribute("title", "Acercar");
document.querySelector(".leaflet-control-zoom-out").setAttribute("title", "Alejar");


// Boton Extensión predeterminada
var homeButton = L.control({ position: "topleft" });
homeButton.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
    div.innerHTML = '<i class="fa-solid fa-house"></i>'; 
    div.style.backgroundColor = "white";
    div.style.width = "30px";
    div.style.height = "30px";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.cursor = "pointer";
    div.style.borderRadius = "4px";
    div.style.fontSize = "16px";
    div.title = "Extensión predeterminada";
    div.onclick = function () {
        map.setView([4.5709, -74.2973], 6);
    };
    return div;
};
homeButton.addTo(map);


// Botón de Buscar mi ubicación
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


// Control de coordenadas
proj4.defs("EPSG:3116", "+proj=tmerc +lat_0=4.59620041666667 +lon_0=-74.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:9377", "+proj=tmerc +lat_0=4.0 +lon_0=-73.0 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
var currentCRS = "EPSG:3116";
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
var coordContainer = document.querySelector(".leaflet-control-coordinates");
function transformCoords(lat, lon, targetCRS) {
    return proj4("EPSG:4326", targetCRS, [lon, lat]);
}map.on("mousemove", function (e) {
    if (coordContainer.style.display === "none") {
        coordContainer.style.display = "flex"; 
    }
    var coordValue = document.getElementById("coordValue");
    var point = transformCoords(e.latlng.lat, e.latlng.lng, currentCRS);
    coordValue.innerHTML = `N: ${point[1].toFixed(6)}, E: ${point[0].toFixed(6)}`;
});
map.on("mouseout", function () {
    coordContainer.style.display = "none";
});
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("toggleCRS").addEventListener("click", function () {
        currentCRS = currentCRS === "EPSG:3116" ? "EPSG:9377" : "EPSG:3116";
        document.getElementById("coordLabel").innerText = `(${currentCRS}):`;
    });
});


// Escala
var scaleControl = L.control.scale({
    position: 'bottomleft', 
    metric: true,
    imperial: false
}).addTo(map);


// Mapas Base
var mapasBase = {
    "Mapa OpenStreetMap": capaOSM,
    "Mapa de Relieve Esri": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", { attribution: '&copy; Esri' }),
    "Mapa Satelital Esri": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: '&copy; Esri' }),
    "Mapa de Calles Esri": L.tileLayer("https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", { attribution: '&copy; Esri' }),
};


// Panel de Mapa Base y Capas
var capasMenu = L.DomUtil.create("div", "panelLayers");
capasMenu.id = "panelLayers";
capasMenu.style.display = "none";
capasMenu.style.position = "absolute";
capasMenu.style.top = "80px";
capasMenu.style.right = "55px";
document.body.appendChild(capasMenu);
capasMenu.innerHTML = `
    <div class="panel-header" id="panelHeader">
        <span>Capas Activas</span>
        <button id="closeLayersBtn">X</button>
    </div>
    <div class="panel-body">
        <label>Mapa base</label>
        <select id="mapaBaseSelect"></select>
        <label>Capas activas</label>
        <div id="capasLista"></div>
    </div>
`;
var style = document.createElement("style");
style.innerHTML = `
    .panelLayers {
    position: absolute;
    top: 60px;
    right: 10px;
    background: #ffffff;
    padding: 0px;
    border-radius: 0px;
    box-shadow: 0px 4px 10px rgba(0,0,0,0.3);
    width: 310px;
    z-index: 1000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    display: none;
    }
    .panel-header {
    display: flex;
    top: 0px;
    justify-content: space-between;
    align-items: center;
    background: black; /* Fondo negro */
    color: white; /* Letra blanca */
    width: 290px; /* Que ocupe todo el ancho */
    padding: 10px; /* Espaciado interno */
    margin-left: 0; /* Sin margen arriba */
    }
    .panel-header button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #fff;
    }
    .panel-body  {
        display: block;
        margin: 12px;
    }
    .panel-body label {
        display: block;
        margin: 5px 0;
    }
    .panel-body select {
        width: 100%;
        padding: 5px;
        border-radius: 4px;
        border: 1px solid #ccc;
        margin-bottom: 10px;
    }
    .capa-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background:#eeeeee;
        padding: 5px;
        border-radius: 4px 4px 0px 0px;
        font-size: 14px;
        margin-bottom: 5px;
    }
    .layersToolBtn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        margin-left: 5px;
    }
`;
document.head.appendChild(style);
let isDragging = false, startX, startY;
document.getElementById("panelHeader").addEventListener("mousedown", function (e) {
    isDragging = true;
    startX = e.clientX - capasMenu.offsetLeft;
    startY = e.clientY - capasMenu.offsetTop;
});
document.addEventListener("mousemove", function (e) {
    if (isDragging) {
        capasMenu.style.left = e.clientX - startX + "px";
        capasMenu.style.top = e.clientY - startY + "px";
    }
});
document.addEventListener("mouseup", function () {
    isDragging = false;
});

// Opciones mapas base
var mapaBaseSelect = document.getElementById("mapaBaseSelect");
Object.keys(mapasBase).forEach(function (key) {
    var option = document.createElement("option");
    option.value = key;
    option.innerText = key;
    mapaBaseSelect.appendChild(option);
});
mapaBaseSelect.onchange = function () {
    Object.values(mapasBase).forEach(function (layer) {
        map.removeLayer(layer);
    });
    mapasBase[mapaBaseSelect.value].addTo(map);
};

// Función para actualizar la lista de capas activas con leyenda dinámica
function actualizarListaCapas() {
    var capasLista = document.getElementById("capasLista");
    capasLista.innerHTML = ""; 

    // Agregar capas con nombres en la leyenda, desactivadas por defecto
    agregarCapa("Ciudades", puntosCapa, "punto", false);
    agregarCapa("Carreteras", lineasCapa, "linea", false);
}

// Definir una paleta de colores
var colores = [
    "red", "blue", "green", "orange", "purple",
    "cyan", "magenta", "yellow", "brown", "pink"
];

// Función auxiliar para agregar una capa al listado
function agregarCapa(nombre, capa, tipo = "punto", activaPorDefecto = false) {
    var capaElemento = document.createElement("div");
    capaElemento.className = "capa-item";

    var capaNombre = document.createElement("span");
    capaNombre.innerText = nombre;

    var botonesContainer = document.createElement("div");
    botonesContainer.className = "botones-container";

    var leyenda = document.createElement("div");
    leyenda.className = "leyenda";
    leyenda.style.display = "none";

    // Generar simbología con nombres en la capa
    function generarSimbologia() {
        leyenda.innerHTML = "";

        capa.eachLayer(function (layer) {
            var nombre = layer.feature?.properties?.nombre || "Sin Nombre";
            var id = layer.feature?.properties?.id || 1; 
            var color = colores[(id - 1) % colores.length]; // Usar la misma lógica de asignación de color

            var item = document.createElement("div");
            item.className = "leyenda-item";

            if (tipo === "linea") {
                item.innerHTML = `
                    <span class="leyenda-simbolo-linea" style="border-top: 3px solid ${color};"></span>
                    <span class="leyenda-texto">${nombre}</span>
                `;
            } else {
                item.innerHTML = `
                    <span class="leyenda-simbolo" style="background-color: ${color};"></span>
                    <span class="leyenda-texto">${nombre}</span>
                `;
            }
            
            leyenda.appendChild(item);
        });
    }

    var btnActivar = document.createElement("button");
    btnActivar.className = "layersToolBtn";
    btnActivar.title = activaPorDefecto ? "Desactivar capa" : "Activar capa";
    btnActivar.innerHTML = activaPorDefecto 
        ? '<i class="fa-solid fa-circle" style="color: green;"></i>' 
        : '<i class="fa-solid fa-circle" style="color: gray;"></i>';

    btnActivar.onclick = function () {
        if (map.hasLayer(capa)) {
            map.removeLayer(capa);
            btnActivar.innerHTML = '<i class="fa-solid fa-circle" style="color: gray;"></i>';
            btnActivar.title = "Activar capa";
            leyenda.style.display = "none";
        } else {
            map.addLayer(capa);
            btnActivar.innerHTML = '<i class="fa-solid fa-circle" style="color: green;"></i>';
            btnActivar.title = "Desactivar capa";
            generarSimbologia();
        }
    };

    if (!activaPorDefecto) {
        map.removeLayer(capa);
    }

    var btnCentrar = document.createElement("button");
    btnCentrar.className = "layersToolBtn";
    btnCentrar.innerHTML = '<i class="fa-solid fa-arrows-to-eye"></i>';
    btnCentrar.title = "Centrar capa";
    btnCentrar.onclick = function () { 
        map.fitBounds(capa.getBounds());
    };

    var btnLeyenda = document.createElement("button");
    btnLeyenda.className = "layersToolBtn";
    btnLeyenda.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
    btnLeyenda.title = "Mostrar Leyenda";
    btnLeyenda.onclick = function () { 
        if (leyenda.style.display === "none" && map.hasLayer(capa)) {
            generarSimbologia();
            leyenda.style.display = "block"; 
            btnLeyenda.innerHTML = '<i class="fa-solid fa-arrow-up"></i>'; 
        } else {
            leyenda.style.display = "none"; 
            btnLeyenda.innerHTML = '<i class="fa-solid fa-arrow-down"></i>'; 
        }
    };

    botonesContainer.appendChild(btnActivar);
    botonesContainer.appendChild(btnCentrar);
    botonesContainer.appendChild(btnLeyenda);

    capaElemento.appendChild(capaNombre);
    capaElemento.appendChild(botonesContainer);
    capasLista.appendChild(capaElemento);
    capasLista.appendChild(leyenda);
}

actualizarListaCapas();






var capasControlButton = L.control({ position: "topright" });
capasControlButton.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
    div.innerHTML = '<i class="fa-solid fa-layer-group"></i>';
    div.style.backgroundColor = "white";
    div.style.width = "30px";
    div.style.height = "30px";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.cursor = "pointer";
    div.style.borderRadius = "4px";
    div.style.fontSize = "17px";
    div.title = "Mapa Base y Capas";
    div.onclick = function () {
        capasMenu.style.display = capasMenu.style.display === "none" ? "block" : "none";
    };
    return div;
};
capasControlButton.addTo(map);

document.getElementById("closeLayersBtn").onclick = function () {
    capasMenu.style.display = "none";
};


