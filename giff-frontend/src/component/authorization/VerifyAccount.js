import React, { useContext, useEffect, useState } from 'react';
import { showNotification } from '../Notification';
import { VerifyUser } from '../../endpoints/Apis';
import { useNavigate } from 'react-router-dom';
import Verification from './Verifying.jpg';
import './Verification.scss';
import { GiftContext } from '../../context/GiftContextProvider';

function VerifyAccount() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const { setUser } = useContext(GiftContext);

  useEffect(() => {
    const verifyUserAccount = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (!token) {
        showNotification('error', 'No verification token found.');
        return;
      }
      try {
        const { data, status } = await VerifyUser(token);
        if (status === 200) {
          const access_token = localStorage.getItem('access_token');
          showNotification('success', data.status);
          setVerified(true);
          if (access_token) {
            sessionStorage.removeItem('user')
            localStorage.removeItem('access_token');
            setTimeout(() => navigate('/'), 5000);
          } else {
            setTimeout(() => navigate('/'), 5000);
          }
        } else {
          showNotification('error', data.status);
        }
      } catch (error) {
        if (error.status) {
          showNotification('error', error.data.status);
          console.log('error.data', error.data)
        } else {
          showNotification('error', error.message);
          console.log('error.data', error)
        }
      }
    };

    verifyUserAccount();
  }, [navigate, setUser]);

  return (
    <div className="gif-landing">
      <div className="verification">
        {verified && (
          <img src={Verification} alt="" />
        )}
      </div>
    </div>
  );
}

export default VerifyAccount;
