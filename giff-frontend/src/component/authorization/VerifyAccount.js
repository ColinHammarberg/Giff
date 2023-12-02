import React from 'react';
import { useQuery } from 'react-query';
import { showNotification } from '../notification/Notification';
import { useNavigate } from 'react-router-dom';
import Verification from './Verifying.jpg';
import './Verification.scss';
import { VerifyUser } from '../../endpoints/UserEndpoints';

function VerifyAccount() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  console.log('token', token);

  const { data } = useQuery(
    ['verifyUser', token],
    () => VerifyUser(token),
    {
      retry: 10,
      retryDelay: 1000,
      enabled: !!token,
      onSuccess: (data) => {
        if (data?.status === 200) {
          sessionStorage.removeItem('user');
          setTimeout(() => navigate('/'), 3000);
        }
      },
      onError: (error) => {
        showNotification('error', error.message || 'Verification failed');
      }
    }
  );

  console.log('data', data);

  return (
    <div className="gif-landing">
      <div className="verification">
        <img src={Verification} alt="Verifying" />
      </div>
    </div>
  );
}

export default VerifyAccount;
