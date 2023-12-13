import React from 'react';
import { useQuery } from 'react-query';
import { showNotification } from '../notification/Notification';
import { useNavigate } from 'react-router-dom';
import Verification from './Verifying.jpg';
import './Verification.scss';
import { VerifyUser } from '../../endpoints/UserEndpoints';

const useVerificationNavigation = () => {
  const navigate = useNavigate();
  const access_token = localStorage.getItem('access_token');

  const handleSuccess = (data) => {
    console.log('data', data);
    const message = data?.status === 200 ? "Jippiee! Your account has been verified champ!" : "Ohh no! We couldn't verify your account. Please request a new link in your profile.";
    showNotification(data?.status === 200 ? 'success' : 'error', message);
    const navigatePath = access_token ? '/choose-option-create' : '/';
    setTimeout(() => navigate(navigatePath), 3000);
  };

  const handleError = (error) => {
    showNotification('error', error.message || 'Verification failed');
  };

  return { handleSuccess, handleError };
};

function VerifyAccount() {
  const { handleSuccess, handleError } = useVerificationNavigation();
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  useQuery(
    ['verifyUser', code],
    () => VerifyUser(code),
    {
      retry: 10,
      retryDelay: 1000,
      enabled: !!code,
      onSuccess: handleSuccess,
      onError: handleError
    }
  );

  return (
    <div className="gif-landing">
      <div className="verification">
        <img src={Verification} alt="Verifying" />
      </div>
    </div>
  );
}

export default VerifyAccount;
