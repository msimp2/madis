let countiesLayer = null;
let countiesLabelsLayer = null;
let lastColor = '#ff8800';
let lastShowNames = false;

function getFeatureCenter(feature) {
    // Handles both Polygon and MultiPolygon
    let coords = feature.geometry.type === "Polygon"
        ? feature.geometry.coordinates[0]
        : feature.geometry.coordinates[0][0];
    let lat = 0, lng = 0;
    coords.forEach(([lon, la]) => { lat += la; lng += lon; });
    let n = coords.length;
    return [lat / n, lng / n];
}

export function addCountiesLayer(map, color = '#ff8800', showNames = false) {
    lastColor = color;
    lastShowNames = showNames;
    if (countiesLayer) {
        map.removeLayer(countiesLayer);
        countiesLayer = null;
    }
    if (countiesLabelsLayer) {
        map.removeLayer(countiesLabelsLayer);
        countiesLabelsLayer = null;
    }
    countiesLayer = L.geoJSON(null, {
        style: {
            color: color,
            weight: 1.5,
            fill: false
        }
    });
    fetch('Reference/Counties.json')
        .then(response => response.json())
        .then(data => {
            countiesLayer.addData(data);
            countiesLayer.addTo(map);

            if (showNames) {
                countiesLabelsLayer = L.layerGroup();
                data.features.forEach(feature => {
                    const center = getFeatureCenter(feature);
                    const name = feature.properties.NAME;
                    const label = L.marker(center, {
                        icon: L.divIcon({
                            className: 'county-label',
                            html: `<span>${name}</span>`,
                            iconSize: [100, 24],
                            iconAnchor: [10, 12]
                        }),
                        interactive: false
                    });
                    countiesLabelsLayer.addLayer(label);
                });
                countiesLabelsLayer.addTo(map);
            }
        });
}

export function removeCountiesLayer(map) {
    if (countiesLayer) {
        map.removeLayer(countiesLayer);
        countiesLayer = null;
    }
    if (countiesLabelsLayer) {
        map.removeLayer(countiesLabelsLayer);
        countiesLabelsLayer = null;
    }
}

export function updateCountiesLayerColor(map, color) {
    addCountiesLayer(map, color, lastShowNames);
}

export function updateCountiesNamesVisibility(map, showNames) {
    addCountiesLayer(map, lastColor, showNames);
}