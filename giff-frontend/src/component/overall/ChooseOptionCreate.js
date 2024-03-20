import React, { useState } from 'react';
import './ChooseOptionCreate.scss';
import Header from './Header';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import OfficialButton from '../buttons/OfficialButton';
import useMobileQuery from '../../queries/useMobileQuery';
import Tutorials from '../learn/Tutorials';

function ChooseOptionCreate() {
  const navigate = useNavigate();
  const { isMobile } = useMobileQuery();
  const [displayTutorial, setDisplayTutorial] = useState(false);
  
  return (
    <div className="choose-option-create">
      <Header menu />
      <div className="container">
        <Box className="choose-option-create-info">
          <Box className="container">
            <div className="title">Hey, CHAMP.</div>
            <div className="sub-title">
              do you want to create a gif or visit your gif library?{' '}
            </div>
          </Box>
          <Box className="enter-btn">
            <OfficialButton
              onClick={() => setTimeout(() => navigate('/single-gif-creation'))}
              label="Create gif"
              variant="yellow"
            />
            <OfficialButton
              onClick={() => setTimeout(() => navigate('/gif-library'))}
              label="Go to library"
              variant="pink"
            />
            {/* <OfficialButton onClick={(() => setTimeout(() => navigate('/multiple-gif-creation')))} label="Create several gifs" variant="pink" /> */}
          </Box>
          {!isMobile && (
            <div className="tutorial" onClick={() => setDisplayTutorial(true)}>
              How to use Gif-t
            </div>
          )}
        </Box>
        {displayTutorial && (
          <Tutorials setDisplayTutorial={setDisplayTutorial} />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ChooseOptionCreate;
