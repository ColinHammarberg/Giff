import React, { useState } from 'react';
import './MenuButton.scss';
import { Button } from '@mui/material';
import MenuPopOver from './MenuPopOver';

function MenuButton() {
    const [anchorEl, setAnchorEl] = useState(null);


    const onClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const onClosePopup = () => {
      setAnchorEl(null);
      console.log('anchor clicked')
    };
    return (
        <>
            <div>
                <Button className={`menu-btn ${anchorEl && 'hide'}`} onClick={onClick}>Menu</Button>
            </div>
            <MenuPopOver anchorEl={anchorEl} onClosePopup={onClosePopup} />
        </>
    )
}

export default MenuButton;