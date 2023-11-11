import React, { useContext, useState } from 'react';
import _debounce from 'lodash/debounce';
import './Profile.scss';
import Header from './Header';
import { Box, Button, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DeleteUserLogo, DeleteUserProfile, SaveUserResolution, UpdateEmailAddress, UpdatePassword } from '../endpoints/Apis';
import { showNotification } from './Notification';
import { useNavigate } from 'react-router-dom';
import DeleteProfileDialog from './DeleteProfileDialog';
import ResetUserDetailsPopover from './authorization/ResetUserDetailsPopover';
import LogoUploadForm from './LogoUploadForm';
import { GiftContext } from '../context/GiftContextProvider';
import LightTooltip from './LightToolTip';
import ResolutionSelect from './ResolutionSelect';
import Tag from './Tag';

function Profile() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [changeUserDetails, setChangeUserDetails] = useState(null);
    const { user, setUser } = useContext(GiftContext); // Get the context value
    const [password, setPassword] = useState({
      currentPassword: '',
      newPassword: '',
    });
    const [email, setEmail] = useState({
      newEmail: '',
      password: '',
    });
    const isActive = user?.userInfo?.is_active;

    console.log('email', email);
    
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

    const handleOnChangeEmail = (e, field) => {
      setEmail({
        ...email,
        [field]: e.target.value,
      });
    };

    const handleOnClickChangeEmailButton = (event) => {
      console.log('event', event, changeUserDetails);
      setAnchorEl(event?.currentTarget);
      setChangeUserDetails(event?.target?.name);
    }
    
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

    const handleUserUpdate = (updatedFields) => {
      setUser(updatedFields);
    };

    async function requestChangeUserEmail() {
      try {
        const response = await UpdateEmailAddress(email);
        console.log('response', response);
        if (response.data.status === 'Email updated successfully') {
          showNotification('success', 'Email updated successfully');
          // Update user state
          handleUserUpdate({ email: email.newEmail });
        } else {
          showNotification('error', 'Email was not updated successfully. Please try again!');
        }
      } catch (error) {
        showNotification('error', 'Failed to update email');
      }
    }
    

    const handleOnClickDeleteAccount = async () => {
      const { hasConfirmed } = await DeleteProfileDialog.show();
      console.log('hasConfirmed', hasConfirmed);
      let response;
      if (!hasConfirmed) {
        return;
      } else {
        try {
          response = await DeleteUserProfile();
          console.log('response', response);
          if (response.data.status === 'Profile deleted') {
            localStorage.removeItem('access_token');
            navigate('/');
            showNotification('success', response.data.status)
          }
        } catch (error) {
          showNotification('error', 'Failed to delete account. Please try again!')
        }
      }
    }

    const handleResolutionSizeChange = _debounce(async(value) => {
      if (value) {
        try {
          const response = await SaveUserResolution(value);
          if (response.data) {
            handleUserUpdate({ resolution: value });
            showNotification('success', 'Successfully updated your resolution for your gifs')
          }
        } catch(e) {
          showNotification('error', 'Successfully updated your resolution for your gifs')
        }
      }
      console.log('value2', value);
    }, 400);

    const handleOnDeleteLogo = async () => {
      const { hasConfirmed } = await DeleteProfileDialog.show();
      console.log('hasConfirmed', hasConfirmed);
      if (!hasConfirmed) {
        return;
      } else {
        try {
          const response = await DeleteUserLogo();
          if (response.data) {
            // Step 1: Update React state
            setUser((prevUser) => {
              const updatedUser = { ...prevUser, userLogoSrc: null };
              return updatedUser;
            });
      
            // Step 2: Update localStorage
            const userData = sessionStorage.getItem('user');
            if (userData) {
              const parsedUserData = JSON.parse(userData);
              parsedUserData.userLogoSrc = null;
              sessionStorage.setItem('user', JSON.stringify(parsedUserData));
            }
            
            showNotification('success', 'Successfully deleted your logo');
          }
        } catch (error) {
          showNotification('error', 'Failed to delete your logo');
        }
      }
    };

  return (
    <div className="profile">
      <Header menu />
        <Box className="title">Profile</Box>
        <Box className="profile-info">
        <ResetUserDetailsPopover
          requestChangeUserPassword={requestChangeUserPassword}
          requestChangeUserEmail={requestChangeUserEmail}
          handleOnChangePassword={handleOnChangePassword}
          handleOnChangeEmail={handleOnChangeEmail}
          changeUserDetails={changeUserDetails}
          onClosePopover={handleOnClose}
          anchorEl={anchorEl}
        />
          <Box className="email-details">
              <div className="text">
                <span>Email address</span>
                <Button name="edit-email" onClick={handleOnClickChangeEmailButton}>Edit Email</Button>
              </div>
              <div className="email">
                <Tag variant={isActive ? 'success' : 'error'} label={isActive ? 'Verified' : 'Not verified'}/>
                <TextField 
                  value={user?.userInfo?.email}
                  className="email"
                  disabled
                />
              </div>
          </Box>
          <Box className="password-details">
            <div className="text">
              <span>Password</span>
              <Button name="edit-password" onClick={handleOnClickChangePasswordButton}>Edit Password</Button>
            </div>
            <TextField type="password" value="******" inputProps={{ maxLength: 10 }} disabled />
          </Box>
          <Box className="resolution-details">
            <div className="text">
              <span>Standard gif size</span>
            </div>
            <ResolutionSelect onChange={handleResolutionSizeChange} defaultValue={user?.userInfo?.resolution} />
          </Box>
          <Box className="password-details">
            <LogoUploadForm userLogoSrc={user?.userLogoSrc} setUser={setUser} />
            {user?.userLogoSrc && (
              <LightTooltip title="Remove logo">
                <IconButton onClick={handleOnDeleteLogo}>
                  <DeleteIcon />
                </IconButton>
              </LightTooltip>
            )}
          </Box>
        </Box>
        <Box className="delete-account">
          <Button onClick={handleOnClickDeleteAccount}>Delete Account</Button>
        </Box>
    </div>
  );
}

export default Profile;
