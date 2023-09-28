import axios from 'axios';
import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';
import { showNotification } from '../component/Notification';

export const GiftContext = createContext();

const GiftContextProvider = ({ children }) => {
  // Define a single state object to hold all the input values
  const [inputValues, setInputValues] = useState({
    html_content: '',
    global_substitutions: '',
    plain_text_content: '',
    emailAddresses: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [singleGif, setSingleGif] = useState(null);

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
        return (
          showNotification('success', response.data.message)
        )
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
      // Create a virtual anchor element and trigger the download
      const link = document.createElement('a');
      link.href = singleGif; // Use the actual URL here
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
        handleDownloadClick
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
