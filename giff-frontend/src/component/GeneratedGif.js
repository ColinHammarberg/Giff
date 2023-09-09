import React from 'react';
import { Box, Button } from '@mui/material';
import './GeneratedGif.scss';
import CircularWithValueLabel from './Loading';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, onDownload, generatedGifUrl } = props;

  const navigate = useNavigate();

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
            {gifGenerated && <img src={generatedGifUrl} alt="Generated GIF" />}
          </Box>
          <Box className="generated-gif-btn-box">
            <Button className="btn download" onClick={onDownload}>Download GIF</Button>
            <Button className="btn share" onClick={() => navigate('send-email')}>Share in email</Button>
            <Button className="btn share-else-where" onClick={() => navigate('send-email')}>Share gif elsewhere</Button>
          </Box>
        </>
      )
    }
    </div>
  );
}

export default GeneratedGif;
