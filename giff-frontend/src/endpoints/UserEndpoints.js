import axios from "axios";

let Api;

// Check if the app is running locally
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  Api = 'http://127.0.0.1:5000'; // local
} else {
  Api = 'https://gift-server-eu-1.azurewebsites.net'; // azure
}

export async function VerifyUser(token) {
    try {
      const response = await axios.get(`${Api}/verify_user?token=${encodeURIComponent(token)}`);
      console.log('response', response);
      return { data: response.data, status: response.status };
    } catch (error) {
      if (error.response) {
        return { 
          data: error.response.data, 
          status: error.response.status 
        };
      } else {
        return {
          data: 'An error occurred during verification.',
          status: 0
        };
      }
    }
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
  
  export async function DeleteUserLogo() {
    const access_token = localStorage.getItem('access_token');
    const response = await axios.get(`${Api}/delete_user_logo`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    return response;
  }

  export async function DeleteUserProfile() {
    const access_token = localStorage.getItem('access_token');
    const response = await axios.post(`${Api}/delete-user-profile`, {}, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response;
  }

  export async function UploadUserLogo(logo) {
    const access_token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('logo', logo); // Assuming 'logo' is a File object
    console.log('formData', formData);
  
    try {
      const response = await axios.post(`${Api}/upload_user_logo`, formData, {
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

export async function SaveUserResolution(resolution) {
    console.log('resolution', resolution);
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.post(`${Api}/save-user-resolution`, 
      { resolution },
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

  export async function Signin(userCredentials) {
    const response = await axios.post(`${Api}/signin`, { email: userCredentials.email, password: userCredentials.password });
    return response;
  }

  export async function ResetUserPassword(password, code) {
    const response = await axios.post(`${Api}/new_user_password`, { password, code });
    return response;
}

  export async function UpdateEmailAddress(credentials) {
    const access_token = localStorage.getItem('access_token');
    try {
      const response = await axios.post(`${Api}/update-email`, credentials, 
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
  
  export async function KeepAccessAlive() {
    const access_token = localStorage.getItem('access_token');
    const response = await axios.get(`${Api}/keep_access_alive`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response;
  }

  export async function FetchUserLogo() {
    const access_token = localStorage.getItem('access_token');
    const response = await axios.get(`${Api}/fetch_user_logo`,
    {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    }
    )
    return response;
  }

  export async function FetchUserGifs() {
    const access_token = localStorage.getItem('access_token');
    const response = await axios.get(`${Api}/fetch_user_gifs`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response.data;
  }

  export async function ResetPasswordRequest(email) {
    const response = await axios.post(`${Api}/reset_password`, { email });
    return response;
  }

  export async function ResendVerificationEmail() {
    const access_token = localStorage.getItem('access_token');
    const response = await axios.get(`${Api}/send_verification_email`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    return response.data;
  }