import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const GiftContext = createContext();

const GiftContextProvider = ({ children }) => {
  // Define a single state object to hold all the input values
  const [inputValues, setInputValues] = useState({
    name: '',
    company: '',
    emailText: '',
    emailAddresses: '',
  });

  // Define a shared onChange function that updates the state
  const onChange = (fieldIdentifier, value) => {
    // Use the spread operator to update the specific field
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [fieldIdentifier]: value,
    }));
  };

  return (
    <GiftContext.Provider
      value={{
        inputValues,
        onChange,
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
