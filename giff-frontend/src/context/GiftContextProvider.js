import PropTypes from 'prop-types';
import React, { createContext, useState } from 'react';

export const GiftContext = createContext();

const GiftContextProvider = ({ children }) => {
  const [gifData, setGifData] = useState(null);
  return (
    <GiftContext.Provider
      value={{
        gifData,
        setGifData
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