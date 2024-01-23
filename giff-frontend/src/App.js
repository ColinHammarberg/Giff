import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter, useNavigate } from 'react-router-dom';
import { NotificationContainer } from 'react-notifications';
import { MsalProvider } from '@azure/msal-react';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css';
import GifLanding from './component/single-gif-feature/GifLanding';
import GiftContextProvider from './context/GiftContextProvider';
import SendEmailComponent from './component/email/SendEmailComponent';
import RightsAndPrivacy from './component/overall/RightsAndPrivacy';
import OpenAiGenerator from './openai/OpenAiGenerator';
import Landing from './component/overall/Landing';
import ChooseOptionCreate from './component/overall/ChooseOptionCreate';
import EmailChoice from './component/email/EmailChoice';
import MultipleGifLanding from './component/multiple-gif-feature/MultipleGifCreation';
import SendViaOwnEmail from './component/email/SendViaOwnEmail';
import UserSignin from './component/authorization/Signin';
import UserSignup from './component/authorization/Signup';
import Profile from './component/profile/Profile';
import Articles from './component/story/Articles';
import GifLibrary from './component/gif-library/GifLibrary';
import KeepAliveComponent from './component/authorization/KeepAlive';
import VerfifyAccount from './component/authorization/VerifyAccount';
import ResetPassword from './component/authorization/ResetPassword';
import NewPassword from './component/authorization/NewPassword';
import { msalInstance } from './component/authorization/OutlookSignup';
import GifCounter from './counter/GifCounter';

function Navigator() {
  const navigate = useNavigate();
  const access_token = localStorage.getItem('access_token');
  const initialRedirectDone = localStorage.getItem('initialRedirectDone');

  useEffect(() => {
    let isMounted = true;
    const redirectTimeout = setTimeout(() => {
      if (access_token && !initialRedirectDone && isMounted) {
        navigate('/choose-option-create');
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(redirectTimeout); // Cleanup timeout on component unmount

      if (!initialRedirectDone) {
        localStorage.setItem('initialRedirectDone', true);
      }
    };
  }, [access_token, navigate, initialRedirectDone]);

  return null;
}

function App() {
  const queryClient = new QueryClient();
  const REACT_APP_BASEURL = process.env.REACT_APP_BASEURL || '/';
  const access_token = localStorage.getItem('access_token');

  return (
    <GiftContextProvider>
      <MsalProvider instance={msalInstance}>
        <QueryClientProvider client={queryClient}>
          <NotificationContainer />
          <BrowserRouter>
            {access_token && <KeepAliveComponent />}
            <Navigator />
            <Routes>
              <Route path={'/'} element={<UserSignin />} />
              <Route
                path={`${REACT_APP_BASEURL}/signup`}
                element={<UserSignup />}
              />
              <Route
                path={`${REACT_APP_BASEURL}/reset-password`}
                element={<ResetPassword />}
              />
              <Route
                path={`${REACT_APP_BASEURL}/new-password`}
                element={<NewPassword />}
              />
              <Route
                path={`${REACT_APP_BASEURL}/profile`}
                element={<Profile />}
              />
              <Route
                path={`${REACT_APP_BASEURL}/verify`}
                element={<VerfifyAccount />}
              />
              <Route
                path={`${REACT_APP_BASEURL}/gif-library`}
                element={<GifLibrary />}
              />
              <Route path={`${REACT_APP_BASEURL}/gift`} element={<Landing />} />
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
                path={`${REACT_APP_BASEURL}/current-gif-counter`}
                element={<GifCounter />}
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
      </MsalProvider>
    </GiftContextProvider>
  );
}

export default App;
