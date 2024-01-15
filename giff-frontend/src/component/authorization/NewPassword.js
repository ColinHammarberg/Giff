import React, { useState } from 'react';
import { Box } from '@mui/material';
import './Authorization.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { showNotification } from '../notification/Notification';
import Header from '../overall/Header';
import OfficialButton from '../buttons/OfficialButton';
import { ResetUserPassword } from '../../endpoints/UserEndpoints';
import PasswordField from './PasswordField';
import './Authorization.scss';
import BackButton from '../profile/BackButton';

function NewPassword() {
  const [error, setError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const useQuery = () => {
    return new URLSearchParams(location.search);
  };

  const query = useQuery();
  const code = query.get('code');

  function handleOnChangeEmail(event) {
    setPassword(event.target.value);
  }

  function handleOnChangeConfirmEmail(event) {
    setConfirmPassword(event.target.value);
  }

  console.log('code', code);

  const ResetPassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match, please try again.');
    } else {
      setIsLoading(true);
      try {
        const response = await ResetUserPassword(password, code);
        console.log('response', response);
        if (response.status === 200) {
          setTimeout(() => {
            setIsLoading(false);
            showNotification(
              'success',
              "Aaaaand you're done! Now you can login with your new password!"
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
          <div className="title">Set New Password</div>
        </Box>
        <div className="content">
          <div className="fields">
            <PasswordField
              value={password}
              name="email-field"
              placeholder="Password"
              onChange={handleOnChangeEmail}
            />
            <PasswordField
              value={confirmPassword}
              name="password-field"
              placeholder="Confirm password"
              onChange={handleOnChangeConfirmEmail}
              error={!!error}
              helperText={error}
            />
          </div>
          <div className="reset-button">
            <OfficialButton
              onClick={ResetPassword}
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

export default NewPassword;
