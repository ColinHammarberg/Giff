import React, { useState } from 'react';
import { Box, Button, InputLabel, TextField } from '@mui/material';
import './Authorization.scss';
import { Signin } from '../../endpoints/Apis';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../Notification';
import Header from '../Header';

function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  // const [anchorEl, setAnchorEl] = useState(null);
  // const [emailValue, setEmailValue] = useState('');

  function handleOnChangeEmail(event) {
    setEmail(event.target.value);
  }

  const requestResetPassword = async () => {
    setIsLoading(true);
    try {
      const response = await Signin({ email: email });
      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access_token); // changed from sessionId
        navigate('/choose-option-create');
        showNotification('success', 'Successfully signed in');
      } else {
        setError('error', response.data.message);
      }
    } catch (error) {
      setError('error', "Signin failed");
    }
    setIsLoading(false);
  };
  

  const handleKeyPressGenerateGif = (event) => {
    if (event.key === 'Enter') {
      signInUserCredentials();
    }
  };

  return (
    <div className="authorization">
      <Header />
      <Box className="user-authentication">
        <Box className="signin-title">Reset your password</Box>
        <div>
          <InputLabel>
            Email
          </InputLabel>
          <TextField 
            value={email}
            name="email-field"
            onChange={handleOnChangeEmail}
            error={!!error}
            onKeyPress={(event) => {
              handleKeyPressGenerateGif(event);
            }} />
        </div>
        <div className="buttons">
          <Button onClick={requestResetPassword}>
            {isLoading ? 'Processing...' : 'Change Password'}
          </Button>
          <div className="no-account">Don't have an account yet champ? <span onClick={() => navigate('/signup')}>Sign up here then.</span></div>
        </div>
      </Box>
    </div>
  )
}

export default ResetPassword;
