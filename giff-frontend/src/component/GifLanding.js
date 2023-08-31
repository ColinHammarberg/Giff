import React, { useState } from 'react';
import '../App.css'
import GifGenerator from './GifGenerator';
import { Box, Button } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import GifPdf from '../gifs/pdf_animation.gif';
import axios from 'axios';
import GeneratedGif from './GeneratedGif';
import './GifLanding.scss';
import GifError from './GifError';

function GifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [generatedGifUrl, setGeneratedGifUrl] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  
      const endpoint = url.endsWith('.pdf') ? 'generate-pdf-gif' : 'generate-gif';
      const response = await axios.post(`http://127.0.0.1:5000/${endpoint}`, { url });
  
      if (response.data.error) {
        console.error('Error generating GIF:', response.data.error);
        setError(response.data.error);
      } else if (response.data.message === 'GIF generated successfully') {
        const generatedGifUrl = url.endsWith('.pdf') ? GifPdf : Gif;
        console.log('generatedGifUrl', generatedGifUrl);
        setGeneratedGifUrl(generatedGifUrl);
        setGifGenerated(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating GIF:', error);
      setIsLoading(false);
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

  if (error) {
    return (
      <div className="gif-landing">
        <GifError setGifGenerated={setGifGenerated} setError={setError} />
      </div>
    )
  }

  return (
    <div className="gif-landing">
      {isLoading || gifGenerated ? (
          <GeneratedGif gifGenerated={gifGenerated} generatedGifUrl={generatedGifUrl} isLoading={isLoading} onDownload={handleDownloadClick} />
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
            <Box className="bottom-content">
                {gifGenerated ? (
                    <Box className="go-back-content">
                        Want to create another gif? <span className="back-btn" onClick={() => {setGifGenerated(null)}}>Go back to home page here</span>
                    </Box>
                ) : (
                    <Box className="number-of-gifs-created">
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
