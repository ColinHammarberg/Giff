import React, { useState } from 'react';
import { Box, Checkbox, InputLabel, TextField } from '@mui/material';
import './Authorization.scss';
import PasswordField from './PasswordField';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../notification/Notification';
import Header from '../overall/Header';
import { isValidEmail } from '../../utils/utils';
import OfficialButton from '../buttons/OfficialButton';
import { Signup } from '../../endpoints/UserEndpoints';

function UserSignup() {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const handleOnChangeCheckbox = (event) => {
    const newValue = event.target.checked;
    setChecked(newValue);    
  };

  function handleOnChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  console.log('checked', checked);

  const signUpUserCredentials = async () => {
    if (!checked) {
      setError(true);
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('Invalid email address');
      return;
    }
    setIsLoading(true);
    try {
      const response = await Signup({ email: formData.email, password: formData.password });
      if (response.status === 200) {
        setTimeout(() => {
          localStorage.setItem('access_token', response.data.access_token); // changed from sessionId
          setIsLoading(false);
          navigate('/choose-option-create');
          showNotification('success', 'Successfully signed up');
        }, 2000);
      } else {
        setIsLoading(false);
        showNotification('error', response.data.message || "Signup failed for some reason");
      }
    } catch (error) {
      showNotification('error', error.response?.data?.message || "Signup failed");
    }
  };

  const handleKeyPressGenerateGif = (event) => {
    if (event.key === 'Enter') {
        signUpUserCredentials();
    }
  };

  return (
    <div className="authorization">
      <Header />
      <Box className="user-authentication">
      <Box className="user-title">Become a gif-ter</Box>
        <div className="user-details">
            <InputLabel>
                Email
            </InputLabel>
            <TextField 
              value={formData.email} 
              name="email" 
              error={error === 'Invalid email address'}
              helperText={error === 'Invalid email address' && 'Please enter a valid email address'}
              onKeyPress={(event) => {
                handleKeyPressGenerateGif(event);
              }}
              onChange={handleOnChange} 
            />
        </div>
        <div className="password-details">
            <InputLabel>
              Password
            </InputLabel>
            <PasswordField value={formData.password}  name="password" onChange={handleOnChange} />
        </div>
        <div className="buttons">
          <OfficialButton onClick={signUpUserCredentials} label="Sign Up" variant="yellow" isProcessing={isLoading} />
        </div>
        <Box className="checkbox">
            <Checkbox onChange={handleOnChangeCheckbox} checked={checked} />
            <div>I agree that GiF-T can store my email and send me information, marketing and newsletters.</div>
        </Box>
        {error && (
            <Box className="error">
                Sorry, champ. Before you can sign up, You need to check the box and agree that we store your information and send you stuff.
            </Box>
        )}
    </Box>
</div>
  )
}

export default UserSignup;
