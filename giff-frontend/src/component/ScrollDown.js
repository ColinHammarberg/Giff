import { Box } from '@mui/material';
import React from 'react';
import Content from '../resources/content.png';
import './ScrollDown.scss';

function ScrollDown({ onClick }) {
    return (
        <Box className="spinner-box">
            <img onClick={onClick} src={Content} alt="" />
        </Box>
    )
}

export default ScrollDown;