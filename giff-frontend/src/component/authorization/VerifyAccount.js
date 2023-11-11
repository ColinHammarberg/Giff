import React, { useEffect, useState } from 'react';
import { showNotification } from '../Notification';
import { VerifyUser } from '../../endpoints/Apis';
import { useNavigate } from 'react-router-dom';
import Verification from '../../resources/verification.gif';
import './Verification.scss';

function VerifyAccount() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

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
          showNotification('success', data.status);
          setVerified(true);
          setTimeout(() => navigate('/choose-option-create'), 5000);
        } else {
          showNotification('error', data.status);
        }
      } catch (error) {
        if (error.status) {
          showNotification('error', error.data.status);
        } else {
          showNotification('error', error.message);
        }
      }
    };

    verifyUserAccount();
  }, [navigate]);

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
