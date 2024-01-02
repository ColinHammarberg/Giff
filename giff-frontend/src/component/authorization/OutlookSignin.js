import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { showNotification } from '../notification/Notification';
import { useNavigate } from 'react-router-dom';
import { MicrosoftAuthSignin } from '../../endpoints/UserEndpoints';
import './OutlookButton.scss';
import MicrosoftLogo from '../../resources/Microsoft_logo.png'

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
        const microsoftToken = response.accessToken;

        try {
          const signInResponse = await MicrosoftAuthSignin(microsoftToken);
          console.log('signInResponse', signInResponse);
          if (signInResponse.status === 'Signin successful') {
            localStorage.setItem('access_token', signInResponse.access_token);
            navigate('/choose-option-create');
            showNotification('success', 'Successfully signed in with Outlook');
          } else {
            showNotification(
              'error',
              signInResponse.data.message || 'Sign-in with Outlook failed'
            );
          }
        } catch (error) {
          showNotification('error', 'Sign-in with Outlook failed');
        }
      })
      .catch((error) => {
        showNotification('error', 'Sign-in with Outlook failed');
      });
  };

  return (
    <MsalProvider instance={msalInstance}>
        <button onClick={handleSignIn} className="outlook-btn">
        <span className="outlook-logo">
            <img src={MicrosoftLogo} alt="" />
          </span>
          Sign in with Outlook
        </button>
    </MsalProvider>
  );
}

export default OutlookSignInButton;
