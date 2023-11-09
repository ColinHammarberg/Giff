import React, { useEffect } from 'react';
import { showNotification } from '../Notification';
import { VerifyUser } from '../../endpoints/Apis';
import { useNavigate } from 'react-router-dom';

function VerifyAccount() {
  const navigate = useNavigate();

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
          setTimeout(() => navigate('/choose-option-create'), 3000);
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
      Token is being verified...
    </div>
  );
}

export default VerifyAccount;
