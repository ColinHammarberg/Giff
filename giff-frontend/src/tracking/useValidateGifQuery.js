import axios from 'axios';
import { useMutation } from 'react-query';

const trackGifClick = async (gifId) => {
  await axios.post('https://gift-server-eu-1.azurewebsites.net/track-gif-click', { gif_id: gifId });
};

export const useTrackGifClick = () => {
  return useMutation(trackGifClick);
};