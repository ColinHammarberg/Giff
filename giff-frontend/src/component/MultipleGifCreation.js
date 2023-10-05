import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import MultipleGifGenerator from './MultipleGifGenerator';
import './GifLanding.scss';
import GifError from './GifError';
import { DownloadFolder, GenerateMultipleGifs, GenerateMultiplePdfGifs } from '../endpoints/Apis';
import MultipleGeneratedGifs from './MultipleGeneratedGifs';

function MultipleGifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateNames, setDuplicateNames] = React.useState({});
  const [urlList, setUrlList] = useState([
    { name: '', url: '' },
    { name: '', url: '' },
  ]);

  const generateMultipleGifs = async () => {
    console.log('duplicateNames', duplicateNames);
    if (Object.values(duplicateNames).some(value => value === true)) {
      return;
    } else {
        try {
          setIsLoading(true);
          // Determine the GIF type (PDF or regular)
          const sanitizedUrlList = urlList.map((item) => ({
            url: item.url.startsWith('http://') || item.url.startsWith('https://')
              ? item.url
              : `https://${item.url}`,
            name: item.name,
          }));
      
          // Determine the GIF type (PDF or regular)
          const isPdf = sanitizedUrlList.some((item) => item.url.endsWith('.pdf'));
          const gifData = sanitizedUrlList.map((item) => ({ url: item.url, name: item.name }));

          let response;
          
          if (isPdf) {
            // Filter URLs that are PDFs
            const pdfUrls = gifData.filter((item) => item.url.endsWith('.pdf'));
            response = await GenerateMultiplePdfGifs(pdfUrls);
          } if (gifData) {
            // Filter URLs that are not PDFs
            const nonPdfUrls = gifData.filter((item) => !item.url.endsWith('.pdf'));
            response = await GenerateMultipleGifs(nonPdfUrls);
          }
          console.log('response', response);
        
          if (response.data.error) {
            const errorMessage = response.data.error;
            if (errorMessage.includes("Invalid scroll height")) {
              setError('height error');
            } else if (errorMessage.includes("video")) {
                setError('video error');
            } else {
                setError('general error');
            }
          } else if (response.data.message === 'GIFs generated successfully for all URLs') {
            setGifGenerated(true);
          }
          setIsLoading(false);
        } catch (error) {
          setError('general error');
          setIsLoading(false);
        }
      }
  };

  async function handleDownloadClick() {
    if (gifGenerated) {
      try {
        const response = await DownloadFolder(); // Make sure DownloadFolder sets responseType to 'blob'
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = 'your-gift-bag.zip';
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading ZIP file:', error);
      }
    }
  }
  

  const handleKeyPressGenerateGif = (event) => {
    if (event.key === 'Enter') {
      generateMultipleGifs();
    }
  };

  if (error) {
    return (
      <div className="gif-landing">
        <GifError setGifGenerated={setGifGenerated} variant={error} setError={setError} />
      </div>
    );
  }

  return (
    <div className="gif-landing">
      {isLoading || gifGenerated ? (
        <MultipleGeneratedGifs
          gifGenerated={gifGenerated}
          isLoading={isLoading}
          onDownload={handleDownloadClick}
          urlList={urlList}
        />
      ) : (
        <MultipleGifGenerator
          urlList={urlList}
          setUrlList={setUrlList}
          onKeyPress={handleKeyPressGenerateGif}
          gifGenerated={gifGenerated}
          duplicateNames={duplicateNames}
          setDuplicateNames={setDuplicateNames}
        />
      )}
      {!isLoading && (
        <Box className="btn-content">
          {!gifGenerated && (
            <Button className="action-btn" onClick={generateMultipleGifs}>
              Create {urlList.length} GIFS
            </Button>
          )}
        </Box>
      )}
      {!isLoading && (
        <Box className="bottom-content">
          {gifGenerated ? (
            <Box className="go-back-content">
              Want to create another gif?{' '}
              <span className="back-btn" onClick={() => setGifGenerated(false)}>
                Go back to home page here
              </span>
            </Box>
          ) : (
            <Box className="number-of-gifs-created">
              [number of] gifs already created
            </Box>
          )}
        </Box>
      )}
    </div>
  );
}

export default MultipleGifLanding;
