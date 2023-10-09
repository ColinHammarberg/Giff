import React, { useState } from 'react';
import './MenuButton.scss';
import MenuIcon from '@mui/icons-material/Menu';
import { Button, IconButton } from '@mui/material';
import MenuPopOver from './MenuPopOver';
import { useNavigate } from 'react-router-dom';
import useMobileQuery from '../queries/useMobileQuery';

function MenuButton() {
    const [anchorEl, setAnchorEl] = useState(null);
    const { isMobile } = useMobileQuery();
    const access_token = localStorage.getItem('access_token');
    const navigate = useNavigate();

    const onClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    function handleNavigation(url) {
      navigate(`/${url}`)
    }

    async function handleOnClickSignOut() {
      try {
        // Remove JWT and user state
        localStorage.removeItem('access_token');
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
              access_token={access_token} 
              handleOnClickSignOut={handleOnClickSignOut}
              handleOnClickSignIn={handleOnClickSignIn} 
            />
        </>
    )
}

export default MenuButton;