import React, { useState } from 'react';
import { Box, Button, InputLabel, TextField } from '@mui/material';
import './Authorization.scss';
import PasswordField from './PasswordField';
import { useLocation, useNavigate } from 'react-router-dom';
import { showNotification } from '../notification/Notification';
import Header from '../overall/Header';
import OfficialButton from '../buttons/OfficialButton';
import { GoogleSignIn, Signin } from '../../endpoints/UserEndpoints';
import OutlookSignInButton from './OutlookSignin';

function UserSignin() {
  const [error, setError] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [returnUrl, setReturnUrl] = useState('/choose-option-create'); // Default return URL

  React.useEffect(() => {
    // Extract returnUrl from the query string
    const searchParams = new URLSearchParams(location.search);
    const url = searchParams.get('returnUrl');
    if (url) {
      setReturnUrl(url);
    }
  }, [location]);

  const GOOGLE_CLIENT_ID = '780954759358-8kkg6m7kdtg9dn26449mfnpsvnpqtnv4.apps.googleusercontent.com';

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    try {
      const googleResponse = await GoogleSignIn({ token: response.credential });
      if (googleResponse.status === 200) {
        localStorage.setItem('access_token', googleResponse.data.access_token);
        navigate(returnUrl);
        showNotification('success', 'Successfully signed in with Google');
      } else {
        showNotification('error', googleResponse.data.message || 'Google Sign-In failed');
      }
    } catch (error) {
      showNotification('error', 'Google Sign-In failed');
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    window?.google?.accounts?.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse
    });
    window?.google?.accounts?.id.renderButton(
      document.getElementById('google-sign-in-button'),
      { theme: 'outline', size: 'large' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleOnChangeEmail(event) {
    setEmail(event.target.value);
  }

  function handleOnChangePassword(event) {
    setPassword(event.target.value);
  }

  const ResetPasswordButton = () => (
    <Button
      color="primary" 
      onClick={() => navigate('/reset-password')} 
      style={{ padding: 0, minWidth: 'auto' }}
    >
      here.
    </Button>
  );

  const signInUserCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await Signin({ email: email, password: password });
      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access_token);
        setTimeout(() => {
          setIsLoading(false);
          navigate(returnUrl);
          showNotification('success', 'Aaaaand you’re signed in!');
        }, 3000)
      } else {
        setError('error', response.data.message);
        setIsLoading(false);
      }
    } catch (error) {
      setError('error', "Signin failed");
      setIsLoading(false);
    }
  };
  

  const handleKeyPressGenerateGif = (event) => {
    if (event.key === 'Enter') {
      signInUserCredentials();
    }
  };

  return (
    <div className="authorization">
      <Header />
      <Box className="user-authentication">
        <Box className="user-title">Sign in to Gif-T</Box>
        <div className="username">
          <InputLabel>
            Email
          </InputLabel>
          <TextField 
            value={email}
            name="email-field"
            onChange={handleOnChangeEmail}
            onKeyPress={(event) => {
              handleKeyPressGenerateGif(event);
            }} />
        </div>
        <div className="password">
          <InputLabel>
            Password
          </InputLabel>
          <PasswordField 
            value={password}
            name="password-field" 
            onKeyPress={(event) => {
              handleKeyPressGenerateGif(event);
            }}
            onChange={handleOnChangePassword} 
            error={error} 
            helperText={
              error ? (
                <span>
                  Sorry, champ. Your password or email is wrong. Please give it another try or reset your password <ResetPasswordButton />
                </span>
              ) : ''
            }
          />
        </div>
        <div className="buttons">
          <OfficialButton onClick={signInUserCredentials} label="Sign in" variant="pink" isProcessing={isLoading} />
          <div id="google-sign-in-button" className="google-sign-in"></div>
          <OutlookSignInButton />
          <div className="no-account">Don’t have a Gif-t account yet? No worries. You can sign up <span onClick={() => navigate('/signup')}>here.</span></div>
        </div>
      </Box>
    </div>
  )
}

export default UserSignin;
