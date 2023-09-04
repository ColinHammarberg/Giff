import React, { useState } from 'react';
import './MenuButton.scss';
import { Button } from '@mui/material';
import MenuPopOver from './MenuPopOver';
import { useNavigate } from 'react-router-dom';

function MenuButton() {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();


    const onClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    function handleNavigation(url) {
      navigate(`/${url}`)
    }
  
    const onClosePopup = () => {
      setAnchorEl(null);
      console.log('anchor clicked')
    };
    return (
        <>
            <div>
                <Button className={`menu-btn ${anchorEl && 'hide'}`} onClick={onClick}>Menu</Button>
            </div>
            <MenuPopOver anchorEl={anchorEl} onClosePopup={onClosePopup} handleNavigation={handleNavigation} />
        </>
    )
}

export default MenuButton;