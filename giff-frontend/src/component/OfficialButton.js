import React from 'react';
import './OfficialButton.scss';
import { Button } from '@mui/material';

const OfficialButton = ({variant, label, onClick}) => {
    function handleOnClickButton() {
        if (onClick) {
            onClick();
        }
    }
    return (
        <Button className={`official-btn ${variant}`} onClick={handleOnClickButton}>
            {label}
        </Button>
    )
}

export default OfficialButton;