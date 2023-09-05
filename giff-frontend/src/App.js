import React from 'react';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import './App.css'
import GifLanding from './component/GifLanding';
import GiftContextProvider from './context/GiftContextProvider';
import WhatIsGift from './component/WhatIsGift';
import SendEmailComponent from './component/SendEmailComponent';

function App() {
  return (
    <GiftContextProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path={process.env.REACT_APP_BASEURL}
            element={<GifLanding />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/what-is-gift`}
            element={<WhatIsGift />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/send-email`}
            element={<SendEmailComponent />}
          />
        </Routes>
      </BrowserRouter>
    </GiftContextProvider>
  )
}

export default App;
