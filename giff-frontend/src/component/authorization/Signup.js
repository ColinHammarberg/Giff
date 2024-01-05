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
import OutlookSignUpButton from './OutlookSignup';
import GoogleSignInButton from './GoogleSignInButton';

function UserSignup() {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

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
    if (response.status === 200) {
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
      <Header />
      <Box className="user-authentication">
        <Box className="user-title">Become a gif-ter</Box>
        <div className="user-details">
          <InputLabel>Email</InputLabel>
          <TextField
            value={formData.email}
            name="email"
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
          <InputLabel>Password</InputLabel>
          <PasswordField
            value={formData.password}
            name="password"
            onChange={handleOnChange}
          />
        </div>
        <div className="buttons">
          <OfficialButton
            onClick={signUpUserCredentials}
            label="Sign Up"
            variant="pink"
            isProcessing={isLoading}
          />
          <OutlookSignUpButton checked={checked} setError={setError} />
          <GoogleSignInButton handleSignUpResponse={handleSignUpResponse} />
        </div>
        <Box className="checkbox">
          <Checkbox onChange={handleOnChangeCheckbox} checked={checked} />
          <div>
            I agree that GiF-T can store my email and send me information,
            marketing, and newsletters.
          </div>
        </Box>
        {error && (
          <Box className="error">
            Sorry, champ. Before you can sign up, you need to check the box and
            agree that we store your information and send you stuff.
          </Box>
        )}
      </Box>
    </div>
  );
}

export default UserSignup;
