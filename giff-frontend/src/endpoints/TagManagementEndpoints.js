import axios from "axios";

let Api;

// Check if the app is running locally
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  Api = 'http://127.0.0.1:5000'; // local
} else {
  Api = 'https://gift-server-eu-1.azurewebsites.net'; // azure
}

export async function AssignTagToGif(tagDetails) {
  console.log('tagDetails', tagDetails);
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await axios.post(`${Api}/assign-tag-to-gif`, 
      tagDetails,
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

export async function AddUserTag(tagDetails) {
  console.log('tagDetails', tagDetails);
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await axios.post(`${Api}/add_tag_user_level`, 
      tagDetails,
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

export async function FetchUserTags() {
  const token = localStorage.getItem('access_token');
  try {
    const response = await axios.get(`${Api}/fetch_tags`, 
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