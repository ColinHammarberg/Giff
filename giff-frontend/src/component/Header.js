import { Box } from '@mui/material';
import React from 'react';
import './Header.scss';
import MenuButton from './MenuButton';
import { useNavigate } from 'react-router-dom';

function Header({ menu }) {
    const navigate = useNavigate();
    return (
        <Box className="header-content">
            <div className='header-text'>
                <div className="header" onClick={() => navigate('/')}>Gif-t</div>
            </div>
            {menu && (
                <MenuButton />
            )}
        </Box>
    )
}

export default Header;