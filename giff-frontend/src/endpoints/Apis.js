import axios from "axios";

export async function GenerateSingleGif(url) {
    console.log('url', url);
    try {
      const response = await axios.post(`http://127.0.0.1:5000/generate-single-gif`, { url });
      console.log('Response from server', response);
      return response;
    } catch (error) {
      console.error('Error generating GIF:', error);
      throw error; // Rethrow the error for better error handling in the calling function
    }
  }

export async function GeneratePdfGifs(url) {
    const response = await axios.post(`http://127.0.0.1:5000/generate-pdf-gif`, { url });
    return response;
}

export async function GenerateMultipleGifs(gifData) {
  console.log('gifData', gifData);
    const response = await axios.post(`http://127.0.0.1:5000/generate-gifs-from-list`, {gifData});
    return response;
}

export async function GenerateMultiplePdfGifs(gifData) {
    const response = await axios.post(`http://127.0.0.1:5000/generate-pdf-gifs-from-list`, {gifData});
    return response;
}

export async function DownloadFolder() {
  const resp = await axios.get(`http://127.0.0.1:5000/download-all-gifs`);
  return resp;
}