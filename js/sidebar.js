const rutasCapas = ["layers/puntos_sitios"];
const contenedorCapas = document.getElementById("capasSidebarLista");
const capasCargadas = {}; // Aquí guardamos las capas por ruta

rutasCapas.forEach(ruta => {
    fetch(`${ruta}/info.json`)
        .then(resp => resp.json())
        .then(info => {
            const capaDiv = document.createElement("div");
            capaDiv.className = "capa-item-sidebar";
            capaDiv.innerHTML = `
                <h4>${info.nombre}</h4>
                <img src="${ruta}/${info.preview}" alt="Preview" class="capa-preview">
                <div class="capa-detalle">
                    <p><strong>Entidad:</strong> ${info.entidad || 'No especificada'}</p>
                    <p><strong>Resumen:</strong><br>${info.descripcion}</p>
                    <p><strong>Fecha de Elaboración:</strong> ${info.fecha || 'No disponible'}</p>
                    <p><strong>Licencia:</strong> ${info.licencia || 'No disponible'}</p>
                    <p style="font-size:13px; white-space:pre-line;">${info.notas || ''}</p>
                </div>
                <button class="agregar-btn" data-layer="${ruta}">Agregar al mapa</button>
                <div class="capa-enlaces">
                    <a href="${ruta}/servicio" target="_blank">Servicio (REST)</a> |
                    <a href="${ruta}/metadato" target="_blank">Metadato</a>
                </div>
            `;
            contenedorCapas.appendChild(capaDiv);

            const btnAgregarCapa = capaDiv.querySelector(".agregar-btn");

            btnAgregarCapa.addEventListener("click", function () {
                const yaCargada = capasCargadas[ruta];

                if (yaCargada && map.hasLayer(yaCargada)) {
                    // Eliminar capa
                    map.removeLayer(yaCargada);

                    document.querySelectorAll(".capa-item").forEach(el => {
                        if (el.querySelector("span")?.innerText === info.nombre) el.remove();
                    });
                    document.querySelectorAll(".leyenda").forEach(el => el.remove());

                    // Cambiar el texto y el color del botón a verde
                    btnAgregarCapa.innerText = "Agregar al mapa";
                    btnAgregarCapa.style.backgroundColor = "#28a745"; // Verde para agregar

                } else {
                    // Ver si ya fue creada antes o cargarla desde JS
                    if (capasCargadas[ruta]) {
                        // Ya está cargada, solo agregar al mapa y panel
                        map.addLayer(capasCargadas[ruta]);
                        agregarCapa(info.nombre, capasCargadas[ruta], info.tipo || "punto", true, document.getElementById("capasLista"));

                        // Cambiar el texto y el color del botón a rojo para eliminar
                        btnAgregarCapa.innerText = "Eliminar del mapa";
                        btnAgregarCapa.style.backgroundColor = "#dc3545"; // Rojo para eliminar
                    } else {
                        // Cargar y guardar
                        const script = document.createElement("script");
                        script.src = `${ruta}/layer.js`;

                        script.onload = function () {
                            if (typeof layerGeojson !== "undefined") {
                                capasCargadas[ruta] = layerGeojson;
                                layerGeojson._customRuta = ruta;
                                map.addLayer(layerGeojson);

                                agregarCapa(info.nombre, layerGeojson, info.tipo || "punto", true, document.getElementById("capasLista"));

                                // Cambiar el texto y el color del botón a rojo para eliminar
                                btnAgregarCapa.innerText = "Eliminar del mapa";
                                btnAgregarCapa.style.backgroundColor = "#dc3545"; // Rojo para eliminar
                            } else {
                                console.error("layerGeojson no definido en", ruta);
                            }
                        };

                        document.body.appendChild(script);
                    }
                }
            });
        })
        .catch(err => {
            console.error("Error cargando capa:", ruta, err);
        });
});
