import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleSignUp } from '../../endpoints/UserEndpoints';
import { showNotification } from '../notification/Notification';
import './GoogleSignInButton.scss';

const GoogleSignUpButton = ({ handleSignUpResponse }) => {
  const handleGoogleResponse = async (response) => {
    try {
      const googleResponse = await GoogleSignUp({
        token: response.credential,
      });
      handleSignUpResponse(googleResponse);
    } catch (error) {
      showNotification('error', 'Google signup failed');
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleResponse}
      onError={() => showNotification('error', 'Google login failed')}
      useOneTap
      style={{ display: 'flex !important', justifyContent: 'center !important', alignItems: 'center !important' }}
      width={480}
      className="custom-google-login-button"
    />
  );
};

export default GoogleSignUpButton;
