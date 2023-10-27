import axios from 'axios';
import PropTypes from 'prop-types';
import React, { createContext, useState, useEffect } from 'react';
import { showNotification } from '../component/Notification';
import { FetchUserInfo, FetchUserLogo } from '../endpoints/Apis';

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

  useEffect(() => {
    // Fetch user info and user logo
    const fetchUser = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
        } else {
          const userInfoResponse = await FetchUserInfo(); // Replace with your user info endpoint
          const userLogoResponse = await FetchUserLogo(); // Replace with your user logo endpoint
          
          if (userInfoResponse.data) {
            const userObj = {
              userInfo: userInfoResponse.data,
              userLogoSrc: userLogoResponse?.data?.logo_url || null,
            };
            setUser(userObj);
            
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []); // Run this effect only once on component mount

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
        setUser
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
