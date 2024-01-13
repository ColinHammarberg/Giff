import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleSignIn } from '../../endpoints/UserEndpoints';
import { showNotification } from '../notification/Notification';
import './GoogleSignInButton.scss';

const GoogleSignInButton = ({ handleSignUpResponse, checked, setError }) => {
  const handleGoogleResponse = async (response) => {
    if (!checked) {
      setError(true);
      return;
    }
    const googleResponse = await GoogleSignIn({
      token: response.credential,
    });
    handleSignUpResponse(googleResponse);
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleResponse}
      onError={() => showNotification('error', 'Google login failed')}
      useOneTap
      style={{
        display: 'flex !important',
        justifyContent: 'center !important',
        alignItems: 'center !important',
      }}
      width={480}
      className="custom-google-login-button"
    />
  );
};

export default GoogleSignInButton;
