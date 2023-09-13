export async function GenerateSingleGif(url) {
    const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, { url });
    return response.json;
}

export async function GeneratePdfGifs(url) {
    const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, { url });
    return response.json;
}

export async function GenerateMultipleGifs(urls) {
    const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, { urls });
    return response.json;
}

export async function GenerateMultiplePdfGifs(urls) {
    const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, { urls });
    return response.json;
}