import React from 'react';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { NotificationContainer } from 'react-notifications';
import './App.css'
import GifLanding from './component/GifLanding';
import GiftContextProvider from './context/GiftContextProvider';
import WhatIsGift from './component/WhatIsGift';
import SendEmailComponent from './component/SendEmailComponent';
import GiftForSale from './component/GiftForSale';
import GiftForMarketing from './component/GiftForMarketing';
import GiftSpiration from './component/GiftSpiration';
import RightsAndPrivacy from './component/RightsAndPrivacy';
import OpenAiGenerator from './openai/OpenAiGenerator';
import Landing from './component/Landing';

function App() {
  return (
    <GiftContextProvider>
      <NotificationContainer />
      <BrowserRouter>
        <Routes>
        <Route
            path={process.env.REACT_APP_BASEURL}
            element={<Landing />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/single-gif-creation`}
            element={<GifLanding />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/multiple-gif-creation`}
            element={<GifLanding />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/what-is-gift`}
            element={<WhatIsGift />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/gift-for-sales`}
            element={<GiftForSale />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/gift-for-marketing`}
            element={<GiftForMarketing />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/send-email`}
            element={<SendEmailComponent />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/gift-spiration`}
            element={<GiftSpiration />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/rights-and-privacy`}
            element={<RightsAndPrivacy />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/mrs-gift`}
            element={<OpenAiGenerator />}
          />
        </Routes>
      </BrowserRouter>
    </GiftContextProvider>
  )
}

export default App;
