import axios from "axios";

let Api;

// Check if the app is running locally
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  Api = 'http://127.0.0.1:5000'; // local
} else {
  Api = 'https://gift-server-eu-1.azurewebsites.net'; // azure
}

export async function GenerateSingleGif(url, sectorType) {
  console.log('url', url);
  const token = localStorage.getItem('access_token'); // Retrieve the token from local storage 
  
  try {
    const response = await axios.post(`${Api}/generate-single-gif`, 
      { url, sectorType },
      {
      headers: {
      'Authorization': `Bearer ${token}`
      }
     });
    console.log('Response from server', response);
    return response;
  } catch (error) {
    console.error('Error generating GIF:', error);
    throw error;
  }
}

export async function GeneratePdfGifs(url, sectorType) {
  const access_token = localStorage.getItem('access_token');
    const response = await axios.post(`${Api}/generate-pdf-gif`, 
    { url, sectorType },
    {
      headers: {
        // Keep the Authorization header if you need it for other routes
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response;
}

export async function UpdateGifName(resourceId, newName) {
  const access_token = localStorage.getItem('access_token');
    const response = await axios.post(`${Api}/update-gif-name`, 
    { resourceId, newName },
    {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response;
}

export async function UpdateGifDuration(resourceId, newDuration) {
  const access_token = localStorage.getItem('access_token');
    const response = await axios.post(`${Api}/update_gif_duration`, 
    { resourceId, newDuration },
    {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response;
}

export async function GenerateMultipleGifs(gifData) {
  const access_token = localStorage.getItem('access_token');
  console.log('access_tokentoken', access_token, gifData);
    try {
      const response = await axios.post(
        `${Api}/generate-gif-from-list`, 
        { gifData, access_token },
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );
    console.log('Response from server', response);
    return response;
  } catch (error) {
    console.error('Error generating GIF:', error);
    throw error;
  }
}

export async function GenerateMultiplePdfGifs(gifData) {
    const access_token = localStorage.getItem('access_token');
    console.log('access_token123', access_token, gifData);
    const response = await axios.post(`${Api}/generate-pdf-gifs-from-list`, 
    {gifData, access_token},
    {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    }
    );
    console.log('response', response);
    return response;
}

export async function UploadPdfThenCreateGif(pdf, sectorType) {
  const access_token = localStorage.getItem('access_token');
  const formData = new FormData();
  console.log('sectorType', sectorType);
  formData.append('pdf', pdf); // Assuming 'pdf' is a File object
  formData.append('sectorType', sectorType);

  try {
    const response = await axios.post(`${Api}/upload-pdf-generate-gif`, formData, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'multipart/form-data', // Set content type to multipart/form-data
      },
    });
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function DeleteGif(selectedGif) {
  const access_token = localStorage.getItem('access_token');
  console.log("DeleteGif selectedGif:", selectedGif);
  console.log("DeleteGif access_token:", access_token);
  
  try {
    const response = await axios.post(`${Api}/delete-gif`, selectedGif, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    return response;
  } catch (error) {
    console.log("DeleteGif error:", error);
    throw error;
  }
}

export async function updateEmailAPI(resourceId, exampleEmail) {
  const access_token = localStorage.getItem('access_token');
  console.log("resourceId", exampleEmail, resourceId);
  
  try {
    const response = await axios.post(`${Api}/update-gif-email`, { resourceId, exampleEmail }, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    return response;
  } catch (error) {
    console.log("Update email error:", error);
    throw error;
  }
}

export async function DownloadFolder() {
  const response = await axios.get(`${Api}/download-all-gifs`, {
    responseType: 'blob'
  });
  return response;
}

// export async function GenerateGifFromVideoSrc(url) {
//   console.log('url', url);
//   const token = localStorage.getItem('access_token'); // Retrieve the token from local storage
  
//   try {
//     const response = await axios.post(`${Api}//generate-video-gif`, 
//       { url },
//       {
//       headers: {
//       'Authorization': `Bearer ${token}`
//       }
//      });
//     console.log('Response from server', response);
//     return response;
//   } catch (error) {
//     console.error('Error generating GIF:', error);
//     throw error;
//   }
// }

export async function GetMultipleGifs(gifs) {
  const access_token = localStorage.getItem('access_token');
  console.log('access_token', access_token);
  const response = await axios.post(
    `${Api}/get_multiple_gifs`,
    {'gifs': gifs},
    {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    }
  );

  return response.data;
}

export async function ApplyGifColor(selectedGif, selectedColor) {
  const access_token = localStorage.getItem('access_token');
  console.log('access_token', access_token);
  const response = await axios.post(
    `${Api}/update_selected_color`,
    {
      selectedColor,
      resourceId: selectedGif.resourceId,
    },
    {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    }
  );

  return response;
}

export async function ApplyGifFrame(selectedGif, selectedFrame) {
  const access_token = localStorage.getItem('access_token');
  console.log('access_token', access_token);
  const response = await axios.post(
    `${Api}/update_selected_frame`,
    {
      selectedFrame,
      resourceId: selectedGif.resourceId,
    },
    {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    }
  );

  return response;
}


export async function DownloadAllLibraryGifs(gifData) {
  const access_token = localStorage.getItem('access_token');
  const response = await axios.post(`${Api}/download_library_gifs`,
  { gifData },
  {
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    responseType: 'arraybuffer'
  });
  return response;
}

export async function ToggleIncludeLogo() {
  const access_token = localStorage.getItem('access_token');
  try {
    const response = await axios.post(`${Api}/toggle_include_logo`, {},
    {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response;
  } catch (error) {
    return { status: error.response?.status, data: error.response?.data };
  }
}

export async function ToggleIncludeAI() {
  const access_token = localStorage.getItem('access_token');
  try {
    const response = await axios.post(`${Api}/toggle_include_ai`, {},
    {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response;
  } catch (error) {
    return { status: error.response?.status, data: error.response?.data };
  }
}

export async function ToggleEmailAI() {
  const access_token = localStorage.getItem('access_token');
  try {
    const response = await axios.post(`${Api}/toggle_email_ai`, {},
    {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response;
  } catch (error) {
    return { status: error.response?.status, data: error.response?.data };
  }
}

export async function DownloadIndividualDesignedGifs(gifData) {
  const access_token = localStorage.getItem('access_token');
  console.log('gifData', gifData);
  const response = await axios.post(`${Api}/download-individual-design-gifs`,
  gifData,
  {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    responseType: 'arraybuffer'
  });
  return response;
}