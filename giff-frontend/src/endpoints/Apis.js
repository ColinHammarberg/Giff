import axios from "axios";

export async function GenerateSingleGif(url) {
  console.log('url', url);
  const token = localStorage.getItem('access_token'); // Retrieve the token from local storage
  
  try {
    const response = await axios.post(`http://127.0.0.1:5000/generate-single-gif`, 
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
    const response = await axios.post(`http://127.0.0.1:5000/generate-pdf-gif`, 
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
        `http://127.0.0.1:5000/generate-gif-from-list`, 
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
    const response = await axios.post(`http://127.0.0.1:5000/generate-pdf-gifs-from-list`, {gifData});
    return response;
}

export async function DownloadFolder() {
  const response = await axios.get(`http://127.0.0.1:5000/download-all-gifs`, {
    responseType: 'blob'
  });
  return response;
}

export async function Signin(userCredentials) {
  const response = await axios.post(`http://127.0.0.1:5000/signin`, { email: userCredentials.email, password: userCredentials.password });
  return response;
}

export async function Signup(newUserCredentials) {
  try {
    const response = await axios.post(`http://127.0.0.1:5000/signup`, newUserCredentials);
    return response;
  } catch (error) {
    return { status: error.response?.status, data: error.response?.data };
  }
}

export async function UpdatePassword(passwordCredentials) {
  const access_token = localStorage.getItem('access_token');
  try {
    const response = await axios.post(`http://127.0.0.1:5000/update_user_password`, passwordCredentials, 
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
  const response = await axios.get(`http://127.0.0.1:5000/signout`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  return response;
}

export async function FetchUserInfo() {
  const access_token = localStorage.getItem('access_token');
  const response = await axios.get(`http://127.0.0.1:5000/fetch_user_info`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  return response;
}

export async function FetchUserGifs(access_token) {
  const response = await axios.get(`http://127.0.0.1:5000/fetch_user_gifs`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  return response;
}

export async function DeleteUserProfile(access_token) {
  const response = await axios.get(`http://127.0.0.1:5000/delete_user`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });
  return response;
}