import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { showNotification } from '../Notification';
import { VerifyUser } from '../../endpoints/Apis';
import { useNavigate } from 'react-router-dom';
import Verification from './Verifying.jpg';
import './Verification.scss';

function VerifyAccount() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const { data, isLoading, isError } = useQuery(
    ['verifyUser', token],
    () => VerifyUser(token),
    {
      retry: 5,
      retryDelay: 2000,
      enabled: !!token,
      onSuccess: (data) => {
        if (data?.status === 200) {
          showNotification('success', data.status);
          sessionStorage.removeItem('user');
          setTimeout(() => navigate('/'), 3000);
        }
      },
      onError: (error) => {
        showNotification('error', error.message || 'Verification failed');
      }
    }
  );

  useEffect(() => {
    if (data?.status !== 200 && !isLoading && !isError) {
      showNotification('error', 'Invalid or expired token.');
      navigate('/');
    }
  }, [data, isLoading, isError, navigate]);

  return (
    <div className="gif-landing">
      <div className="verification">
        {isLoading && (
          <img src={Verification} alt="Verifying" />
        )}
      </div>
    </div>
  );
}

export default VerifyAccount;
