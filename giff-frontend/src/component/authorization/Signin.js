import React, { useState } from 'react';
import { Box, InputLabel, TextField } from '@mui/material';
import './Authorization.scss';
import PasswordField from './PasswordField';
import { Signin } from '../../endpoints/Apis';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../Notification';
import Header from '../Header';
import OfficialButton from '../OfficialButton';

function UserSignin() {
  const [error, setError] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  // const [anchorEl, setAnchorEl] = useState(null);
  // const [emailValue, setEmailValue] = useState('');

  function handleOnChangeEmail(event) {
    setEmail(event.target.value);
  }

  function handleOnChangePassword(event) {
    setPassword(event.target.value);
  }

  const signInUserCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await Signin({ email: email, password: password });
      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access_token); // changed from sessionId
        setTimeout(() => {
          navigate('/choose-option-create');
          showNotification('success', 'Successfully signed in');
        }, 3000)
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
        <Box className="user-title">Sign in to Gif-T</Box>
        <div>
          <InputLabel>
            Username
          </InputLabel>
          <TextField 
            value={email}
            name="email-field"
            onChange={handleOnChangeEmail}
            onKeyPress={(event) => {
              handleKeyPressGenerateGif(event);
            }} />
        </div>
        <div>
          <InputLabel>
            Password
          </InputLabel>
          <PasswordField 
            value={password}
            name="password-field" 
            onKeyPress={(event) => {
              handleKeyPressGenerateGif(event);
            }}
            onChange={handleOnChangePassword} 
            error={error} 
            helperText={error ? 'Sorry, champ. Your password or email is wrong. Please give it another try.' : ''}
          />
        </div>
        <div className="buttons">
          <OfficialButton onClick={signInUserCredentials} label="Sign in" variant="yellow" isProcessing={isLoading} />
          <div className="no-account">Don’t have a Gif-t account yet? No worries. You can sign up <span onClick={() => navigate('/signup')}>here.</span></div>
        </div>
      </Box>
    </div>
  )
}

export default UserSignin;
