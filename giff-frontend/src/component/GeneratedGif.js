import React from 'react';
import { Box } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import './GeneratedGif.scss';

function GeneratedGif(props) {
  const { gifGenerated } = props;

  return (
    <div className="generated-gif">
      <Box className="header-content">
        <div className="header">Gif-t</div>
        <div className="sub-header">Give the perfect gif</div>
      </Box>
      <Box className="gif">
        {gifGenerated && <img src={Gif} alt="Generated GIF" />}
      </Box>
    </div>
  );
}

export default GeneratedGif;
