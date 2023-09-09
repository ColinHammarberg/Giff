import axios from 'axios';
import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

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

  // Define a shared onChange function that updates the state
  const onChange = (fieldIdentifier, value) => {
    // Use the spread operator to update the specific field
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [fieldIdentifier]: value,
    }));
  };

  const sendGif = async () => {
    console.log('GIF');
    try {
      setIsLoading(true);
  
      const endpoint = 'send_gif';
      const emailData = inputValues;
  
      const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, emailData);
  
      if (response.data.error) {
        console.error('Error generating GIF:', response.data.error);
        setError(response.data.error);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating GIF:', error);
      setIsLoading(false);
    }
  };

  console.log('inputValues', inputValues);

  return (
    <GiftContext.Provider
      value={{
        inputValues,
        onChange,
        isLoading,
        sendGif,
        error
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
