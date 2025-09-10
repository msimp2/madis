// Get colormap bounds
export function getColormapBounds()
{
    if (window.madisVariable === 'T')
    {
        const lowerInput = document.getElementById('colormap-lower-temp');
        const upperInput = document.getElementById('colormap-upper-temp');
        const lower = parseFloat(lowerInput?.value);
        const upper = parseFloat(upperInput?.value);
        return {
            vmin: !isNaN(lower) ? lower : 0,
            vmax: !isNaN(upper) ? upper : 120,
        };
    }
    else if (window.madisVariable === "RH")
    {
        const lowerInput = document.getElementById('colormap-lower-rh');
        const upperInput = document.getElementById('colormap-upper-rh');
        const lower = parseFloat(lowerInput?.value);
        const upper = parseFloat(upperInput?.value);
        return {
            vmin: !isNaN(lower) ? lower : 0,
            vmax: !isNaN(upper) ? upper : 100,
        };
    }

    else
    {
        const lowerInput = document.getElementById('colormap-lowerprecip');
        const upperInput = document.getElementById('colormap-upperprecip');
        const lower = parseFloat(lowerInput?.value);
        const upper = parseFloat(upperInput?.value);
        return {
            vmin: !isNaN(lower) ? convertToMM(lower, unit) : 0,
            vmax: !isNaN(upper) ? convertToMM(upper, unit) : 50,
        };
    }
}