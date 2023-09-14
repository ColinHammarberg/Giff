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
import ChooseOptionCreate from './component/ChooseOptionCreate';
import MultipleGifGenerator from './component/MultipleGifCreation';
import EmailChoice from './component/EmailChoice';

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
            path={`${process.env.REACT_APP_BASEURL}/choose-option-create`}
            element={<ChooseOptionCreate />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/multiple-gif-creation`}
            element={<MultipleGifGenerator />}
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
            path={`${process.env.REACT_APP_BASEURL}/email-choice`}
            element={<EmailChoice />}
          />
          <Route
            path={`${process.env.REACT_APP_BASEURL}/send-gift-email`}
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
