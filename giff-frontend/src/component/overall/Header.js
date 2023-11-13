import { Box } from '@mui/material';
import React from 'react';
import './Header.scss';
import MenuButton from './MenuButton';
import { useNavigate } from 'react-router-dom';
import DesktopLogo from '../../resources/gif_logo_desktop.gif'
import MobileLogo from '../../resources/gif_logo_mobile.gif'
import useMobileQuery from '../../queries/useMobileQuery';

function Header({ menu }) {
    const navigate = useNavigate();
    const { isMobile } = useMobileQuery();
    const access_token = localStorage.getItem('access_token');

    function navigateUser() {
        if (access_token) {
            return navigate('/choose-option-create')
        }
    }
    return (
        <Box className="header-content">
            <div className='header-text'>
                <div className="header" onClick={navigateUser}><img src={isMobile ? MobileLogo : DesktopLogo} alt="Gif-t" /></div>
            </div>
            {menu && (
                <MenuButton />
            )}
        </Box>
    )
}

export default Header;