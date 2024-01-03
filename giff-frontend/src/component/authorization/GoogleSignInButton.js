import React, { useEffect } from 'react';
import { GoogleSignUp } from '../../endpoints/UserEndpoints';
import { showNotification } from '../notification/Notification';

const GoogleSignInButton = ({ handleSignUpResponse }) => {
  const GOOGLE_CLIENT_ID = '780954759358-cqnev3bau95uvbk80jltofofr4qc4m38.apps.googleusercontent.com';

  const handleGoogleResponse = async (response) => {
    try {
      const googleResponse = await GoogleSignUp({ token: response.credential });
      handleSignUpResponse(googleResponse);
    } catch (error) {
      showNotification('error', 'Google signup failed');
    }
  };

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: response => handleGoogleResponse(response),
    });
  }, [handleGoogleResponse]);

  const signInWithGoogle = () => {
    window.google.accounts.id.prompt();
  };

  return (
    <button onClick={signInWithGoogle} className="google-sign-in">
      Sign in with Google
    </button>
  );
};

export default GoogleSignInButton;
