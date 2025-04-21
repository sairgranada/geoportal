fetch("template/panelCapas.html")
    .then(res => res.text())
    .then(html => {
        const contenedor = document.createElement("div");
        contenedor.innerHTML = html;
        document.body.appendChild(contenedor);
    });


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
    var div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom boton-home");
    div.innerHTML = '<i class="fa-solid fa-house"></i>'; 
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
        <button id="toggleCRS" title="Cambiar proyección"><i class="fas fa-sync-alt"></i></button><span id="coordLabel">(EPSG:3116): </span> <span id="coordValue">N: 0.000000, E: 0.000000</span>
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



function agregarCapa(nombre, capa, tipo = "punto", activaPorDefecto = false, contenedorDestino) {
    const capaElemento = document.createElement("div");
    capaElemento.className = "capa-item";

    const capaNombre = document.createElement("span");
    capaNombre.innerText = nombre;

    const botonesContainer = document.createElement("div");
    botonesContainer.className = "botones-container";

    const leyenda = document.createElement("div");
    leyenda.className = "leyenda";
    leyenda.style.display = "none";

    function generarSimbologia() {
        leyenda.innerHTML = "";
        capa.eachLayer(layer => {
            const nombre = layer.feature?.properties?.nombre || "Sin Nombre";
            const id = layer.feature?.properties?.id || 1;
            const color = colores[(id - 1) % colores.length];

            const item = document.createElement("div");
            item.className = "leyenda-item";

            if (tipo === "linea") {
                item.innerHTML = `
                    <span class="leyenda-simbolo-linea" style="border-top-color: ${color};"></span>
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

    const btnActivar = document.createElement("button");
    btnActivar.className = "layersToolBtn";
    btnActivar.title = activaPorDefecto ? "Desactivar capa" : "Activar capa";
    btnActivar.innerHTML = activaPorDefecto
        ? '<i class="fa-solid fa-circle text-green"></i>'
        : '<i class="fa-solid fa-circle text-gray"></i>';

    btnActivar.onclick = function () {
        if (map.hasLayer(capa)) {
            map.removeLayer(capa);
            btnActivar.innerHTML = '<i class="fa-solid fa-circle text-gray"></i>';
            btnActivar.title = "Activar capa";
            leyenda.style.display = "none";
        } else {
            map.addLayer(capa);
            btnActivar.innerHTML = '<i class="fa-solid fa-circle text-green"></i>';
            btnActivar.title = "Desactivar capa";
            generarSimbologia();
        }
    };

    if (!activaPorDefecto) {
        map.removeLayer(capa);
    }

    const btnCentrar = document.createElement("button");
    btnCentrar.className = "layersToolBtn";
    btnCentrar.innerHTML = '<i class="fa-solid fa-arrows-to-eye"></i>';
    btnCentrar.title = "Centrar capa";
    btnCentrar.onclick = function () {
        map.fitBounds(capa.getBounds());
    };

    const btnLeyenda = document.createElement("button");
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

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "layersToolBtn";
    btnEliminar.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    btnEliminar.title = "Eliminar capa";
    btnEliminar.onclick = function () {
        map.removeLayer(capa);
        capaElemento.remove();
        leyenda.remove();

        if (capa._customRuta) {
            const botonSidebar = document.querySelector(`.agregar-btn[data-layer="${capa._customRuta}"]`);
            if (botonSidebar) {
                botonSidebar.innerText = "Agregar al mapa";
                botonSidebar.disabled = false;
            }
        }
    };

    botonesContainer.appendChild(btnActivar);
    botonesContainer.appendChild(btnCentrar);
    botonesContainer.appendChild(btnLeyenda);
    botonesContainer.appendChild(btnEliminar);

    capaElemento.appendChild(capaNombre);
    capaElemento.appendChild(botonesContainer);
    contenedorDestino.appendChild(capaElemento);
    contenedorDestino.appendChild(leyenda);
}


// === Panel flotante de mapas base y capas ===
var capasMenu = L.DomUtil.create("div", "panelLayers");
capasMenu.id = "panelLayers";
capasMenu.style.display = "none";
document.body.appendChild(capasMenu);
capasMenu.innerHTML = `
    <div class="panel-header" id="panelHeader"><span>Capas Activas</span><button id="closeLayersBtn">X</button></div>
    <div class="panel-body"><label>Mapa base</label><select id="mapaBaseSelect"></select><label>Capas activas</label><div id="capasLista"></div></div>
`;

// Panel flotante arrastrable
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

// Botón flotante para abrir/cerrar el panel
var capasControlButton = L.control({ position: "topright" });
capasControlButton.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom capa-toggle-btn");
    div.innerHTML = '<i class="fa-solid fa-layer-group"></i>';
    div.title = "Mapa Base y Capas";
    div.onclick = function () {
        capasMenu.style.display = capasMenu.style.display === "none" ? "block" : "none";
    };
    return div;
};
capasControlButton.addTo(map);

// Botón cerrar panel
document.getElementById("closeLayersBtn").onclick = function () {
    capasMenu.style.display = "none";
};


// Mapas base en dropdown
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


