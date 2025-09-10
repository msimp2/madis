export const tileLayerUrls = {
    default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};

export function setupBasemapSelector(map) {
    let currentTileLayer = L.tileLayer(tileLayerUrls.default, {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const basemapSelector = document.getElementById('basemap-selector');
    basemapSelector.addEventListener('change', function () {
        const mode = basemapSelector.value;
        if (currentTileLayer) {
            map.removeLayer(currentTileLayer);
        }
        const url = tileLayerUrls[mode] || tileLayerUrls.default;
        let attribution = '&copy; OpenStreetMap contributors';
        if (mode === 'dark') {
            attribution += ' &copy; CARTO';
        } else if (mode === 'satellite') {
            attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
        }
        currentTileLayer = L.tileLayer(url, { attribution }).addTo(map);
    });
    return currentTileLayer;
}