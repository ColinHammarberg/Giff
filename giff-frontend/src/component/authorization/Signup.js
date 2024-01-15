import React, { useState, useEffect, useCallback } from 'react';
import { Box, Checkbox, InputLabel, TextField } from '@mui/material';
import './Authorization.scss';
import PasswordField from './PasswordField';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../notification/Notification';
import Header from '../overall/Header';
import { isValidEmail } from '../../utils/utils';
import OfficialButton from '../buttons/OfficialButton';
import { GoogleSignUp, Signup } from '../../endpoints/UserEndpoints';
import GoogleSignInButton from './GoogleSignInButton';
import OutlookSignInButton from './OutlookSignin';
import BackButton from '../profile/BackButton';
import useMobileQuery from '../../queries/useMobileQuery';

function UserSignup() {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { isMobile } = useMobileQuery();

  const GOOGLE_CLIENT_ID =
    '780954759358-8kkg6m7kdtg9dn26449mfnpsvnpqtnv4.apps.googleusercontent.com';

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      setIsLoading(true);
      const googleResponse = await GoogleSignUp({ token: response.credential });
      handleSignUpResponse(googleResponse);
    } catch (error) {
      showNotification('error', 'Google signup failed');
      setIsLoading(false);
    }
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

  const handleOnChangeCheckbox = (event) => {
    setChecked(event.target.checked);
  };

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const signUpUserCredentials = async () => {
    console.log('formData', formData);
    if (!checked) {
      setError(true);
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('Invalid email address');
      return;
    }
    setIsLoading(true);
    try {
      const response = await Signup(formData);
      handleSignUpResponse(response);
    } catch (error) {
      showNotification(
        'error',
        error.response?.data?.message || 'Signup failed'
      );
      setIsLoading(false);
    }
  };

  const handleSignUpResponse = (response) => {
    if (response.data.status === 'Signup successful') {
      localStorage.setItem('access_token', response.data.access_token);
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

  const handleKeyPressGenerateGif = (event) => {
    if (event.key === 'Enter') {
      signUpUserCredentials();
    }
  };

  return (
    <div className="authorization">
      <Header nonAuthenticated />
      <Box className="user-authentication">
        <Box className="user-title">
          <BackButton onClick={() => navigate('/')} variant="yellow" />
          <div className="title">Sign up</div>
        </Box>
        <div className="content">
          <div className="signup-fields">
            <div className="user-details">
              <InputLabel>Become a gif-ter</InputLabel>
              <TextField
                value={formData.email}
                name="email"
                placeholder="Email"
                error={error === 'Invalid email address'}
                helperText={
                  error === 'Invalid email address' &&
                  'Please enter a valid email address'
                }
                onKeyPress={handleKeyPressGenerateGif}
                onChange={handleOnChange}
              />
            </div>
            <div className="password-details">
              <PasswordField
                value={formData.password}
                placeholder="Password"
                name="password"
                onChange={handleOnChange}
              />
            </div>
          </div>
          <Box className="checkbox">
            <Checkbox onChange={handleOnChangeCheckbox} checked={checked} />
            <div className={error && 'error'}>
              I agree that GiF-T can store my email and send me information,
              marketing, and newsletters.
            </div>
          </Box>
          <div className="divider-container">
            <div className="divider"></div>
            <div>Or</div>
            <div className="divider"></div>
          </div>
          <div className="buttons">
            <OfficialButton
              onClick={signUpUserCredentials}
              label="Sign Up"
              variant="pink"
              isProcessing={isLoading}
            />
            <OutlookSignInButton
              checked={checked}
              setError={setError}
              signupFlow
            />
            <GoogleSignInButton
              checked={checked}
              isMobile={isMobile}
              setError={setError}
              handleSignUpResponse={handleSignUpResponse}
              signupFlow
            />
          </div>
        </div>
      </Box>
    </div>
  );
}

export default UserSignup;
