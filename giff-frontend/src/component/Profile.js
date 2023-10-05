import React, { useEffect, useState } from 'react';
import './Profile.scss';
import Header from './Header';
import { Box, Button, TextField } from '@mui/material';
import { DeleteUserProfile, FetchUserGifs, FetchUserInfo } from '../endpoints/Apis';
import { showNotification } from './Notification';
import { useNavigate } from 'react-router-dom';
import DeleteProfileDialog from './DeleteProfileDialog';

function Profile() {
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const handleOnClickDeleteAccount = async () => {
      const access_token = localStorage.getItem('access_token');
      const { hasConfirmed } = await DeleteProfileDialog.show();
      console.log('hasConfirmed', hasConfirmed);
      let response;
      if (!hasConfirmed) {
        return;
      } else {
        try {
          response = await DeleteUserProfile(access_token);
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
    // const [userGifs, setUserGifs] = useState(null);
    // const access_token = localStorage.getItem('access_token');
    // useEffect(() => {
    //   const fetchData = async () => {
    //     const response = await FetchUserGifs(access_token);
    //     if (response) {
    //       setUserGifs(response.data);
    //     }
    //   };
    //   fetchData();
    // }, []);
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
    console.log('userInfo', userInfo);
  return (
    <div className="profile">
      <Header menu />
        <Box className="title">Profile</Box>
        <Box className="profile-info">
          <Box className="email-details">
              <div className="text">
                <span>Email address</span>
                <Button>Edit Email</Button>
              </div>
              <TextField value={userInfo?.email} />
          </Box>
          <Box className="password-details">
            <div className="text">
              <span>password</span>
              <Button>Edit Password</Button>
            </div>
            <TextField type="password" value="******" inputProps={{ maxLength: 10 }} />
          </Box>
        </Box>
        <Box className="delete-account">
          <Button onClick={handleOnClickDeleteAccount}>Delete Account</Button>
        </Box>
    </div>
  );
}

export default Profile;
