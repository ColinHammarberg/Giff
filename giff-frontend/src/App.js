import React, { useEffect, useState } from 'react';
import { Route, Routes, BrowserRouter, useNavigate } from "react-router-dom";
import { NotificationContainer } from 'react-notifications';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css'
import GifLanding from './component/GifLanding';
import GiftContextProvider from './context/GiftContextProvider';
import WhatIsGift from './component/WhatIsGift';
import SendEmailComponent from './component/SendEmailComponent';
import RightsAndPrivacy from './component/RightsAndPrivacy';
import OpenAiGenerator from './openai/OpenAiGenerator';
import Landing from './component/Landing';
import ChooseOptionCreate from './component/ChooseOptionCreate';
import EmailChoice from './component/EmailChoice';
import MultipleGifLanding from './component/MultipleGifCreation';
import SendViaOwnEmail from './component/SendViaOwnEmail';
import UserSignin from './component/authorization/Signin';
import UserSignup from './component/authorization/Signup';
import Profile from './component/Profile';
import Articles from './component/GiftForSale';

function Navigator() {
  const navigate = useNavigate();
  const access_token = localStorage.getItem('access_token');
  const [initialRedirectDone, setInitialRedirectDone] = useState(false);

  // useEffect(() => {
  //   if (access_token && !initialRedirectDone) {
  //     navigate('/gift');
  //     setInitialRedirectDone(true);
  //   }
  // }, [access_token, navigate, initialRedirectDone]);

  return null;
}

function App() {
  const queryClient = new QueryClient();
  return (
    <GiftContextProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationContainer />
        <BrowserRouter>
          <Navigator />
          <Routes>
            <Route
              path={`${process.env.REACT_APP_BASEURL}/signup`}
              element={<UserSignup />}
            />
            <Route
              path={process.env.REACT_APP_BASEURL}
              element={<UserSignin />}
            />
            <Route
              path={`${process.env.REACT_APP_BASEURL}/profile`}
              element={<Profile />}
            />
            <Route
              path={`${process.env.REACT_APP_BASEURL}/gift`}
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
              path={`${process.env.REACT_APP_BASEURL}/send-via-own-email`}
              element={<SendViaOwnEmail />}
            />
            <Route
              path={`${process.env.REACT_APP_BASEURL}/multiple-gif-creation`}
              element={<MultipleGifLanding />}
            />
            <Route
              path={`${process.env.REACT_APP_BASEURL}/what-is-gift`}
              element={<WhatIsGift />}
            />
            <Route
              path={`${process.env.REACT_APP_BASEURL}/articles`}
              element={<Articles />}
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
              path={`${process.env.REACT_APP_BASEURL}/rights-and-privacy`}
              element={<RightsAndPrivacy />}
            />
            <Route
              path={`${process.env.REACT_APP_BASEURL}/mrs-gift`}
              element={<OpenAiGenerator />}
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </GiftContextProvider>
  )
}

export default App;
