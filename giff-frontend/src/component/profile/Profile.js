import React, { useContext, useState } from 'react';
import _debounce from 'lodash/debounce';
import './Profile.scss';
import Header from '../overall/Header';
import { Box, Button, Checkbox, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { showNotification } from '../notification/Notification';
import { useNavigate } from 'react-router-dom';
import DeleteProfileDialog from './DeleteProfileDialog';
import ResetUserDetailsPopover from '../authorization/ResetUserDetailsPopover';
import LogoUploadForm from './LogoUploadForm';
import { GiftContext } from '../../context/GiftContextProvider';
import LightTooltip from '../overall/LightToolTip';
import ResolutionSelect from './ResolutionSelect';
import Tag from '../overall/Tag';
import { ToggleIncludeLogo } from '../../endpoints/GifCreationEndpoints';
import { DeleteUserLogo, DeleteUserProfile, ResendVerificationEmail, SaveUserResolution, UpdateEmailAddress, UpdatePassword } from '../../endpoints/UserEndpoints';
import useFetchUser from '../../queries/useUserDataQuery';
// import { useQueryClient } from 'react-query';
import useFetchUserLogo from '../../queries/useUserLogoQuery';
import useMobileQuery from '../../queries/useMobileQuery';

function Profile() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [changeUserDetails, setChangeUserDetails] = useState(null);
    const { isMobile } = useMobileQuery();
    const { setUser } = useContext(GiftContext); // Get the context value
    const { user } = useFetchUser(changeUserDetails);
    const [showOptions, setShowOptions] = useState(false);
    const { userLogoSrc } = useFetchUserLogo();
    console.log('user', user);
    const [checked, setChecked] = useState(user?.include_logo);
    const [password, setPassword] = useState({
      currentPassword: '',
      newPassword: '',
    });
    const [email, setEmail] = useState({
      newEmail: '',
      password: '',
    });
    const isActive = user?.is_active;
    // const queryClient = useQueryClient();

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

    const handleUserUpdate = (updatedFields) => {
      console.log('updatedFields', updatedFields);
    };

    const handleOnChangeCheckbox = async (event) => {
      try {
        const response = await ToggleIncludeLogo();
        const newValue = event.target.checked;
        setChecked(newValue);
        console.log('Settings saved:', response);
        if (response.data.status === 'success') {
          showNotification('success', 'Successfully saved settings.')
          handleUserUpdate({ include_logo: response.data.data });
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('error', 'Error while saving settings.')
      } 
    };

    const handleOnChangeEmail = (e, field) => {
      setEmail({
        ...email,
        [field]: e.target.value,
      });
    };

    async function handleOnResendEmailVerification() {
      try {
        const response = await ResendVerificationEmail();
        console.log('response', response);
        if (response.status === 'Sent new email verification link') {
          showNotification('success', `Sent verification email to ${user?.email}`)
        }
      } catch (error) {
        showNotification('error', 'Failed to send verification email.');
      }
    }

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

    async function requestChangeUserEmail() {
      const response = await UpdateEmailAddress(email);
      console.log('response', response);
      if (response.data.status === 'Email updated successfully') {
        showNotification('success', 'Email updated successfully');
          // Update user state
        handleUserUpdate({ email: email.newEmail });
      } else {
          showNotification('error', 'Email was not updated successfully. Please try again!');
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
          if (response.data.status === "Settings updated successfully") {
            handleUserUpdate({ resolution: value });
            setChangeUserDetails(value);
            showNotification('success', 'Yay! You now have a new standard size.')
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
            setUser((prevUser) => {
              const updatedUser = { ...prevUser, userLogoSrc: null };
              return updatedUser;
            });
            sessionStorage.removeItem('userLogoItem')
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
                {!isMobile && (
                  <Button name="edit-email" onClick={handleOnClickChangeEmailButton}>Edit Email</Button>
                )}
              </div>
              <div className="email">
                {!isMobile && (
                  <Tag variant={isActive ? 'success' : 'error'} label={isActive ? 'Verified' : 'Not verified'}/>
                )}
                {isMobile && (
                  <Button name="edit-email" onClick={handleOnClickChangeEmailButton}>Edit</Button>
                )}
                <TextField
                  value={user?.email}
                  className="email"
                  disabled
                />
                {!isActive && !isMobile && (
                  <Button className="verify-email-btn" onClick={handleOnResendEmailVerification}>Click to verify</Button>
                )}
              </div>
          </Box>
          <Box className="password-details">
            <div className="text">
              <span>Password</span>
              {!isMobile && (
                <Button name="edit-password" onClick={handleOnClickChangePasswordButton}>Edit Password</Button>
              )}
            </div>
            <div className="password">
              {isMobile && (
                <Button name="edit-password" onClick={handleOnClickChangePasswordButton}>Edit</Button>
              )}
              <TextField type="password" value="******" inputProps={{ maxLength: 10 }} disabled />
            </div>
          </Box>
          <Box className="resolution-details">
            <div className="text">
              <span>Standard gif size</span>
            </div>
            <div className="resolution">
              {isMobile && (
                <Button name="edit-email" onClick={() => setShowOptions(true)}>Edit</Button>
              )}
              <ResolutionSelect onChange={handleResolutionSizeChange} defaultValue={user?.resolution} setShowOptions={setShowOptions} showOptions={showOptions} />
            </div>
          </Box>
          <Box className="upload-logo-details">
            <LogoUploadForm userLogoSrc={userLogoSrc} setUser={setUser} isMobile={isMobile} />
            {userLogoSrc && (
              <LightTooltip title="Remove logo">
                <IconButton onClick={handleOnDeleteLogo}>
                  <DeleteIcon />
                </IconButton>
              </LightTooltip>
            )}
          </Box>
          {userLogoSrc && (
            <Box className="checkbox">
              <div>Use logo as last frame of gifs</div>
              <Checkbox onChange={handleOnChangeCheckbox} checked={checked} />
            </Box>
          )}
        </Box>
        <Box className="delete-account">
          <Button onClick={handleOnClickDeleteAccount}>Delete Account</Button>
        </Box>
    </div>
  );
}

export default Profile;
