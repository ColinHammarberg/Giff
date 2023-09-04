import React from 'react';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import './App.css'
import GifLanding from './component/GifLanding';
import GiftContextProvider from './context/GiftContextProvider';
import WhatIsGift from './component/WhatIsGift';

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
        </Routes>
      </BrowserRouter>
    </GiftContextProvider>
  )
}

export default App;
