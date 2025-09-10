let statesLayer = null;
let lastColor = '#3388ff';

export function addStatesLayer(map, color = '#3388ff') {
    lastColor = color;
    if (statesLayer) {
        map.removeLayer(statesLayer);
        statesLayer = null;
    }
    statesLayer = L.geoJSON(null, {
        style: {
            color: color,
            weight: 2,
            fill: false
        }
    });
    fetch('Reference/States.json')
        .then(response => response.json())
        .then(data => {
            statesLayer.addData(data);
            statesLayer.addTo(map);
        });
}

export function removeStatesLayer(map) {
    if (statesLayer) {
        map.removeLayer(statesLayer);
        statesLayer = null;
    }
}

export function updateStatesLayerColor(map, color) {
    if (statesLayer) {
        addStatesLayer(map, color);
    }
}