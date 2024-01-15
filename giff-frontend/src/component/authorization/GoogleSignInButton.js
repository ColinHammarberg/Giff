import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleSignIn } from '../../endpoints/UserEndpoints';
import { showNotification } from '../notification/Notification';
import './GoogleSignInButton.scss';

const GoogleSignInButton = ({
  handleSignUpResponse,
  checked,
  setError,
  signupFlow,
  isMobile
}) => {
  const handleGoogleResponse = async (response) => {
    if (!checked && signupFlow) {
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
        backgroundColor: 'transparent !important',
      }}
      width={isMobile ? 200 : 480}
      height={50}
      className="custom-google-login-button"
    />
  );
};

export default GoogleSignInButton;
