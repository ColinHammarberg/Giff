import React, { useState } from 'react';
import './App.css'
import GifGenerator from './component/GifGenerator';
import { Box, Button } from '@mui/material';
import Gif from './gifs/scrolling_animation.gif';
import axios from 'axios';
import GeneratedGif from './component/GeneratedGif';

function App() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [generatedGifUrl, setGeneratedGifUrl] = useState('');
  const [url, setUrl] = useState('');

  function handleOnChangeUrl(value) {
    setUrl(value);
    console.log('url', value);
  }

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
  return (
    <div className="App">
      {gifGenerated ? (
          <GeneratedGif gifGenerated={gifGenerated} />
        ) : (
          <GifGenerator onChange={handleOnChangeUrl} gifGenerated={gifGenerated} />
        )
        }
      <Box className="btn-content">
        {gifGenerated ? (
          <Box className="generated-gif-btn-box">
            <Button className="btn download" onClick={handleDownloadClick}>Download GIF</Button>
            <Button className="btn share" onClick={handleDownloadClick}>Share in email</Button>
          </Box>
        ): (
          <Button className="action-btn" onClick={generateGif}>Create GIF</Button>
        )
        }
      </Box>
      <Box className="go-back-content">
        WANT TO CREATE ANOTHER GIF? GO BACK TO HOME PAGE HERE
      </Box>
    </div>
  )
}

export default App;
