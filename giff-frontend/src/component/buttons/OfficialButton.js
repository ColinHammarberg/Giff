import React from 'react';
import './OfficialButton.scss';
import { Button } from '@mui/material';

const OfficialButton = ({variant, label, onClick, isProcessing, className}) => {
    
    function handleOnClickButton() {
        if (onClick) {
            onClick();
        }
    }
    return (
        <Button className={`official-btn ${variant} ${className}`} onClick={handleOnClickButton} disabled={isProcessing} >
            {isProcessing ? 'Processing...' : label}
        </Button>
    )
}

export default OfficialButton;