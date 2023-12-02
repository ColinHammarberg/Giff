import { useQuery } from 'react-query';
import { FetchUserInfo, FetchUserLogo } from '../endpoints/UserEndpoints';

const fetchUser = async (access_token) => {
  try {
    const userData = sessionStorage.getItem('user');
    console.log('userData', userData);
    if (userData) {
      return JSON.parse(userData);
    } else if (access_token) {
      const userInfoResponse = await FetchUserInfo();
      let logoUrl = null;
      console.log('userInfoResponse', userInfoResponse);
      
      if (userInfoResponse.data) {
        if (userInfoResponse.data.has_logo) {
          const userLogoResponse = await FetchUserLogo();
          logoUrl = userLogoResponse?.data?.logo_url || null;
        }
        const userObj = {
          userInfo: userInfoResponse.data,
          userLogoSrc: logoUrl,
        };
        
        sessionStorage.setItem('user', JSON.stringify(userObj));
        return userObj;
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

const useFetchUser = () => {
  const access_token = localStorage.getItem('access_token');

  const getUserData = useQuery(
    ['userData', access_token],
    () => fetchUser(access_token),
    {
      retry: 1,
      retryDelay: 3000,
    }
  );

  console.log('getUserData', getUserData?.data?.userInfo);

  return {
    user: getUserData?.data?.userInfo,
    isLoading: getUserData.isLoading,
    isError: getUserData.isError,
  };
};

export default useFetchUser;
