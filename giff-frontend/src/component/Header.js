import { Box } from '@mui/material';
import React from 'react';
import './Header.scss';
import MenuButton from './MenuButton';

function Header({ generator }) {
    console.log('generator', generator);
    return (
        <Box className="header-content">
            <div className='header-text'>
                <div className="header">Gif-t</div>
                <div className="sub-header">Give the perfect gif</div>
            </div>
                <MenuButton />
        </Box>
    )
}

export default Header;