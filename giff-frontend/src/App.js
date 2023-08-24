import React, { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import axios from 'axios';
import Gif from './gifs/scrolling_animation.gif'
import './App.css'

function App() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [generatedGifUrl, setGeneratedGifUrl] = useState('');
  const [url, setUrl] = useState('');

  const generateGif = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/generate-gif', {url});
      console.log('response', response);
      if (response.data.message === 'GIF generated successfully') {
        setGeneratedGifUrl(Gif);
        setGifGenerated(true);
      }
    } catch (error) {
      console.error('Error generating GIF:', error);
    }
  };

  function handleDownloadClick() {
    if (gifGenerated) {
      // Create a virtual anchor element and trigger the download
      const link = document.createElement('a');
      link.href = generatedGifUrl; // Use the actual URL here
      link.target = '_blank';
      link.download = 'generated_gif.gif';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function handleOnChangeUrl(event) {
    setUrl(event?.target?.value)
  }

  return (
    <div className="App">
      <Box className="header-content">
        <div className="header">Gif-t</div>
        <div className="sub-header">Give the perfect gif</div>
      </Box>
      <Box className="text-field-content">
        <div className="text-field-header">Add any* url</div>
        <TextField onChange={(event) => handleOnChangeUrl(event)} />
      </Box>
      <Box className="btn-content">
        <Button className="action-btn" onClick={generateGif}>Create GIF</Button>
        {gifGenerated && <Button className="action-btn" onClick={handleDownloadClick}>Download GIF</Button>}
      </Box>
      <div className="gifs">
        {gifGenerated && <img src={Gif} alt="Generated GIF" />}
      </div>
    </div>
  );
}

export default App;
