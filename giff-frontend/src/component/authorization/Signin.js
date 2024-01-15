import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, InputLabel, TextField } from '@mui/material';
import './Authorization.scss';
import PasswordField from './PasswordField';
import { useLocation, useNavigate } from 'react-router-dom';
import { showNotification } from '../notification/Notification';
import Header from '../overall/Header';
import { GoogleSignIn, Signin } from '../../endpoints/UserEndpoints';
import OutlookSignInButton from './OutlookSignin';
import GoogleSignInButton from './GoogleSignInButton';
import BackButton from '../profile/BackButton';
import useMobileQuery from '../../queries/useMobileQuery';

function UserSignin() {
  const [error, setError] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [returnUrl, setReturnUrl] = useState('/choose-option-create');
  const [isEmailEntered, setIsEmailEntered] = useState(false);
  const { isMobile } = useMobileQuery();

  const handleContinue = () => {
    if (email) {
      setIsEmailEntered(true);
    }
  };

  React.useEffect(() => {
    // Extract returnUrl from the query string
    const searchParams = new URLSearchParams(location.search);
    const url = searchParams.get('returnUrl');
    if (url) {
      setReturnUrl(url);
    }
  }, [location]);

  const GOOGLE_CLIENT_ID =
    '780954759358-cqnev3bau95uvbk80jltofofr4qc4m38.apps.googleusercontent.com';

  const handleGoogleResponse = useCallback(async (response) => {
    setIsLoading(true);
    const googleResponse = await GoogleSignIn({ token: response.credential });
    handleSignUpResponse(googleResponse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-sign-in-button'),
          { theme: 'outline', size: 'large' }
        );
      } else {
        setTimeout(loadGoogleSignIn, 300);
      }
    };

    loadGoogleSignIn();
  }, [handleGoogleResponse]);

  const handleSignUpResponse = (response) => {
    if (response.status === 'Signin successful') {
      localStorage.setItem('access_token', response.access_token);
      setIsLoading(false);
      navigate('/choose-option-create');
      showNotification('success', 'Successfully signed up');
    } else {
      setIsLoading(false);
      showNotification(
        'error',
        response.data.message || 'Signup failed for some reason'
      );
    }
  };

  function handleOnChangeEmail(event) {
    setEmail(event.target.value);
  }

  function handleOnChangePassword(event) {
    setPassword(event.target.value);
  }

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
        }, 3000);
      } else {
        setError('error', response.data.message);
        setIsLoading(false);
      }
    } catch (error) {
      setError('error', 'Signin failed');
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
      <Header nonAuthenticated />
      <Box className="user-authentication">
        <Box className="user-title">
          {isEmailEntered && (
            <BackButton
              onClick={() => setIsEmailEntered(false)}
              variant="yellow"
            />
          )}
          <div className="title">
            {isEmailEntered ? 'Type password' : 'Log in or sign up'}
          </div>
        </Box>
        <div className="content">
          {!isEmailEntered ? (
            <div className="username">
              <InputLabel>welcome to gif-t</InputLabel>
              <TextField
                value={email}
                placeholder="Email"
                name="email-field"
                onChange={handleOnChangeEmail}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') handleContinue();
                }}
              />
              <div className="extra-actions">
                <div className="no-account">
                  New user?{' '}
                  <span onClick={() => navigate('/signup')}>
                    &nbsp;Sign up.
                  </span>
                </div>
                <div className="continue-container">
                  <Button className="continue" onClick={handleContinue}>
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="password">
              <InputLabel>Log in champ</InputLabel>
              <PasswordField
                value={password}
                placeholder="Password"
                name="password-field"
                onChange={handleOnChangePassword}
                onKeyPress={(event) => {
                  handleKeyPressGenerateGif(event);
                }}
                error={error}
                // helperText={
                //   error ? (
                //     <span>
                //       Sorry, champ. Your password or email is wrong.
                //     </span>
                //   ) : (
                //     ''
                //   )
                // }
              />
              <div className="extra-actions">
                <div className="continue-container">
                  <Button className="continue" onClick={signInUserCredentials}>
                    {isLoading ? 'Processing...' : 'Sign in'}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="divider-container">
            <div className="divider"></div>
            <div>Or</div>
            <div className="divider"></div>
          </div>
          <div className="buttons">
            <OutlookSignInButton />
            <GoogleSignInButton handleSignUpResponse={handleSignUpResponse} isMobile={isMobile} />
          </div>
          {isEmailEntered && (
            <div className="bottom-actions">
              <span onClick={() => navigate('/reset-password')}>
                Reset password
              </span>
              <span onClick={() => setIsEmailEntered(null)}>
                Log in with another account
              </span>
            </div>
          )}
        </div>
      </Box>
    </div>
  );
}

export default UserSignin;
