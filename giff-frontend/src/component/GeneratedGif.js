import React from 'react';
import { Box, Button } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import './GeneratedGif.scss';
import CircularWithValueLabel from './Loading';
import Header from './Header';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, onDownload } = props;

  return (
    <div className="generated-gif">
      <Header />
      {isLoading ? (
        <Box className="loading-container">
          <CircularWithValueLabel />
          Creating your gif...
        </Box>
      ) : (
        <>
          <Box className="gif">
            {gifGenerated && <img src={Gif} alt="Generated GIF" />}
          </Box>
          <Box className="generated-gif-btn-box">
            <Button className="btn download" onClick={onDownload}>Download GIF</Button>
            <Button className="btn share">Share in email</Button>
          </Box>
        </>
      )
    }
    </div>
  );
}

export default GeneratedGif;
