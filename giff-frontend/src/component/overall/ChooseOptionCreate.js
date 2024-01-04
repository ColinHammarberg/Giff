import React from 'react';
import './ChooseOptionCreate.scss';
import Header from './Header';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InfoButton from './InfoButton';
import useMobileQuery from '../../queries/useMobileQuery';
import Footer from './Footer';
import OfficialButton from '../buttons/OfficialButton';
import useFetchUser from '../../queries/useUserDataQuery';

function ChooseOptionCreate() {
  const navigate = useNavigate();
  const { isMobile } = useMobileQuery();
  const { user } = useFetchUser();

  console.log('user', user);
  const infoButtonText = [
    {
      text: 'Create several gifs at once to download a catalog of gifs to share. It’s an awesome way to save time if you have a couple of pages, blog posts or whitepapers that you want to share with different people.',
    },
    {
      text: 'Create one gif if you have something specific you want to share with someone right away. If you want, our friendly AI Mrs. Gif-t can even help you with your emails.',
    },
  ];
  return (
    <div className="choose-option-create">
      <Header menu />
      <div className="container">
        <Box className="choose-option-create-info">
          <Box className="container">
            <div className="title">Hey, CHAMP.</div>
            <div className="sub-title">
              do you want to create a gif or visit your gif library?{' '}
              {!isMobile && <InfoButton infoButtonText={infoButtonText} />}
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
        </Box>
      </div>
      <Footer />
    </div>
  );
}

export default ChooseOptionCreate;
