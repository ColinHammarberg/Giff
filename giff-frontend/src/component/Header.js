import { Box } from '@mui/material';
import React from 'react';
import './Header.scss';
import MenuButton from './MenuButton';
import { useNavigate } from 'react-router-dom';
import DesktopLogo from '../resources/gif_logo_desktop.gif'
import MobileLogo from '../resources/gif_logo_mobile.gif'
import useMobileQuery from '../queries/useMobileQuery';
import giftUser from '../access/GiftUser';

function Header({ menu }) {
    const navigate = useNavigate();
    const { isMobile } = useMobileQuery();
    function navigateUser() {
        if (giftUser.isLoggedIn()) {
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