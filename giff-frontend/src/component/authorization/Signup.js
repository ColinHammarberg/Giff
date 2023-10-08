import React, { useState } from 'react';
import { Box, Button, Checkbox, InputLabel, TextField } from '@mui/material';
import './Authorization.scss';
import PasswordField from './PasswordField';
import { Signup } from '../../endpoints/Apis';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../Notification';
import Header from '../Header';
import { isValidEmail } from '../../utils/utils';

function UserSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);
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
    setIsLoading(true);
    if (!checked) {
      setError(true);
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('Invalid email address');
      return;
    }
    try {
      const response = await Signup({ email: formData.email, password: formData.password });
      if (response.status === 200) {
        setTimeout(() => {
          localStorage.setItem('access_token', response.data.access_token); // changed from sessionId
          navigate('/choose-option-create');
          showNotification('success', 'Successfully signed up');
        }, 2000);
      } else {
        showNotification('error', response.data.message || "Signup failed for some reason");
      }
    } catch (error) {
      showNotification('error', error.response?.data?.message || "Signup failed");
    }
    setIsLoading(false);
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
          <Button onClick={signUpUserCredentials}>
            Sign Up
          </Button>
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
