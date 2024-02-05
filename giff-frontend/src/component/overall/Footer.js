import { Box } from '@mui/material';
import React from 'react';
import './Footer.scss';

function Footer() {
  return (
    <Box className="footer-container">
      <Box className="gift">© Gif-t, 2024</Box>
      <Box
        className="rights"
        onClick={() => window.open('https://gif-t.io/rights-privacy-1')}
      >
        Rights & privacy
      </Box>
    </Box>
  );
}

export default Footer;
