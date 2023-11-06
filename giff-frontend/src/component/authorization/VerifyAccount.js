import React from 'react';
import { showNotification } from '../Notification';
import { VerifyUser } from '../../endpoints/Apis';
import { useNavigate } from 'react-router-dom';

function VerfifyAccount() {
    const navigate = useNavigate();
    async function verifyUserAccount() {
        // Extract the token from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
          try {
            const response = await VerifyUser(token);
            if (response.data.status === "Email verified successfully") {
              showNotification('success', 'Your email has been successfully verified.');
              setTimeout(() => navigate('/choose-option-create'), 3000);
            } else {
                showNotification('error', response.data.status);
            }
          } catch (error) {
            console.error('Error during email verification:', error);
            // Handle error response (e.g., error.response.data.status)
            const errorMessage = error.response && error.response.data && error.response.data.status
              ? error.response.data.status
              : 'An error occurred during verification. Please try again.';
            showNotification('error', errorMessage);
          }
        } else {
            showNotification('error', 'No verification token found.');
        }
      }
  return (
    <div className="gif-landing">
        {verifyUserAccount()}
    </div>
  );
}

export default VerfifyAccount;
