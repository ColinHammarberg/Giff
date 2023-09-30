import React, { useState } from 'react';
import './MenuButton.scss';
import MenuIcon from '@mui/icons-material/Menu';
import { Button, IconButton } from '@mui/material';
import MenuPopOver from './MenuPopOver';
import { useNavigate } from 'react-router-dom';
import useMobileQuery from '../queries/useMobileQuery';
import { Signout } from '../endpoints/Apis';

function MenuButton() {
    const [anchorEl, setAnchorEl] = useState(null);
    const { isMobile } = useMobileQuery();
    const sessionId = localStorage.getItem('sessionId');
    const navigate = useNavigate();


    const onClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    function handleNavigation(url) {
      navigate(`/${url}`)
    }

    async function handleOnClickSignOut() {
      await Signout();
      localStorage.removeItem('sessionId');
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
            <MenuPopOver anchorEl={anchorEl} onClosePopup={onClosePopup} handleNavigation={handleNavigation} 
              sessionId={sessionId} handleOnClickSignOut={handleOnClickSignOut} 
            />
        </>
    )
}

export default MenuButton;