import axios from 'axios';

export const trackGifClick = async (gifId) => {
  try {
    const response = await axios.post(
      'https://gift-server-eu-1.azurewebsites.net/track-gif-click',
      { gif_id: gifId }
    );
    console.log('response.data', response.data);
    if (response.data.verified) {
      window.location.href = response.data.verified;
    }
    return response.data;
  } catch (error) {
    console.error('Error in trackGifClick:', error);
    throw error;
  }
};
