import { Box } from '@mui/material';
import React from 'react';
import './Header.scss';
import Menu from './Menu';

function Header({ generator }) {
    console.log('generator', generator);
    return (
        <Box className="header-content">
            <div className='header-text'>
                <div className="header">Gif-t</div>
                <div className="sub-header">Give the perfect gif</div>
            </div>
                <Menu />
        </Box>
    )
}

export default Header;