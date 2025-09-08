import { showGrid, hideGrid } from './Overlay/latlon.js';
import { setupBasemapSelector } from './Overlay/basemap.js';
import { addStatesLayer, removeStatesLayer, updateStatesLayerColor } from './Overlay/states.js';
import { addCountiesLayer, removeCountiesLayer, updateCountiesLayerColor, updateCountiesNamesVisibility } from './Overlay/counties.js';
import { buildmadisUrl, fetchAndPlotMadisData, setupMadisInputListeners } from './madis.js';


var map = L.map('map').setView([40, -100], 6);
setupBasemapSelector(map);
window.map = map;

function pad(n) {
    return n < 10 ? '0' + n : n;
}
function updateClocks() {
    const now = new Date();

    // Local time (24-hour)
    const localHours = pad(now.getHours());
    const localMinutes = pad(now.getMinutes());
    const localSeconds = pad(now.getSeconds());
    const localTime = `${localHours}:${localMinutes}:${localSeconds}`;
    const localClockElem = document.getElementById('local-clock');
    if (localClockElem) {
        localClockElem.textContent = `Local: ${localTime}`;
    }

    // UTC time (24-hour)
    const utcHours = pad(now.getUTCHours());
    const utcMinutes = pad(now.getUTCMinutes());
    const utcSeconds = pad(now.getUTCSeconds());
    const utcTime = `${utcHours}:${utcMinutes}:${utcSeconds}`;
    const utcClockElem = document.getElementById('utc-clock');
    if (utcClockElem) {
        utcClockElem.textContent = `UTC: ${utcTime}`;
    }
}

// Start the clocks when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    updateClocks();
    setInterval(updateClocks, 1000);
});

// --- END CLOCKS ---

const tileLayerUrls = {
    default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};

let currentTileLayer = L.tileLayer(tileLayerUrls.default, {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let gridVisible = false;
let gridColor = '#888888';

const basemapSelector = document.getElementById('basemap-selector');
const latlonGridColorInput = document.getElementById('gridColorInput');
const latlonGridToggleCheckbox = document.getElementById('toggleGridCheckbox');

// Checkbox toggles lat/lon grid visibility
latlonGridToggleCheckbox.addEventListener('change', function () {
    gridVisible = this.checked;
    if (gridVisible) {
        showGrid(map, gridColor);
    } else {
        hideGrid(map);
    }
});

// Update grid color and show grid if visible when color input changes
latlonGridColorInput.addEventListener('input', () => {
    gridColor = latlonGridColorInput.value;
    if (gridVisible) {
        showGrid(map, gridColor);
    }
});

// Show lat/lon grid when map moves, if visible
map.on('moveend', function () {
    if (gridVisible) {
        showGrid(map, gridColor);
    }
});

// States
const statesCheckbox = document.getElementById('states-checkbox');
const statesColorInput = document.getElementById('statesColorInput');

statesCheckbox.addEventListener('change', function () {
    if (statesCheckbox.checked) {
        addStatesLayer(map, statesColorInput.value);
    } else {
        removeStatesLayer(map);
    }
});

statesColorInput.addEventListener('input', function () {
    if (statesCheckbox.checked) {
        updateStatesLayerColor(map, statesColorInput.value);
    }
});

// Counties
const countiesCheckbox = document.getElementById('counties-checkbox');
const countiesColorInput = document.getElementById('countiesColorInput');
const countiesNamesCheckbox = document.getElementById('counties-names-checkbox');

countiesCheckbox.addEventListener('change', function () {
    if (countiesCheckbox.checked) {
        addCountiesLayer(map, countiesColorInput.value, countiesNamesCheckbox.checked);
    } else {
        removeCountiesLayer(map);
    }
});

countiesColorInput.addEventListener('input', function () {
    if (countiesCheckbox.checked) {
        updateCountiesLayerColor(map, countiesColorInput.value);
    }
});

countiesNamesCheckbox.addEventListener('change', function () {
    if (countiesCheckbox.checked) {
        updateCountiesNamesVisibility(map, countiesNamesCheckbox.checked);
    }
});




// Plot pcp1h
document.addEventListener('DOMContentLoaded', () => {
    const pcp1h = document.getElementById('pcp1h');
    if (!pcp1h) {
        console.error('Plot button not found!');
        return;
    }
    pcp1h.addEventListener('click', () => {
        const dateInput = document.getElementById('datePicker').value; // yyyy-mm-dd
        let hourInput = document.getElementById('hourPicker').value; // H or HH

        if (!dateInput || hourInput === '') {
            alert('Please select both date and hour.');
            return;
        }

        // Format date as yyyymmdd
        const yyyymmdd = dateInput.replace(/-/g, '');

        // Pad hour to HH
        hourInput = hourInput.padStart(2, '0');

        // Build URL and plot
        const madisUrl = buildmadisUrl(yyyymmdd, hourInput, '00', 0, 0, 'PCP1H');
        console.log(madisUrl);

        const proxyUrl = `/api/madisproxy?url=${encodeURIComponent(madisUrl)}`;
        fetchAndPlotMadisData(proxyUrl, window.map);
        setupMadisInputListeners(map);

    });
});