import axios from 'axios';
import { useQuery } from 'react-query';

const fetchGifCount = async () => {
  try {
    const response = await axios.get('https://gift-server-eu-1.azurewebsites.net/count_currently_created_gifs');
    return response.data.gif_count;
  } catch (error) {
    console.error('Error fetching GIF count:', error);
    throw error;
  }
};

export const useFetchGifCount = () => {
  const getGifCount = useQuery(
    'gifCount',
    fetchGifCount,
    {
      retry: 1,
      retryDelay: 3000,
    }
  );

  return {
    gifCount: getGifCount?.data,
    isLoading: getGifCount.isLoading,
    isError: getGifCount.isError,
  };
};
