import React, { useState } from 'react';
// import _debounce from 'lodash/debounce';
import './Profile.scss';
import GifIcon from '@mui/icons-material/Gif';
import Header from '../overall/Header';
import { Box, IconButton } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import EditIcon from '@mui/icons-material/Edit';
import useFetchUser from '../../queries/useUserDataQuery';
// import { useQueryClient } from 'react-query';
// import useFetchUserLogo from '../../queries/useUserLogoQuery';
// import useMobileQuery from '../../queries/useMobileQuery';
import EditProfileComponent from './EditProfileComponent';
// import PaymentComponent from './PaymentComponent';
// import GifSettingsComponent from './GifSettingsComponent';
import LightTooltip from '../overall/LightToolTip';
import GifSettingsComponent from './GifSettingsComponent';

function Profile() {
  // const navigate = useNavigate();
  // const [anchorEl, setAnchorEl] = useState(null);
  const [changeUserDetails, setChangeUserDetails] = useState(null);
  // const { isMobile } = useMobileQuery();
  const { user } = useFetchUser(changeUserDetails);
  // const [showOptions, setShowOptions] = useState(false);
  // const { userLogoSrc } = useFetchUserLogo();
  console.log('user.include_ai', user?.include_ai);
  // const [logoChecked, setLogoChecked] = useState(user?.include_ai);

  // const [aiChecked, setAiChecked] = useState(user?.include_ai);
  const [activeComponent, setActiveComponent] = useState(null);
  // const [aiEmailChecked, setAiEmailChecked] = useState(
  //   user?.include_example_email
  // );
  // const isActive = user?.is_active;

  const handleActionClick = (action) => {
    switch (action) {
      case 'Edit profile':
        setActiveComponent(
          <EditProfileComponent
            user={user}
            setActiveComponent={setActiveComponent}
            setChangeUserDetails={setChangeUserDetails}
          />
        );
        break;
      // case 'Payment':
      //   setActiveComponent(<PaymentComponent />);
      //   break;
      case 'GIF settings':
        setActiveComponent(
          <GifSettingsComponent
            user={user}
            setActiveComponent={setActiveComponent}
            setChangeUserDetails={setChangeUserDetails}
          />
        );
        break;
      default:
        setActiveComponent(null);
    }
  };

  // const handleResolutionSizeChange = _debounce(async (value) => {
  //   if (value) {
  //     try {
  //       const response = await SaveUserResolution(value);
  //       if (response.data.status === 'Settings updated successfully') {
  //         setChangeUserDetails(value);
  //         showNotification('success', 'Yay! You now have a new standard size.');
  //       }
  //     } catch (e) {
  //       showNotification(
  //         'error',
  //         'Successfully updated your resolution for your gifs'
  //       );
  //     }
  //   }
  //   console.log('value2', value);
  // }, 400);

  // const handleOnDeleteLogo = async () => {
  //   const { hasConfirmed } = await DeleteProfileDialog.show();
  //   console.log('hasConfirmed', hasConfirmed);
  //   if (!hasConfirmed) {
  //     return;
  //   } else {
  //     try {
  //       const response = await DeleteUserLogo();
  //       if (response.data) {
  //         setChangeUserDetails(response.data);
  //         sessionStorage.removeItem('userLogoItem');
  //         const userData = sessionStorage.getItem('user');
  //         if (userData) {
  //           const parsedUserData = JSON.parse(userData);
  //           parsedUserData.userLogoSrc = null;
  //           sessionStorage.setItem('user', JSON.stringify(parsedUserData));
  //         }

  //         showNotification('success', 'Successfully deleted your logo');
  //       }
  //     } catch (error) {
  //       showNotification('error', 'Failed to delete your logo');
  //     }
  //   }
  // };

  const profileActions = [
    { label: 'Edit profile', icon: <EditIcon /> },
    {
      label: 'Payment',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 16 16"
        >
          <path
            fill="currentColor"
            d="M3.5 3A2.5 2.5 0 0 0 1 5.5V6h14v-.5A2.5 2.5 0 0 0 12.5 3zM15 7H1v3.5A2.5 2.5 0 0 0 3.5 13h9a2.5 2.5 0 0 0 2.5-2.5zm-4.5 3h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1"
          ></path>
        </svg>
      ),
      disabled: true,
      toolTipMessage: 'Currently Gif-t is 100% free.',
    },
  ];

  const settingsActions = [{ label: 'GIF settings', icon: <GifIcon /> }];

  return (
    <div className="profile">
      <Header menu />
      <Box className="title">Profile</Box>
      {activeComponent ? (
        // Render the active component if it's set
        <div className="active-component">{activeComponent}</div>
      ) : (
        <div className="wrapper">
          <Box className="profile-actions">
            <div className="category-header">Profile</div>
            {profileActions.map((item) => (
              <LightTooltip
                title={item.toolTipMessage}
                disableHoverListener={!item.disabled}
                placement="top"
              >
                <div
                  className={`action-box ${item.disabled ? 'disabled' : ''}`}
                  onClick={() => handleActionClick(item.label)}
                >
                  <div className="left">
                    <div className="icon">{item.icon}</div>
                    <div className="label">{item.label}</div>
                  </div>
                  <div className="right">
                    <IconButton>
                      <KeyboardArrowRightIcon />
                    </IconButton>
                  </div>
                </div>
              </LightTooltip>
            ))}
            <div className="category-header">Settings</div>
            {settingsActions.map((item) => (
              <div
                className="action-box"
                onClick={() => handleActionClick(item.label)}
              >
                <div className="left">
                  <div className="icon">{item.icon}</div>
                  <div className="label">{item.label}</div>
                </div>
                <div className="right">
                  <IconButton>
                    <KeyboardArrowRightIcon />
                  </IconButton>
                </div>
              </div>
            ))}
          </Box>
        </div>
      )}
    </div>
  );
}

export default Profile;
