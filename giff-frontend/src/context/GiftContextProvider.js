import axios from 'axios';
import PropTypes from 'prop-types';
import React, { createContext, useState, useEffect } from 'react';
import _debounce from 'lodash/debounce';
import { showNotification } from '../component/notification/Notification';
import useMobileQuery from '../queries/useMobileQuery';
import { FetchUserInfo, FetchUserLogo } from '../endpoints/UserEndpoints';

export const GiftContext = createContext();

const GiftContextProvider = ({ children }) => {
  const [inputValues, setInputValues] = useState({
    html_content: '',
    global_substitutions: '',
    plain_text_content: '',
    emailAddresses: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [singleGif, setSingleGif] = useState(null);
  const [user, setUser] = useState(null); // State to store user info and user logo
  const [selectedDesignGif, setSelectedDesignGif] = useState({});
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const { isMobile } = useMobileQuery();
  const access_token = localStorage.getItem('access_token');

  useEffect(() => {
    // Fetch user info and user logo
    const fetchUser = async () => {
      try {
        const userData = sessionStorage.getItem('user');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
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
            setUser(userObj);
            
            sessionStorage.setItem('user', JSON.stringify(userObj));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [access_token]);

  const updateUserData = (updatedFields) => {
    setUser((prevUser) => {
      const updatedUserInfo = {
        ...prevUser.userInfo,
        ...updatedFields,
      };
  
      console.log('Updated Fields:', updatedFields);
      console.log('Updated User Info:', updatedUserInfo);
  
      const updatedUser = {
        ...prevUser,
        userInfo: updatedUserInfo,
      };
  
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const debouncedUpdateUserData = _debounce(updateUserData, 300);

  // design actions

  const editGif = (gifUrl, resourceId, selectedColor) => {
    console.log('Sharing GIF:', gifUrl);
    console.log('Resource ID:', resourceId);
    setIsDesignOpen(true);
    setSelectedDesignGif({'url': gifUrl, 'resourceId': resourceId, 'selectedColor': selectedColor});
  };

  const onChange = (fieldIdentifier, value) => {
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [fieldIdentifier]: value,
    }));
  };

  const sendGif = async () => {
    try {
      setIsLoading(true);
  
      const endpoint = 'send_gif';
      const emailData = inputValues;
  
      const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, emailData);
      console.log('response.data', response.data.error);
  
      if (response.data.error) {
        console.error('Error generating GIF:', response.data.error);
        setError(response.data.error);
      } else if (response.data.message === 'Email sent successfully') {
        showNotification('success', response.data.message);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating GIF:', error);
      setIsLoading(false);
    }
  };

  const handleOpenDesign = () => {
    setIsDesignOpen(true);
  };

  const handleCloseDesign = () => {
    setIsDesignOpen(false);
  };

  function handleDownloadClick() {
    const singleGif = localStorage.getItem('singleGif');
    console.log('singleGif', singleGif);
    if (singleGif) {
      const link = document.createElement('a');
      link.href = singleGif;
      link.target = '_blank';
      link.download = 'generated_gif.gif';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  console.log('isDesignOpen', isDesignOpen);

  return (
    <GiftContext.Provider
      value={{
        inputValues,
        onChange,
        isLoading,
        setIsLoading,
        sendGif,
        error,
        setSingleGif,
        singleGif,
        handleDownloadClick,
        user,
        setUser: debouncedUpdateUserData,
        isDesignOpen,
        editGif,
        selectedDesignGif,
        isMobile,
        handleOpenDesign,
        handleCloseDesign
      }}
    >
      {children}
    </GiftContext.Provider>
  );
};

GiftContextProvider.propTypes = {
  children: PropTypes.instanceOf(Object),
};

export default GiftContextProvider;
