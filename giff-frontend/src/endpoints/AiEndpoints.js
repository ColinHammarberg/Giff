import axios from 'axios';

let Api;

// Check if the app is running locally
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) {
  Api = 'http://127.0.0.1:5000'; // local
} else {
  Api = 'https://gift-server-eu-1.azurewebsites.net'; // azure
}

export async function GenerateGifEmail(gifUrl) {
  const access_token = localStorage.getItem('access_token');
  const response = await axios.post(
    `${Api}/get_example_email_from_gif`,
    { gifUrl },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return response;
}
