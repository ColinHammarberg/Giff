import { Box } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.scss';

function Footer() {
    const navigate = useNavigate();
    return (
        <Box className="footer-container">
            <Box className="gift">© Gif-t, 2023</Box>
            <Box className="rights" onClick={() => navigate('/rights-and-privacy')}>Rights & privacy</Box>
        </Box>
    )
}

export default Footer;