let gridLayer = null;
let labelOverlay = null;
let enabled = false;
let currentColor = '#888';

export function showGrid(map, color = '#888') {
    hideGrid(map);
    gridLayer = drawLatLonGrid(map, color);
    labelOverlay = addLatLonLabels(map);
    map.on('move', updateLatLonLabels);
    map.on('zoom', updateLatLonLabels);
    enabled = true;
    currentColor = color;

    function updateLatLonLabels() {
        if (labelOverlay) {
            labelOverlay.remove();
            labelOverlay = addLatLonLabels(map);
        }
    }
    showGrid._updateHandler = updateLatLonLabels;
}

export function hideGrid(map) {
    if (gridLayer) {
        map.removeLayer(gridLayer);
        gridLayer = null;
    }
    if (labelOverlay) {
        labelOverlay.remove();
        labelOverlay = null;
    }
    if (showGrid._updateHandler) {
        map.off('move', showGrid._updateHandler);
        map.off('zoom', showGrid._updateHandler);
    }
    enabled = false;
}

export function getCurrentGridColor() {
    return currentColor;
}

function drawLatLonGrid(map, color = '#888') {
    const bounds = map.getBounds();
    const minLat = Math.floor(bounds.getSouth());
    const maxLat = Math.ceil(bounds.getNorth());
    const minLng = Math.floor(bounds.getWest());
    const maxLng = Math.ceil(bounds.getEast());
    const lines = [];

    // Draw latitude lines
    for (let lat = minLat; lat <= maxLat; lat++) {
        lines.push(L.polyline([
            [lat, minLng],
            [lat, maxLng]
        ], { color: color, weight: 1, opacity: 1, interactive: false }));
    }

    // Draw longitude lines
    for (let lng = minLng; lng <= maxLng; lng++) {
        lines.push(L.polyline([
            [minLat, lng],
            [maxLat, lng]
        ], { color: color, weight: 1, opacity: 1, interactive: false }));
    }

    // Group all lines into a single layer group
    return L.layerGroup(lines).addTo(map);
}

function addLatLonLabels(map) {
    // Remove any existing label container
    const old = document.querySelector('.latlon-labels');
    if (old) old.remove();

    const mapContainer = map.getContainer();
    const bounds = map.getBounds();
    const minLat = Math.floor(bounds.getSouth());
    const maxLat = Math.ceil(bounds.getNorth());
    const minLng = Math.floor(bounds.getWest());
    const maxLng = Math.ceil(bounds.getEast());

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.className = 'latlon-labels';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';

    // Add latitude labels (left side)
    for (let lat = minLat; lat <= maxLat; lat++) {
        const latPoint = map.latLngToContainerPoint([lat, bounds.getWest()]);
        const label = document.createElement('div');
        label.className = 'lat-label';
        label.style.top = `${latPoint.y}px`;
        label.textContent = lat;
        overlay.appendChild(label);
    }

    // Add longitude labels (bottom)
    for (let lng = minLng; lng <= maxLng; lng++) {
        const lngPoint = map.latLngToContainerPoint([bounds.getSouth(), lng]);
        const label = document.createElement('div');
        label.className = 'lon-label';
        label.style.left = `${lngPoint.x}px`;
        label.textContent = lng;
        overlay.appendChild(label);
    }

    // Append overlay to map container
    mapContainer.appendChild(overlay);

    // Return overlay for later removal
    return {
        remove: () => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }
    };
}