import { useQuery } from 'react-query';
import { FetchUserInfo } from '../endpoints/UserEndpoints';

const fetchUser = async (access_token) => {
  try {
    if (access_token) {
      const userInfoResponse = await FetchUserInfo();
      if (userInfoResponse.data) {
        const userObj = {
          userInfo: userInfoResponse.data,
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

const useFetchUser = (changeUserDetails) => {
  const access_token = localStorage.getItem('access_token');
  const sessionUser = sessionStorage.getItem('user')
    ? JSON.parse(sessionStorage.getItem('user'))
    : null;

  const getUserData = useQuery(
    ['userData', access_token, changeUserDetails],
    () => fetchUser(access_token),
    {
      retry: 1,
      retryDelay: 3000,
      enabled: Boolean(!sessionUser || changeUserDetails),
      initialData: sessionUser ? sessionUser : undefined,
    }
  );

  return {
    user: getUserData?.data?.userInfo,
    isLoading: getUserData.isLoading,
    isError: getUserData.isError,
  };
};

export default useFetchUser;
