import React, { useState } from 'react';
import './MenuButton.scss';
import MenuIcon from '@mui/icons-material/Menu';
import { Button, IconButton } from '@mui/material';
import MenuPopOver from './MenuPopOver';
import { useNavigate } from 'react-router-dom';
import useMobileQuery from '../../queries/useMobileQuery';

function MenuButton() {
    const [anchorEl, setAnchorEl] = useState(null);
    const { isMobile } = useMobileQuery();
    const navigate = useNavigate();

    const onClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    function handleNavigation(url, isExternal) {
      if (isExternal) {
        window.open(url, '_blank');
      } else {
        navigate(`/${url}`)
      }
    }

    async function handleOnClickSignOut() {
      try {
        // Remove JWT and user state
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        // Redirect to login page
        navigate('/');
      } catch (error) {
        console.log('Signout error', error);
      }
    }

    function handleOnClickSignIn() {
      navigate('/');
    }
  
    const onClosePopup = () => {
      setAnchorEl(null);
      console.log('anchor clicked')
    };
    return (
        <>
            <div>
              {isMobile ? (
                <IconButton className={`${anchorEl && 'hide'}`} onClick={onClick}>
                  <MenuIcon />
                </IconButton>
              ) : (
                <Button className={`menu-btn ${anchorEl && 'hide'}`} onClick={onClick}>Menu</Button>
              )}
            </div>
            <MenuPopOver 
              anchorEl={anchorEl} 
              onClosePopup={onClosePopup} 
              handleNavigation={handleNavigation} 
              handleOnClickSignOut={handleOnClickSignOut}
              handleOnClickSignIn={handleOnClickSignIn} 
            />
        </>
    )
}

export default MenuButton;