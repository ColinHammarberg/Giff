import axios from "axios";

let Api;

// Check if the app is running locally
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  Api = 'http://127.0.0.1:5000'; // local
} else {
  Api = 'https://gift-server-eu-1.azurewebsites.net'; // azure
}

export async function GenerateSingleGif(url) {
  console.log('url', url);
  const token = localStorage.getItem('access_token'); // Retrieve the token from local storage
  
  try {
    const response = await axios.post(`${Api}/generate-single-gif`, 
      { url },
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


export async function GeneratePdfGifs(url, access_token) {
    console.log('access_token', access_token);
    const response = await axios.post(`${Api}/generate-pdf-gif`, 
    { url },
    {
      headers: {
        // Keep the Authorization header if you need it for other routes
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response;
}

export async function GenerateMultipleGifs(gifData) {
  console.log('gifData1', gifData);
  const access_token = localStorage.getItem('access_token');
    try {
      const response = await axios.post(
        `${Api}/generate-gif-from-list`, 
        { gifData, access_token },
        {
          headers: {
            // Keep the Authorization header if you need it for other routes
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
    console.log('gifData2', gifData);
    const response = await axios.post(`${Api}/generate-pdf-gifs-from-list`, {gifData});
    return response;
}

export async function DownloadFolder() {
  const response = await axios.get(`${Api}/download-all-gifs`, {
    responseType: 'blob'
  });
  return response;
}

export async function Signin(userCredentials) {
  const response = await axios.post(`${Api}/signin`, { email: userCredentials.email, password: userCredentials.password });
  return response;
}

export async function Signup(newUserCredentials) {
  try {
    const response = await axios.post(`${Api}/signup`, newUserCredentials);
    return response;
  } catch (error) {
    return { status: error.response?.status, data: error.response?.data };
  }
}

export async function UpdatePassword(passwordCredentials) {
  const access_token = localStorage.getItem('access_token');
  try {
    const response = await axios.post(`${Api}/update_user_password`, passwordCredentials, 
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

export async function Signout() {
  const access_token = localStorage.getItem('access_token');
  const response = await axios.get(`${Api}/signout`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  return response;
}

export async function FetchUserInfo() {
  const access_token = localStorage.getItem('access_token');
  const response = await axios.get(`${Api}/fetch_user_info`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  return response;
}

export async function FetchUserGifs(access_token) {
  const response = await axios.get(`${Api}/fetch_user_gifs`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  return response.data;
}

export async function KeepAccessAlive() {
  const access_token = localStorage.getItem('access_token');
  const response = await axios.get(`${Api}/keep_access_alive`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  return response;
}

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

export async function ApplyGifDesign(selectedGif, selectedColor) {
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

export async function DeleteUserProfile(access_token) {
  const response = await axios.get(`${Api}/delete_user`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  return response;
}