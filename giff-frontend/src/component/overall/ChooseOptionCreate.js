import React, { useState } from 'react';
import './ChooseOptionCreate.scss';
import Header from './Header';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import OfficialButton from '../buttons/OfficialButton';
import useMobileQuery from '../../queries/useMobileQuery';
import Tutorials from '../learn/Tutorials';
import useFetchUser from '../../queries/useUserDataQuery';

function ChooseOptionCreate() {
  const navigate = useNavigate();
  const { isMobile } = useMobileQuery();
  const [displayTutorial, setDisplayTutorial] = useState(false);
  const { user } = useFetchUser();

  function handleOnClickRequestDemo() {
    const email = 'hello@gif-t.io';
    const subject = encodeURIComponent('Request for Demo');
    const emailBody = encodeURIComponent(
      "Hello, I'm interested in a demo. Please get in touch with me."
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${emailBody}`;
  }

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
          </Box>
          {!isMobile && (
            <div className="help">
              <div
                className="tutorial"
                onClick={() => setDisplayTutorial(true)}
              >
                How to use Gif-t
              </div>
              <div className="tutorial" onClick={handleOnClickRequestDemo}>
                Request a demo
              </div>
            </div>
          )}
        </Box>
        {displayTutorial && (
          <Tutorials
            userEmail={user?.email}
            setDisplayTutorial={setDisplayTutorial}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ChooseOptionCreate;
