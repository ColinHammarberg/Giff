import React, { useState } from 'react';
import { Box, InputLabel } from '@mui/material';
import './Authorization.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import { showNotification } from '../notification/Notification';
import Header from '../overall/Header';
import OfficialButton from '../buttons/OfficialButton';
import { ResetUserPassword } from '../../endpoints/UserEndpoints';
import PasswordField from './PasswordField';
import './Authorization.scss';

function NewPassword() {
  const [error, setError] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const useQuery = () => {
    return new URLSearchParams(location.search);
  };

  const query = useQuery();
  const token = query.get('token');

  function handleOnChangeEmail(event) {
    setPassword(event.target.value);
  }

  function handleOnChangeConfirmEmail(event) {
    setConfirmPassword(event.target.value);
  }

  const ResetPassword = async () => {
    if (password !== confirmPassword) {
        setError('error', 'Champ! Passwords do not match, please try it again.');
    } else {
        setIsLoading(true);
        try {
        const response = await ResetUserPassword(password, token );
        if (response.status === 200) {
            setTimeout(() => {
            setIsLoading(false);
            showNotification('success', "Aaaaand you're done! Now you can login with your new password!");
            navigate('/')
            }, 3000)
        } else {
            setError('error', response.data.message);
            setIsLoading(false);
        }
        } catch (error) {
        setError('error', "Signin failed");
        setIsLoading(false);
        }
    }
  };

  return (
    <div className="authorization">
      <Header />
      <Box className="user-authentication">
        <Box className="user-title">Set New Password</Box>
        <div className="username">
          <InputLabel>
            password
          </InputLabel>
          <PasswordField
            value={password}
            name="email-field"
            onChange={handleOnChangeEmail}
          />
        </div>
        <div className="password">
          <InputLabel>
            Confirm password
          </InputLabel>
          <PasswordField 
            value={confirmPassword}
            name="password-field" 
            onChange={handleOnChangeConfirmEmail} 
            error={error}
            helperText={error ? 'Champ! Passwords do not match, please try it again.': ''}
          />
        </div>
        <div className="buttons">
          <OfficialButton onClick={ResetPassword} label="Reset password" variant="yellow" isProcessing={isLoading} />
        </div>
      </Box>
    </div>
  )
}

export default NewPassword;
