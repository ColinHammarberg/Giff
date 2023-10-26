import React, { useEffect, useState } from 'react';
import './Profile.scss';
import Header from './Header';
import { Box, Button, TextField } from '@mui/material';
import { DeleteUserProfile, FetchUserInfo, FetchUserLogo, UpdatePassword } from '../endpoints/Apis';
import { showNotification } from './Notification';
import { useNavigate } from 'react-router-dom';
import DeleteProfileDialog from './DeleteProfileDialog';
import ResetUserDetailsPopover from './authorization/ResetUserDetailsPopover';
import giftUser from '../access/GiftUser';
import LogoUploadForm from './LogoUploadForm';

function Profile() {
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [changeUserDetails, setChangeUserDetails] = useState(null);
    const [password, setPassword] = useState({
      currentPassword: '',
      newPassword: '',
    });
    const handleOnClickChangePasswordButton = (event) => {
      console.log('event', event, changeUserDetails);
      setAnchorEl(event?.currentTarget);
      setChangeUserDetails(event?.target?.name);
    }
    const handleOnChangePassword = (e, field) => {
      setPassword({
        ...password,
        [field]: e.target.value,
      });
    };
    
    const handleOnClose = () => {
      setAnchorEl(null);
    }

    async function requestChangeUserPassword() {
      try {
        const response = await UpdatePassword(password);
        console.log('response', response);
        if (response.data.status === 'Password updated successfully') {
          showNotification('success', 'Password updated successfully');
        }
      } catch (error) {
        showNotification('error', 'Failed to update password');
      }
    }

    const handleOnClickDeleteAccount = async () => {
      const isLoggedIn = giftUser.isLoggedIn();
      const { hasConfirmed } = await DeleteProfileDialog.show();
      console.log('hasConfirmed', hasConfirmed);
      let response;
      if (!hasConfirmed) {
        return;
      } else {
        try {
          response = await DeleteUserProfile(isLoggedIn);
          if (response.data.status === 'Profile deleted') {
            localStorage.removeItem('access_token');
            // Redirect to login page
            navigate('/');
            showNotification('success', response.data.status)
          }
        } catch (error) {
          showNotification('error', response.data.error)
        }
      }
    }
    useEffect(() => {
        const fetchData = async () => {
          const response = await FetchUserInfo();
          console.log('response', response);
          if (response) {
            setUserInfo(response.data);
          }
        };
        fetchData();
      }, []);

      useEffect(() => {
        const fetchData = async () => {
          const response = await FetchUserLogo();
          console.log('response', response);
          if (response) {
            console.log('response', response);
          }
        };
        fetchData();
      }, []);
    console.log('userInfo', userInfo);
  return (
    <div className="profile">
      <Header menu />
        <Box className="title">Profile</Box>
        <Box className="profile-info">
          <ResetUserDetailsPopover
            requestChangeUserPassword={requestChangeUserPassword} 
            onChange={handleOnChangePassword} 
            onClosePopover={handleOnClose}
            anchorEl={anchorEl} 
          />
          <Box className="email-details">
              <div className="text">
                <span>Email address</span>
                <Button>Edit Email</Button>
              </div>
              <TextField value={userInfo?.email} />
          </Box>
          <Box className="password-details">
            <div className="text">
              <span>Password</span>
              <Button name="edit-password" onClick={handleOnClickChangePasswordButton}>Edit Password</Button>
            </div>
            <TextField type="password" value="******" inputProps={{ maxLength: 10 }} />
          </Box>
          <Box className="password-details">
            <LogoUploadForm />
          </Box>
        </Box>
        <Box className="delete-account">
          <Button onClick={handleOnClickDeleteAccount}>Delete Account</Button>
        </Box>
    </div>
  );
}

export default Profile;
