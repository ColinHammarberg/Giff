import React, { useState } from 'react';
import { Box, InputLabel, TextField } from '@mui/material';
import './Authorization.scss';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../notification/Notification';
import Header from '../overall/Header';
import OfficialButton from '../buttons/OfficialButton';
import { ResetPasswordRequest } from '../../endpoints/UserEndpoints';
import BackButton from '../profile/BackButton';

function ResetPassword() {
  const [error, setError] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  function handleOnChangeEmail(event) {
    setEmail(event.target.value);
  }

  function handleOnChangeConfirmEmail(event) {
    setConfirmEmail(event.target.value);
  }

  const handleRequestResetEmail = async () => {
    if (email !== confirmEmail) {
      setError("Champ! Emails doesn't match. Please try that again.");
    } else {
      setIsLoading(true);
      try {
        const response = await ResetPasswordRequest({ email: email });
        console.log('response', response);
        if (response.status === 200) {
          setTimeout(() => {
            setIsLoading(false);
            showNotification(
              'success',
              "Aaaaand we've sent the reset password email!"
            );
            navigate('/');
          }, 3000);
        } else {
          showNotification(
            'error',
            'Aaarch! Something went wrong. Please contact refresh page or contact us at hello@gif-t.io!'
          );
          setIsLoading(false);
        }
      } catch (error) {
        showNotification(
          'error',
          'Aaarch! Something went wrong. Please contact refresh page or contact us at hello@gif-t.io!'
        );
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="authorization">
      <Header />
      <Box className="user-authentication">
        <Box className="user-title">
          <BackButton onClick={() => navigate('/')} variant="yellow" />
          <div className="title">Reset your password</div>
        </Box>
        <div className="content">
          <div className="fields">
            <TextField
              value={email}
              placeholder="Email"
              name="email-field"
              onChange={handleOnChangeEmail}
            />
            <TextField
              value={confirmEmail}
              placeholder="Confirm email"
              name="password-field"
              onChange={handleOnChangeConfirmEmail}
              error={!!error}
              helperText={error}
            />
          </div>
          <div className="reset-button">
            <OfficialButton
              onClick={handleRequestResetEmail}
              label="Reset password"
              variant="yellow"
              isProcessing={isLoading}
            />
          </div>
        </div>
      </Box>
    </div>
  );
}

export default ResetPassword;
