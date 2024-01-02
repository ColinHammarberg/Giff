import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { MicrosoftAuthSignup } from '../../endpoints/UserEndpoints';
import { showNotification } from '../notification/Notification';
import { useNavigate } from 'react-router-dom';

const msalConfig = {
  auth: {
    clientId: '9c954b52-98e9-45b7-a5ed-da61c3048204',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'https://giveagif-t.com',
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

function OutlookSignInButton() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleSignIn = () => {
    const loginRequest = {
      scopes: ['openid', 'profile', 'User.Read'],
    };

    instance
      .loginPopup(loginRequest)
      .then(async (response) => {
        console.log('Microsoft sign-in response:', response);
        const microsoftToken = response.accessToken;

        try {
          const signUpResponse = await MicrosoftAuthSignup(microsoftToken);
          console.log('Microsoft sign-up response:', signUpResponse);
          if (signUpResponse.status === 200) {
            sessionStorage.setItem(
              'access_token',
              signUpResponse.data.access_token
            );
            navigate('/choose-option-create');
            showNotification('success', 'Successfully signed in with Outlook');
          } else {
            showNotification(
              'error',
              signUpResponse.data.message || 'Sign-in with Outlook failed'
            );
          }
        } catch (error) {
          console.error('Error during Microsoft sign-up:', error);
          showNotification('error', 'Sign-in with Outlook failed');
        }
      })
      .catch((error) => {
        console.error('Login error', error);
        showNotification('error', 'Sign-in with Outlook failed');
      });
  };

  return (
    <MsalProvider instance={msalInstance}>
        <button onClick={handleSignIn}>Sign in with Outlook</button>
    </MsalProvider>
  );
}

export default OutlookSignInButton;
