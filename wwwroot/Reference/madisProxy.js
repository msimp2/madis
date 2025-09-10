export async function fetchMadisData(url)
{
    if (!url || url.trim() === "")
    {
        throw new Error("Missing url parameter.");
    }

    const response = await fetch(url);
    if (!response.ok)
    {
        throw new Error(`Failed to fetch MADIS data.Status: ${ response.status}`);
    }

    const content = await response.text(); // Assuming CSV response
return content;
}