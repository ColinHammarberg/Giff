import { useQuery } from 'react-query';
import { FetchUserLogo } from '../endpoints/UserEndpoints';

const fetchUserLogo = async (access_token) => {
  try {
    if (access_token) {      
        const userLogoResponse = await FetchUserLogo();
        const userLogoSrc = userLogoResponse?.data?.logo_url || null;
        console.log('logoUrl', userLogoResponse);
        sessionStorage.setItem('userLogoItem', JSON.stringify(userLogoSrc));
        return userLogoSrc;
    }
  } catch (error) {
    console.error('Error fetching user logo:', error);
    throw error;
  }
};

const useFetchUserLogo = () => {
  const access_token = localStorage.getItem('access_token');
  const getUserLogo = useQuery(
    ['userLogoSrc', access_token],
    () => fetchUserLogo(access_token),
    {
      retry: 1,
      retryDelay: 3000,
    }
  );

  console.log('getUserLogo', getUserLogo);

  return {
    userLogoSrc: getUserLogo?.data?.userLogoSrc,
    isLoading: getUserLogo.isLoading,
    isError: getUserLogo.isError,
  };
};

export default useFetchUserLogo;
