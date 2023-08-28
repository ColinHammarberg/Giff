import React, { useState } from 'react';
import '../App.css'
import GifGenerator from './GifGenerator';
import { Box, Button } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import axios from 'axios';
import GeneratedGif from './GeneratedGif';
import './GifLanding.scss';

function GifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [generatedGifUrl, setGeneratedGifUrl] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleOnChangeUrl(value) {
    if (!value.startsWith("https://")) {
        value = "http://" + value
    }
    setUrl(value);
    console.log('url', value);
  }

  const generateGif = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://127.0.0.1:5000/generate-gif', {url});
      console.log('response', response);
      if (response.data.message === 'GIF generated successfully') {
        setGeneratedGifUrl(Gif);
        setIsLoading(false);
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
    <div className="gif-landing">
      {isLoading || gifGenerated ? (
          <GeneratedGif gifGenerated={gifGenerated} isLoading={isLoading} onDownload={handleDownloadClick} />
        ) : (
          <GifGenerator onChange={handleOnChangeUrl} gifGenerated={gifGenerated} />
        )
        }
        {!isLoading && (
            <Box className="btn-content">
                {!gifGenerated && (
                    <Button className="action-btn" onClick={generateGif}>Create GIF</Button>
                )}
            </Box>
        )}
        {!isLoading && (
            <Box className="">
                {gifGenerated ? (
                    <Box className="go-back-content">
                        Wand to create another gif? <span className="back-btn" onClick={() => {setGifGenerated(null)}}>Go back to home page here</span>
                    </Box>
                ) : (
                    <Box className="go-back-content">
                        [number of] gifs already created 
                    </Box>
                )
                }
            </Box>
        )}
    </div>
  )
}

export default GifLanding;
