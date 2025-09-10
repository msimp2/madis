// Build MADIS URL
import { jetColor, addJetColormapLegend } from './Colormaps/Precip.js';
import { getColormapBounds } from './Colormaps/Bounds.js';
import { fetchMadisData } from './Reference/madisProxy.js';

export function buildmadisUrl(startDate, startHour, startMinute, lookBack, lookForward, variable) {
    return `https://madis-data.ncep.noaa.gov/madisPublic1/cgi-bin/madisXmlPublicDir?rdr=&time=${startDate}_${startHour}00&minbck=-0&minfwd=0&recwin=4&dfltrsel=0&state=AK&latll=0.0&lonll=0.0&latur=90.0&lonur=0.0&stanam=&stasel=0&pvdrsel=0&varsel=1&qctype=0&qcsel=0&xml=5&csvmiss=0&nvars=PCP1H&nvars=LAT&nvars=LON`;
    //return `https://madis-data.ncep.noaa.gov/madisPublic1/cgi-bin/madisXmlPublicDir?rdr=&time=${startDate}_${startHour}${startMinute}&minbck=-${lookBack}&minfwd=${lookForward}&recwin=4&dfltrsel=0&state=AK&latll=0.0&lonll=0.0&latur=90.0&lonur=0.0&stanam=&stasel=0&pvdrsel=0&varsel=1&qctype=0&qcsel=0&xml=5&csvmiss=0&nvars=${variable}&nvars=LAT&nvars=LON`;
}

// Fetch, parse, and plot CSV
export async function fetchAndPlotMadisData(url, map) {
    let text;
    try {
        text = await fetchMadisData(url);
    } catch (error) {
        alert(error.message);
        return;
    }
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;

    window.madisData = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length < 10) continue;
        const stationId = cols[0];
        const obvTime = cols[2];
        const provider = cols[3];
        let value;
        value = parseFloat(Math.round((cols[5] * 1000) * 100) / 100);
        value = Math.max(0, value);
        const lat = parseFloat(cols[7]);
        const lon = parseFloat(cols[9]);
        window.madisData.push({ stationId, obvTime, provider, value, lat, lon });
    }
    plotMadisData(map);
}

// Precipitation conversion helpers
function convertFromMM(value, unit) {
    if (unit === 'mm') return value;
    if (unit === 'in') return value / 25.4;
    return value;
}
function convertToMM(value, unit) {
    if (unit === 'mm') return value;
    if (unit === 'in') return value * 25.4;
    return value;
}

// Clear markers
function clearMadisMarkers(map) {
    if (window.madisMarkersLayer) {
        window.madisMarkersLayer.clearLayers();
    } else if (map) {
        window.madisMarkersLayer = L.layerGroup().addTo(map);
    }
}

// Plot MADIS data
function plotMadisData(map) {
    if (!map) {
        console.error("Leaflet map is not initialized.");
        return;
    }

    clearMadisMarkers(map);

    // Get our latitude and longitude bounds
    const lowerLat = parseFloat(document.getElementById('madis-lowerlat').value) || -90.0;
    const lowerLon = parseFloat(document.getElementById('madis-lowerlon').value) || -180.0;
    const upperLat = parseFloat(document.getElementById('madis-upperlat').value) || 90.0;
    const upperLon = parseFloat(document.getElementById('madis-upperlon').value) || 180.0;

    // Get lower and upper value bounds
    const lowerValueInput = document.getElementById('madis-lowervalue')?.value;
    const upperValueInput = document.getElementById('madis-uppervalue')?.value;
    const lowerValue = !lowerValueInput || isNaN(parseFloat(lowerValueInput)) ? -Infinity : parseFloat(lowerValueInput);
    const upperValue = !upperValueInput || isNaN(parseFloat(upperValueInput)) ? Infinity : parseFloat(upperValueInput);

    const unit = 'mm';
    const { vmin, vmax } = getColorbarBoundsFromInputs();

    for (const item of window.madisData) {
        const { stationId, obvTime, provider, value, lat, lon } = item;

        if (
            !isNaN(lat) && !isNaN(lon) &&
            lat > lowerLat && lat < upperLat &&
            lon > lowerLon && lon < upperLon &&
            value >= lowerValue && value <= upperValue
        ) {

            if (!isFinite(value) || isNaN(value)) displayValue = 0;

            L.circleMarker([lat, lon], {
                radius: 6,
                color: jetColor(value, vmin, vmax),
                fillColor: jetColor(value, vmin, vmax),
                fillOpacity: 0.7
            })
                .addTo(window.madisMarkersLayer)
                .bindPopup(
                    `<strong>${stationId}</strong><br/>Obs Time: ${obvTime}<br/>Provider: ${provider}<br/>` +
                    `<strong>Precip: </strong> ${value.toFixed(2)} ${unit}`
                );
        }
    }

    addJetColormapLegend({
        vmin,
        vmax,
        title: 'Precip',
        units: 'mm'
    });
}

// Get the colorbar bounds based on user input. 
export function getColorbarBoundsFromInputs() {
    const lowerInput = document.getElementById('colorbar-lowervalue');
    const upperInput = document.getElementById('colorbar-uppervalue');
    const vmin = lowerInput && !isNaN(parseFloat(lowerInput.value)) ? parseFloat(lowerInput.value) : 0;
    const vmax = upperInput && !isNaN(parseFloat(upperInput.value)) ? parseFloat(upperInput.value) : 50;
    return { vmin, vmax };
}

// Listen for changes in fields and update the map automatically
export function setupMadisInputListeners(map) {
    const inputIds = [
        'madis-lowerlat',
        'madis-upperlat',
        'madis-lowerlon',
        'madis-upperlon',
        'madis-lowervalue',
        'madis-uppervalue',
        'colorbar-lowervalue',
        'colorbar-uppervalue'
    ];
    inputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                plotMadisData(map);
            });
        }
    });
}