import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter, useNavigate } from "react-router-dom";
import { NotificationContainer } from 'react-notifications';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css'
import GifLanding from './component/GifLanding';
import GiftContextProvider from './context/GiftContextProvider';
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
import Articles from './component/Articles';
import GifLibrary from './component/GifLibrary';
import KeepAliveComponent from './component/KeepAlive';
import giftUser from './access/GiftUser';

function Navigator() {
  const navigate = useNavigate();
  const isLoggedIn = giftUser.isLoggedIn();
  const initialRedirectDone = localStorage.getItem('initialRedirectDone');

  useEffect(() => {
    let isMounted = true;
    const redirectTimeout = setTimeout(() => {
      if (isLoggedIn && !initialRedirectDone && isMounted) {
        navigate('/gift');
      }
    }, 500); // Adjust the delay as needed (in milliseconds)

    return () => {
      isMounted = false;
      clearTimeout(redirectTimeout); // Cleanup timeout on component unmount

      if (!initialRedirectDone) {
        localStorage.setItem('initialRedirectDone', true);
      }
    };
  }, [isLoggedIn, navigate, initialRedirectDone]);

  return null;
}

function App() {
  const queryClient = new QueryClient();
  const REACT_APP_BASEURL = process.env.REACT_APP_BASEURL || '/';

  return (
    <GiftContextProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationContainer />
        <BrowserRouter>
          <KeepAliveComponent />
          <Navigator />
          <Routes>
            <Route
              path={`${REACT_APP_BASEURL}/signup`}
              element={<UserSignup />}
            />
            <Route
              path={'/'}
              element={<UserSignin />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/profile`}
              element={<Profile />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/gif-library`}
              element={<GifLibrary />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/gift`}
              element={<Landing />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/single-gif-creation`}
              element={<GifLanding />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/choose-option-create`}
              element={<ChooseOptionCreate />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/send-via-own-email`}
              element={<SendViaOwnEmail />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/multiple-gif-creation`}
              element={<MultipleGifLanding />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/articles`}
              element={<Articles />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/email-choice`}
              element={<EmailChoice />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/send-gift-email`}
              element={<SendEmailComponent />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/rights-and-privacy`}
              element={<RightsAndPrivacy />}
            />
            <Route
              path={`${REACT_APP_BASEURL}/mrs-gift`}
              element={<OpenAiGenerator />}
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </GiftContextProvider>
  )
}

export default App;
