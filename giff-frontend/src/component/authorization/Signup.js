import React, { useState } from 'react';
import { Box, Button, InputLabel, TextField } from '@mui/material';
import './Authorization.scss';
import PasswordField from './PasswordField';
import { Signup } from '../../endpoints/Apis';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../Notification';
import Header from '../Header';

function UserSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  // const [anchorEl, setAnchorEl] = useState(null);
  // const [emailValue, setEmailValue] = useState('');

  function handleOnChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  const signUpUserCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await Signup({ username: formData.userName, email: formData.email, password: formData.password });
      if (response.status === 200) {
        localStorage.setItem('sessionId', response.data.session_id);
        navigate('/choose-option-create');
        showNotification('success', 'Successfully signed up');
      } else {
        console.log("Signup failed", response.data);
        showNotification('error', response.data.message || "Signup failed for some reason");
      }
    } catch (error) {
      console.log("Signup error", error);
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
            <div>
                <InputLabel>
                    Username
                </InputLabel>
                <TextField value={formData.userName}  name="userName" onChange={handleOnChange} />
            </div>
            <div>
                <InputLabel>
                    Email
                </InputLabel>
                <TextField value={formData.email}  name="email" onChange={handleOnChange} />
            </div>
        </div>
        <div className="password-details">
            <div>
                <InputLabel>
                    Password
                </InputLabel>
                <PasswordField value={formData.password}  name="password" onChange={handleOnChange} />
            </div>
            <div>
                <InputLabel>
                    Password
                </InputLabel>
                <PasswordField value={formData.confirmPassword} name="confirmPassword" onChange={handleOnChange} />
            </div>
        </div>
        <div className="buttons">
          <Button onClick={signUpUserCredentials} onKeyDown={(event) => {handleKeyPressGenerateGif(event)}}>
            Sign Up
          </Button>
        </div>
      </Box>
    </div>
  )
}

export default UserSignup;
