import React from 'react';
import './Landing.scss';
import Header from './Header';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  return (
    <>
        <div className="landing">
            <Header generator />
            <Box className="landing-info">
                <Box className="container">
                    <div className="title">
                        Gif-t
                    </div>
                    <div className="sub-title">
                        Give the perfect gif
                    </div>
                </Box>
                <Box className="enter-btn">
                    <Button onClick={() => setTimeout(() => navigate('/single-gif-creation'), 2000)}>Create your gif now</Button>
                </Box>
            </Box>
        </div>
    </>
  );
}

export default Landing;
